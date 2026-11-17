# Three-scene navigation and garden consistency

Goal: Implement approved lightweight category navigation, overview, guide and progress; harmonize garden with the two existing Three.js scenes.
Architecture: A navigation module owns persistent visited state and accessible controls. Scene and animal actions remain in main.js. Retain garden terrain and collision queries while replacing detailed materials and its separate character/render style.
Tech stack: Vite, Three.js, DOM/CSS.

- [x] Add navigation module, fixed category dock, help dialog, overview action, session-independent local progress with safe storage fallback.
- [x] Wire animal selection, panel closure and scene changes to shared navigation state; keep grassland animal appearance.
- [x] Harmonize garden terrain materials, lighting, camera scale and character; retain pond reflections, hills, snails and movement constraints.
- [x] Build and run terrain tests; manually inspect browser category selection, guide dismissal, overview and scene transitions.
