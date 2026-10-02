# no need to go further

Interactive silent short film for the web.

A mundane university day fractures after a young woman notices an impossible anomaly. From that moment forward, the viewer chooses where she looks, where she goes, and which version of reality survives.

## Core rules

- **No dialogue.** Meaning is carried by framing, acting, repetition, ambience and sound FX.
- **Fullscreen-first.** The browser disappears into the film after a deliberate user gesture.
- **Choices live inside the image.** No A/B buttons, cards, menus, progress bars or game HUD.
- **Every choice has a timeout.** If the viewer does nothing, the protagonist chooses and the film continues.
- **Dream logic escalates after the anomaly.** Before it: stable, repetitive, banal. After it: spatial continuity, time, identity and causality progressively fail.
- **Pre-rendered cinema, realtime interaction.** High-quality clips stay pre-rendered; the browser handles branching, preloading, sound, compositing and transitions.
- **The UI is diegetic.** Doors, mirrors, staircases, reflections, objects and gaze become controls.

## Narrative DNA

The project takes conceptual inspiration—not plot—from:
- *A Scanner Darkly*: unstable identity, observer/observed collapse, a self becoming untrustworthy.
- *Dark City*: mutable architecture, artificial memory, a city whose rules can be rearranged.
- *Donnie Darko*: ordinary adolescence invaded by temporal anomaly and recurring motifs.
- *Inception*: layered spatial logic and environments that reveal their artificial construction.
- *eXistenZ*: uncertainty about which layer is real and interfaces that feel physical rather than digital.
- *What the Bleep Do We Know!?*: perception/reality as a **fictional visual motif only**, not as a scientific claim.

## Runtime architecture

```text
scene clip
   │
   ├── preload next candidates
   │
   └── freeze/end frame
          │
          ▼
    diegetic choice layer
       ↙          ↘
   hotspot       hotspot
      │             │
      └──── timeout ┘
             │
             ▼
        next scene
```

The first implementation deliberately has no framework dependency. It is a small cinematic runtime that can later accept WebGL/Three.js scenes only where they materially improve the film.

## Structure

```
site/
  index.html
  styles.css
  src/
    app.js
    graph.js
  media/
    # final clips / stems / fx
docs/
  STORY.md
wrangler.jsonc
package.json
```

## Local

```bash
npm install
npm run dev
```

## Deploy

Static assets are configured for Cloudflare Workers:

```bash
npm run deploy
```

No paid runtime is required for the player itself. Media generation is intentionally kept outside the deployed runtime.

## Current milestone

**Vertical Slice 01**

```text
wake → commute → university → anomaly
                         ↓
                    choice 01
                   ↙         ↘
                leave       follow
                  │           │
                  └──→ bathroom
                         ↓
                    choice 02
                    mirror / stall
```

The placeholder visuals exist only to validate rhythm, fullscreen behavior, branching, timeout selection, sound unlock and transition language. Final image quality comes from the film assets, not from UI decoration.
