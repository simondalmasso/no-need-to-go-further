export const SCENES = {
  wake: {
    id: "wake",
    phase: "ordinary",
    visual: "wake",
    durationMs: 6500,
    next: "commute",
    media: null
  },
  commute: {
    id: "commute",
    phase: "ordinary",
    visual: "commute",
    durationMs: 7000,
    next: "university",
    media: null
  },
  university: {
    id: "university",
    phase: "ordinary",
    visual: "university",
    durationMs: 6500,
    next: "anomaly",
    media: null
  },
  anomaly: {
    id: "anomaly",
    phase: "anomaly",
    visual: "anomaly",
    durationMs: 7200,
    media: null,
    choiceTimeoutMs: 6200,
    auto: "follow",
    choices: [
      {
        id: "leave",
        target: "reflection",
        ariaLabel: "Leave the university",
        hotspot: [0, 0, 48, 100],
        transition: "wipe"
      },
      {
        id: "follow",
        target: "corridor",
        ariaLabel: "Follow the anomaly",
        hotspot: [52, 0, 48, 100],
        transition: "tunnel"
      }
    ]
  },
  reflection: {
    id: "reflection",
    phase: "dream",
    visual: "reflection",
    durationMs: 7600,
    next: "bathroom",
    transition: "glass",
    media: null
  },
  corridor: {
    id: "corridor",
    phase: "dream",
    visual: "corridor",
    durationMs: 8200,
    next: "bathroom",
    transition: "stretch",
    media: null
  },
  bathroom: {
    id: "bathroom",
    phase: "dream",
    visual: "bathroom",
    durationMs: 7200,
    media: null,
    choiceTimeoutMs: 5600,
    auto: "stall",
    choices: [
      {
        id: "mirror",
        target: "vertical-room",
        ariaLabel: "Approach the mirror",
        hotspot: [0, 0, 58, 100],
        transition: "glass"
      },
      {
        id: "stall",
        target: "bus",
        ariaLabel: "Open the stall",
        hotspot: [58, 0, 42, 100],
        transition: "door"
      }
    ]
  },
  "vertical-room": {
    id: "vertical-room",
    phase: "deep",
    visual: "vertical-room",
    durationMs: 8500,
    next: "stairs",
    transition: "rotate",
    media: null
  },
  bus: {
    id: "bus",
    phase: "deep",
    visual: "bus",
    durationMs: 8500,
    next: "stairs",
    transition: "shutter",
    media: null
  },
  stairs: {
    id: "stairs",
    phase: "deep",
    visual: "stairs",
    durationMs: 7400,
    media: null,
    choiceTimeoutMs: 6000,
    auto: "down",
    choices: [
      {
        id: "up",
        target: "upper-archive",
        ariaLabel: "Go up",
        hotspot: [0, 0, 100, 50],
        transition: "ascend"
      },
      {
        id: "down",
        target: "lower-archive",
        ariaLabel: "Go down",
        hotspot: [0, 50, 100, 50],
        transition: "descend"
      }
    ]
  },
  "upper-archive": {
    id: "upper-archive",
    phase: "liminal",
    visual: "upper-archive",
    durationMs: 9200,
    next: "final-choice",
    transition: "bloom",
    media: null
  },
  "lower-archive": {
    id: "lower-archive",
    phase: "liminal",
    visual: "lower-archive",
    durationMs: 9200,
    next: "final-choice",
    transition: "sink",
    media: null
  },
  "final-choice": {
    id: "final-choice",
    phase: "liminal",
    visual: "final-choice",
    durationMs: 7600,
    media: null,
    choiceTimeoutMs: 7000,
    auto: "seeded",
    choices: [
      {
        id: "clock",
        target: "reset",
        ariaLabel: "Touch the clock",
        hotspot: [4, 20, 42, 65],
        transition: "blink"
      },
      {
        id: "void",
        target: "break",
        ariaLabel: "Touch the void",
        hotspot: [54, 20, 42, 65],
        transition: "collapse"
      }
    ]
  },
  reset: {
    id: "reset",
    phase: "ending",
    visual: "reset",
    durationMs: 10500,
    terminal: true,
    media: null
  },
  break: {
    id: "break",
    phase: "ending",
    visual: "break",
    durationMs: 10500,
    terminal: true,
    media: null
  }
};

export const START_SCENE = "wake";
