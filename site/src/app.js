import { SCENES, START_SCENE } from "./graph.js";

const entry = document.querySelector("#entry");
const enterButton = document.querySelector("#enter");
const experience = document.querySelector("#experience");
const surface = document.querySelector("#surface");
const film = document.querySelector("#film");
const choiceLayer = document.querySelector("#choiceLayer");
const debug = document.querySelector("#debug");

const params = new URLSearchParams(location.search);
const debugMode = params.has("debug");
const fastMode = params.has("fast");

const state = {
  currentId: null,
  history: [],
  timer: null,
  choiceTimer: null,
  choiceStartedAt: null,
  started: false,
  mediaToken: 0,
  seed: Math.floor(Math.random() * 2 ** 31)
};

if (debugMode) debug.hidden = false;

class Soundscape {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.low = null;
    this.high = null;
    this.noise = null;
    this.noiseFilter = null;
  }

  async start() {
    if (this.ctx) {
      await this.ctx.resume();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.12;
    this.master.connect(this.ctx.destination);

    this.low = this.ctx.createOscillator();
    this.low.type = "sine";
    this.low.frequency.value = 48;
    const lowGain = this.ctx.createGain();
    lowGain.gain.value = 0.032;
    this.low.connect(lowGain).connect(this.master);
    this.low.start();

    this.high = this.ctx.createOscillator();
    this.high.type = "triangle";
    this.high.frequency.value = 117;
    const highGain = this.ctx.createGain();
    highGain.gain.value = 0.004;
    this.high.connect(highGain).connect(this.master);
    this.high.start();

    const length = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.16;
    }

    this.noise = this.ctx.createBufferSource();
    this.noise.buffer = buffer;
    this.noise.loop = true;
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = "lowpass";
    this.noiseFilter.frequency.value = 950;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.026;
    this.noise.connect(this.noiseFilter).connect(noiseGain).connect(this.master);
    this.noise.start();
  }

  phase(name) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const map = {
      ordinary: [48, 117, 880, 0.11],
      anomaly: [43, 111, 620, 0.12],
      dream: [39, 103, 480, 0.13],
      deep: [34, 91, 330, 0.14],
      liminal: [29, 83, 240, 0.155],
      ending: [25, 74, 180, 0.12]
    };
    const [low, high, filter, gain] = map[name] || map.ordinary;
    this.low.frequency.exponentialRampToValueAtTime(low, t + 1.2);
    this.high.frequency.exponentialRampToValueAtTime(high, t + 1.3);
    this.noiseFilter.frequency.exponentialRampToValueAtTime(filter, t + 1.6);
    this.master.gain.linearRampToValueAtTime(gain, t + 1.1);
  }

  cue(kind = "soft") {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = kind === "choice" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(kind === "choice" ? 63 : 170, now);
    osc.frequency.exponentialRampToValueAtTime(kind === "choice" ? 41 : 72, now + 0.28);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "choice" ? 0.08 : 0.025, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.36);
  }
}

const sound = new Soundscape();

function clearTimers() {
  clearTimeout(state.timer);
  clearTimeout(state.choiceTimer);
  state.timer = null;
  state.choiceTimer = null;
}

function sceneDuration(scene) {
  if (!fastMode) return scene.durationMs;
  return Math.max(850, Math.round(scene.durationMs * 0.16));
}

function choiceDuration(scene) {
  if (!fastMode) return scene.choiceTimeoutMs || 6000;
  return 1200;
}

function seedPick(items) {
  const historyHash = state.history.reduce((acc, item) => {
    return ((acc << 5) - acc + item.choice.charCodeAt(0)) | 0;
  }, state.seed);
  const index = Math.abs(historyHash) % items.length;
  return items[index];
}

function getAutoChoice(scene) {
  if (!scene.choices?.length) return null;
  if (scene.auto === "seeded") return seedPick(scene.choices);
  return scene.choices.find((choice) => choice.id === scene.auto) || scene.choices[0];
}

function updateDebug(extra = "") {
  if (!debugMode) return;
  const scene = SCENES[state.currentId];
  const trail = state.history.map((x) => x.choice).join(" → ") || "—";
  debug.textContent = [
    `scene: ${state.currentId || "—"}`,
    `phase: ${scene?.phase || "—"}`,
    `history: ${trail}`,
    extra
  ].filter(Boolean).join("  |  ");
}

function setPointerParallax(event) {
  const x = event.clientX / innerWidth;
  const y = event.clientY / innerHeight;
  surface.style.setProperty("--mx", `${x * 100}%`);
  surface.style.setProperty("--my", `${y * 100}%`);
  surface.style.setProperty("--parallax-x", `${(x - 0.5) * -5}px`);
  surface.style.setProperty("--parallax-y", `${(y - 0.5) * -4}px`);
}

function resetChoiceLayer() {
  choiceLayer.replaceChildren();
  surface.classList.remove("is-choosing");
  surface.style.setProperty("--choice-intensity", "0");
}

function createHotspot(choice) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-hotspot";

  const [x, y, w, h] = choice.hotspot;
  Object.assign(button.style, {
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    height: `${h}%`
  });

  const label = document.createElement("span");
  label.className = "choice-hotspot__sr";
  label.textContent = choice.ariaLabel || choice.id;
  button.append(label);

  button.addEventListener("pointerenter", () => {
    sound.cue("soft");
    updateDebug(`hover: ${choice.id}`);
  });

  button.addEventListener("click", () => choose(choice, "user"));
  return button;
}

function beginChoice(scene) {
  clearTimeout(state.choiceTimer);
  resetChoiceLayer();

  surface.classList.add("is-choosing");
  surface.style.setProperty("--choice-intensity", "1");
  state.choiceStartedAt = performance.now();

  for (const choice of scene.choices) {
    choiceLayer.append(createHotspot(choice));
  }

  const duration = choiceDuration(scene);
  state.choiceTimer = setTimeout(() => {
    const choice = getAutoChoice(scene);
    if (choice) choose(choice, "auto");
  }, duration);

  updateDebug(`choice window: ${duration}ms`);
}

function choose(choice, source) {
  if (!surface.classList.contains("is-choosing")) return;

  clearTimeout(state.choiceTimer);
  state.choiceTimer = null;
  surface.classList.remove("is-choosing");
  surface.style.setProperty("--choice-intensity", "0");

  const elapsed = state.choiceStartedAt
    ? Math.round(performance.now() - state.choiceStartedAt)
    : null;

  state.history.push({
    scene: state.currentId,
    choice: choice.id,
    source,
    elapsed
  });

  sound.cue("choice");
  transitionTo(choice.target, choice.transition);
}

function transitionTo(target, transition = "cut") {
  surface.dataset.transition = transition;
  surface.classList.add("is-transitioning");

  setTimeout(() => {
    playScene(target);
  }, fastMode ? 120 : 310);

  setTimeout(() => {
    surface.classList.remove("is-transitioning");
  }, fastMode ? 260 : 650);
}

function handleSceneEnd(scene) {
  if (state.currentId !== scene.id) return;

  if (scene.choices?.length) {
    beginChoice(scene);
    return;
  }

  if (scene.terminal) {
    surface.style.setProperty("--choice-intensity", "0");
    updateDebug("terminal");
    return;
  }

  if (scene.next) {
    transitionTo(scene.next, scene.transition || "cut");
  }
}

function preloadScene(id) {
  const scene = SCENES[id];
  if (!scene?.media) return;
  const preload = document.createElement("video");
  preload.preload = "auto";
  preload.muted = true;
  preload.src = scene.media;
  preload.load();
}

function preloadNext(scene) {
  if (scene.next) preloadScene(scene.next);
  for (const choice of scene.choices || []) preloadScene(choice.target);
}

function playPlaceholder(scene) {
  surface.classList.remove("has-media");
  film.pause();
  film.removeAttribute("src");
  film.load();

  state.timer = setTimeout(() => {
    handleSceneEnd(scene);
  }, sceneDuration(scene));
}

function playMedia(scene) {
  const token = ++state.mediaToken;
  surface.classList.add("has-media");
  film.src = scene.media;
  film.currentTime = 0;

  const onEnded = () => {
    if (token !== state.mediaToken) return;
    film.removeEventListener("ended", onEnded);
    handleSceneEnd(scene);
  };

  const onError = () => {
    if (token !== state.mediaToken) return;
    film.removeEventListener("error", onError);
    surface.classList.remove("has-media");
    playPlaceholder(scene);
  };

  film.addEventListener("ended", onEnded, { once: true });
  film.addEventListener("error", onError, { once: true });

  const promise = film.play();
  if (promise?.catch) {
    promise.catch(() => {
      if (token === state.mediaToken) playPlaceholder(scene);
    });
  }
}

function playScene(id) {
  clearTimers();
  resetChoiceLayer();

  const scene = SCENES[id];
  if (!scene) throw new Error(`Unknown scene: ${id}`);

  state.currentId = id;
  surface.dataset.visual = scene.visual || scene.id;
  surface.dataset.phase = scene.phase || "ordinary";
  sound.phase(scene.phase || "ordinary");
  preloadNext(scene);
  updateDebug();

  if (scene.media) playMedia(scene);
  else playPlaceholder(scene);
}

async function enterFilm() {
  if (state.started) return;
  state.started = true;

  await sound.start();

  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    }
  } catch {
    // Fullscreen is enhancement only. The film continues if the browser denies it.
  }

  entry.animate(
    [
      { opacity: 1, filter: "blur(0px)" },
      { opacity: 0, filter: "blur(14px)" }
    ],
    { duration: 720, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" }
  );

  setTimeout(() => {
    entry.hidden = true;
    experience.hidden = false;
    playScene(START_SCENE);
  }, 520);
}

enterButton.addEventListener("click", enterFilm);
surface.addEventListener("pointermove", setPointerParallax, { passive: true });

document.addEventListener("keydown", (event) => {
  if (!state.started) {
    if (event.key === "Enter" || event.key === " ") enterFilm();
    return;
  }

  const scene = SCENES[state.currentId];
  if (!scene?.choices?.length || !surface.classList.contains("is-choosing")) return;

  const numeric = Number(event.key);
  if (numeric >= 1 && numeric <= scene.choices.length) {
    choose(scene.choices[numeric - 1], "keyboard");
  }
});
