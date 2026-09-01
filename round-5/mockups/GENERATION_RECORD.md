# Round 5 V2 Oracle Generation Record

## Status

**APPROVED — 2026-09-01**

The two PNGs in this folder are the frozen Round 5A visual oracles. They are design references only and must not be used as runtime textures.

## Tool and mode

- Tool: Codex built-in image generation
- Mode: built-in generation for desktop and first portrait; built-in precise-object edit for the final portrait
- Generator model identifier: not exposed by the built-in tool
- Visual interpreter: native image view
- Capture normalization: references are rendered into the frozen 1440×900 and 390×844 comparison viewports with `round-5/harness/capture-reference-review.mjs`

## Approved files

| File | Native dimensions | Comparison viewport | SHA-256 |
| --- | ---: | ---: | --- |
| `desktop-reference-v2.png` | 1586×992 | 1440×900 | `2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d` |
| `portrait-reference-v2.png` | 852×1846 | 390×844 | `750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547` |

Both native images are within 0.2 percent of their target viewport aspect ratio. The comparison harness normalizes them without changing the frozen source files.

## Exact desktop prompt

```text
Use case: ui-mockup
Asset type: frozen desktop gameplay oracle for the Round 5 controlled HAIO experiment
Primary request: Create a clean 1440×900 gameplay mockup for a browser-based procedural Three.js space game.
Scene/backdrop: Fixed-yaw, slightly oblique tactical camera over a near-black navy space sector with a faint navy navigation grid, layered stars, sparse world-anchored debris, and restrained blue haze. Space is dark, but the interactive world is clearly lit.
Subject: Place a cyan/teal multi-primitive player corvette near center at about 10% of viewport height. Give it a recognizable forward nose, wings, cockpit, twin orange engines, and visible height. Place four coral/red hostile ships near the safe perimeter with related faction language but distinct multi-part silhouettes. Include a steel/teal ring station that is visible but not dominant, one warm neutral courier, one amber beacon, one warm-gray wreck with green salvage glow, and several small magnetic pickups.
Style/medium: polished procedural low-poly 3D browser-game gameplay mockup, feasible with boxes, cones, cylinders, toruses, spheres, rings, and low-poly shards using Three.js primitives and TSL materials; not photorealistic.
Composition/framing: 1440×900 landscape gameplay frame. Player is the immediate visual subject. Station occupies no more than about 10–12% of the frame. Preserve useful negative space and readable depth.
Lighting/mood: cool directional key, soft neutral or blue-green fill, restrained warm rim, readable medium-value hull bases, restrained emissive engines, weapon ports, station rings, beacon, pickups, and faction accents. No important hull face collapses into black.
Color palette: near-black navy background, cyan/teal player, coral/red hostiles, steel/teal station, sand/amber neutral vessel, warm-gray wreck, amber/pale-blue beacon, compact green/cyan pickup glow.
Text/UI: compact edge HUD only: player hull and credits at upper left, small target status at upper right, small radar, virtual joystick at lower left, and two short event lines near an edge. Use minimal legible placeholder labels; visual hierarchy matters more than exact text.
Constraints: no permanent fire button; no giant center panels; no uniform capsule ships; no clipped UI; no watermark; no logos; no dense typography; no painted textures; no HUD brighter or more detailed than the world; player must remain recognizable at 25% thumbnail size and in grayscale; object classes must remain separable by silhouette and value.
```

## Exact portrait generation prompt

The approved desktop image was supplied as Image 1.

```text
Use case: ui-mockup
Asset type: frozen portrait gameplay oracle for the Round 5 controlled HAIO experiment
Input images: Image 1 is the approved desktop art-direction reference. Preserve its ship designs, station design, low-poly procedural style, faction language, lighting, materials, palette, and HUD visual language.
Primary request: Recompose that exact desktop gameplay direction for a 390×844 portrait mobile viewport.
Scene/backdrop: Keep the fixed-yaw slightly oblique tactical camera, near-black navy space, faint navigation grid, layered stars, world-anchored debris, and restrained blue haze.
Subject: Keep the cyan/teal player corvette near center at about 10% of viewport height and make it the immediate subject. Keep the same steel/teal ring station visible but non-dominant. Preserve at least two coral/red hostile contacts, the warm neutral courier, amber beacon, warm-gray wreck with green salvage glow, and several readable pickup tokens without crowding.
Style/medium: polished procedural low-poly 3D browser-game gameplay mockup feasible with Three.js primitives and TSL materials; same style as Image 1; not photorealistic.
Composition/framing: tall 390×844 portrait gameplay frame with central playfield unobstructed. Station must not collide with HUD. Preserve readable depth and negative space.
Lighting/mood: retain the desktop cool key, soft neutral/blue-green fill, restrained warm rim, medium-value hulls, and controlled emissive accents. No important hull face collapses into black.
Text/UI: compact hull/credits at upper left edge, compact target status at upper right edge, two or three short event lines near an edge, a virtual joystick at lower left, a small radar at lower right, and only small secondary controls elsewhere.
Constraints: no permanent fire button; no overlap or clipping; no giant panels; no crushed-black ships; no empty featureless space; no capsule ships; no watermark; no logos; no dense typography; no HUD brighter than the world; preserve the exact desktop art direction rather than inventing a second design; player must remain recognizable at thumbnail size and in grayscale.
```

## Desktop scale calibration

The initial desktop player exceeded the brief’s preferred size band. One bounded edit reduced only the player scale and produced the selected desktop. Its exact prompt was:

```text
Use case: precise-object-edit
Asset type: corrected desktop gameplay oracle for the Round 5 controlled HAIO experiment
Input images: Image 1 is the desktop edit target.
Primary request: Reduce only the central cyan/teal player corvette's apparent screen size by approximately 22 percent while keeping its center point fixed. Its complete silhouette, including engines, should occupy about 11–12 percent of image height.
Constraints: Change only player scale and the immediately exposed background beneath it. Preserve the exact canvas and aspect ratio, player design and orientation, every other object position and scale, station, hostile ships, courier, wreck, beacon, pickups, debris, grid, lighting, materials, palette, labels, HUD, joystick, radar, event feed, and visual style. No new objects, no removed objects, no text changes, no watermark.
```

The edit landed near the lower side of the target band but inside the brief’s 8–13 percent rejection boundaries. A second edit attempted to enlarge only the player by 25 percent; it overshot back toward the original scale and was rejected. The selected correction remains recognizable through its center position, cyan value, engine glow, and surrounding negative space. The three-loop ceiling was reached, so the small residual was accepted and recorded instead of moving the target again.

## Portrait rejected draft and bounded repair

The first portrait draft was rejected as `ODD`: the station owned too much of the upper third and competed with the player. The draft was not copied into the repository.

Exact repair prompt:

```text
Use case: precise-object-edit
Asset type: corrected portrait gameplay oracle for the Round 5 controlled HAIO experiment
Input images: Image 1 is the portrait edit target.
Primary request: Reduce only the steel/teal ring station's apparent screen occupancy by approximately 30 percent and move it slightly farther toward the upper-right background so it remains clearly visible but no longer competes with the cyan player as the primary subject.
Constraints: Change only station scale/depth placement and the immediately necessary surrounding empty space. Preserve the exact portrait canvas and aspect ratio, player size and position, every ship design, all other object positions, debris, grid, lighting, materials, palette, labels, HUD panels, joystick, radar, event feed, beacon, wreck, pickups, and visual style. Keep the station readable and inside frame. No new objects, no removed objects, no text changes, no watermark.
```

Expected proof appeared: the station remains readable, occupies materially less screen area, and the player now owns the portrait hierarchy.

## Approval gates

| Gate | Desktop | Portrait |
| --- | --- | --- |
| Full size | `GOOD` with accepted scale residual: player is central, station is subordinate, and all object classes are legible | `GOOD`: repaired station is subordinate and controls stay at the edges |
| 25% thumbnail | `GOOD`: cyan value, engines, and negative space keep the smaller player identifiable | `GOOD`: player survives scale reduction and the vertical hierarchy remains readable |
| Grayscale | `GOOD`: player, station, hostiles, neutral, and wreck retain distinct values and silhouettes | `GOOD`: player remains the primary mid-frame subject and no ship collapses into black |
| Layout | `GOOD`: compact edge HUD leaves the central playfield clear | `GOOD`: top HUD, event feed, joystick, and radar do not overlap the player |

The reference-review captures are deterministic local evidence under `output/playwright/round-5-oracle-review/`; that directory is ignored and may be regenerated from the frozen sources.
