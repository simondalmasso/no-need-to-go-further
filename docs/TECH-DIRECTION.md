# Technical direction

## Principle

The deployed experience must feel like a film, not a component showcase.

Libraries are accepted only when they make the *cinematic language* possible. Anything that adds visible product UI, dependency weight, API cost, or operational fragility without improving the film stays out.

## Use now

### Native HTML video + Web Audio + CSS compositing
Core runtime. Lowest friction, zero backend requirement, precise timing, easy fullscreen, easy media preloading.

### Three.js — later, surgically
Use only for shots that cannot be convincingly pre-rendered:
- impossible corridor parallax;
- depth behind a mirror;
- geometry that folds around the pointer;
- subtle 3D displacement during a choice hold;
- one or two “reality breaks”.

Do **not** render the whole film in Three.js.

### Seijaku — interaction reference
Useful as a reference for continuous movement, Web Audio ambience, and a browser experience that makes interaction feel spatial instead of app-like.

### OpenMontage — offline production pipeline
Useful outside the deployed site for:
- shot lists;
- reference-video decomposition;
- generated/stock clip assembly;
- FFmpeg/Remotion finishing;
- repeatable production recipes.

The site receives finished clips. It does not carry OpenMontage at runtime.

## Useful later

### Motion-Primitives / oil-motion / 60fps.design / Motion references
Use as motion-study references only. Reimplement the tiny pieces needed for transitions and microfeedback. The viewer should never perceive a design-system component.

### VIGA
Potentially useful in pre-production if a specific shot needs inverse-graphics reconstruction or Blender scene matching. Not suitable for browser runtime: its documented 3D workflow expects Conda/Blender, recommends CUDA, and its tool setup can require model API keys.

### Hunyuan3D WorldClaw
Conceptually aligned with impossible generated spaces, but currently parked. The public repository primarily exposes the paper/project material; it is not a production-ready dependency for this project.

## Reject for core runtime

- component galleries as dependencies;
- admin/dashboard kits;
- icon packs (the film should barely need icons);
- remote inference in the viewing loop;
- uncertain third-party API keys or credits;
- large 3D frameworks for scenes already better served by video;
- generative video at playback time.

## Media strategy

1. Story graph is deterministic and versioned.
2. Each scene has a canonical clip plus optional branch variants.
3. Browser preloads only reachable next nodes.
4. Audio can be split into WORLD / BODY / ANOMALY stems when branch-sensitive mixing matters.
5. Expensive generation happens offline.
6. Final deliverable targets stable H.264/AV1/WebM combinations based on browser testing.

## Performance budget

- first meaningful frame before downloading deep-branch media;
- no branch should download media that is unreachable from the current node;
- choice state must never wait on network;
- fallback to the current held frame if next clip is late;
- no runtime AI dependency required to finish the film.
