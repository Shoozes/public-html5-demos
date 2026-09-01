# Round 5 Mockup V2 Brief: Dark Space, Readable World

## Status

The mockups under `round-4/mockups/` remain the provenance record for the first visual-oracle idea. They are useful layout drafts, but they are too dark to freeze as the Round 5 target.

The brighter V2 pair has been generated, reviewed, approved, and frozen under:

```text
round-5/mockups/desktop-reference-v2.png
round-5/mockups/portrait-reference-v2.png
round-5/mockups/GENERATION_RECORD.md
```

The V2 images are design references only. They must never become runtime textures or bundled assets in the submitted HAIO. `GENERATION_RECORD.md` is the approval authority; this brief preserves the request that produced them.

## Visual principle

Space is dark. The entire scene does not need to be dark.

Keep the background near-black navy, then light interactive geometry as though the sector has instrumentation, reflected starlight, engines, station lamps, and readable game-art staging. The player, hostiles, neutral ship, station, wreck, beacon, pickups, and projectiles must remain legible without bleaching the background.

## Composition targets

### Desktop, 1440 × 900

- Fixed-yaw, slightly oblique tactical view.
- Cyan/teal multi-primitive player near the visual center, approximately 9–11 percent of viewport height.
- Player is the primary subject but does not fill the screen.
- Four coral/red hostiles sit near the safe perimeter, visibly distinct but not all equally prominent.
- One neutral station is clearly present and detailed, but occupies no more than roughly 10–12 percent of the frame and does not dominate the player.
- One neutral roaming vessel, one beacon, and one wreck are distinguishable by silhouette and accent color.
- World-anchored debris, sparse navigation marks, stars, and subtle haze communicate movement and depth.
- Compact edge HUD, small radar, joystick, and two recent event lines.
- No permanent fire button.
- No giant center panels.
- No uniform capsule ships.

### Portrait, 390 × 844

- Preserve the desktop camera language and object designs.
- Player remains near center at approximately 9–12 percent of viewport height.
- Station is visible but non-dominant and does not collide with the HUD.
- At least two distant contacts and one landmark remain visible without making the scene feel empty.
- Controls respect safe areas and do not clip.
- HUD occupies the edges, not the central playfield.
- Event feed remains two or three short lines.
- No permanent fire button.

## Lighting and material targets

- Background: near-black navy, not pure featureless black.
- Primary hulls: medium-value base colors with visible facets and panel separation.
- Key light: cool and directional enough to reveal volume.
- Fill light: soft neutral or blue-green, preventing crushed shadow faces.
- Rim light: restrained warm accent separating silhouettes from the background.
- Emissive details: engines, weapon ports, station rings, beacon, pickups, and faction accents.
- Emission may define edges and state, but must not be the only reason an object is visible.
- Avoid large regions of hull RGB values near zero.
- Avoid heavy full-frame vignette, fog, or bloom that hides geometry.
- Hostiles: coral/red and dark metal, still readable as 3D forms.
- Neutral vessel: warm sand/amber or muted blue-green, clearly non-hostile.
- Station: steel/teal with brighter rings or lamps.
- Wreck: warm gray/brown with salvage glow.
- Beacon: amber or pale blue signal language.
- Pickups: compact bright tokens with readable halos.

## Readability gates

Reject the mockup when any of these fail:

1. At 25 percent thumbnail size, the player silhouette cannot be identified immediately.
2. In grayscale, player, hostile, station, and wreck collapse into one value range.
3. The station becomes the first visual subject in ordinary play.
4. More than half of an interactive ship disappears into black shadow.
5. HUD panels are brighter or larger than the game objects they describe.
6. The player is smaller than roughly 8 percent or larger than roughly 13 percent of viewport height.
7. Hostiles look like recolored copies of the player.
8. Portrait controls overlap, clip, or invade the player’s immediate area.
9. The background is so bright that space loses depth.
10. The background is so dark and empty that motion has no reference.

## Practical generation constraint

The reference must be reproducible with procedural Three.js primitives and TSL materials. Avoid intricate painted textures, detailed logos, photorealistic spacecraft, dense typography, or effects that require authored assets.

Favor:

- boxes, cones, cylinders, toruses, spheres, rings, and low-poly shards;
- layered primitive silhouettes;
- flat or restrained smooth shading;
- readable key/fill/rim lighting;
- simple emissive details;
- small radial glows and particles;
- sparse navigation grid and debris.

## Desktop generation prompt

```text
Create a clean 1440×900 gameplay mockup for a browser-based procedural Three.js space game. Show a fixed-yaw, slightly oblique tactical camera over a dark navy-black space sector. The background is dark, but all interactive geometry is clearly lit and readable.

Place a cyan/teal multi-primitive player corvette near center at about 10% of viewport height. Give it a recognizable nose, wings, cockpit, twin orange engines, and visible height. Use cool key light, soft neutral fill, and a restrained warm rim so no important hull face collapses into black.

Place four coral/red hostile ships near the safe perimeter. Give each a related faction language but distinct multi-part silhouettes. Include a steel/teal ring station that is visible but not dominant, one warm neutral courier, one amber beacon, one warm-gray wreck with a green salvage glow, several small magnetic pickups, sparse world-anchored debris, a faint navy navigation grid, layered stars, and restrained blue haze.

Use compact edge HUD elements: player hull and credits at upper left, small target status at upper right, a small radar, a virtual joystick at lower left, and two short event lines near an edge. No permanent fire button, no giant panels, no capsule ships, no clipped UI, no watermark, no photorealism. The result should look feasible to recreate with procedural Three.js primitives and TSL materials.
```

## Portrait generation prompt

Generate the portrait reference from the approved desktop art direction rather than inventing a second design:

```text
Recompose the approved desktop gameplay mockup for a 390×844 portrait mobile viewport. Preserve the exact ship, station, faction, lighting, material, and HUD art direction. Keep the cyan player near center at about 10% of viewport height. Keep the ring station visible but non-dominant. Preserve readable hostile and neutral silhouettes, world-anchored debris, dark navy background, cool key light, soft fill, warm rim, and bright but restrained emissive accents.

Place compact hull/credits and target information at the top edges, a small event feed near an edge, a virtual joystick at lower left, and only small secondary controls elsewhere. No permanent fire button. No overlap, clipping, giant panels, crushed-black ships, or empty featureless space. Make the composition practical for a procedural Three.js implementation.
```

## Approval record

`GENERATION_RECORD.md` must include:

- image generation tool and mode;
- exact prompt text;
- generation date;
- file dimensions;
- SHA-256 checksums;
- operator verdict for full-size, thumbnail, grayscale, and portrait-layout checks;
- any rejected drafts and the reason they were rejected;
- final `APPROVED` declaration.

Both references are approved and frozen. Model arms remain gated on the baseline commit recorded in `EXPERIMENT.json`.
