# Round 5A Visual Contract

The immutable targets are `round-5/mockups/desktop-reference-v2.png` (`2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d`) and `round-5/mockups/portrait-reference-v2.png` (`750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547`). Native image view is the only semantic interpretation lane.

## Desktop observations

1. The cyan player sits at approximately `(0.49, 0.50)` with a complete silhouette near 8–10% of frame height; its warm twin-engine glow and open negative space make it the immediate subject even though the station is larger.
2. The player points toward the upper-right. Its long nose, swept wings, raised cockpit, and separated engine pods make local forward readable without a label.
3. The steel ring station is centered near `(0.58, 0.13)`, remains wholly inside the upper band, and is separated from the player by roughly one third of the frame height.
4. Four coral hostiles occupy perimeter quadrants rather than forming a wall around the player; no hostile crosses the player’s immediate negative-space halo.
5. The hostile family shares coral hulls and dark paneling, but the upper-left, upper-right, lower-left, and lower-right craft visibly differ in nose, wing, pod, or tail proportions.
6. The neutral courier near `(0.35, 0.27)` is broad, rectangular, warm sand-colored, and slower-looking than every pointed combat ship.
7. The beacon near `(0.67, 0.37)` is a narrow amber shaft on a ring base; the wreck near `(0.80, 0.54)` is an irregular warm-gray mass with a green center, so neither reads as a ship.
8. Cyan pickups are larger and brighter than star points, use a compact crystal/ring silhouette, and remain distributed around the player and landmarks rather than clustered like loot text.
9. The near-black navy background contains sparse stars, a faint diagonal navigation grid, restrained blue haze, and world-scale debris; these cues stay subordinate but prevent stationary-looking movement.
10. HUD weight is balanced across edges: compact player status upper-left, target status upper-right, joystick lower-left, radar lower-right, and two event lines just above the joystick. The center remains open and there is no persistent fire control.

## Portrait-specific observations

1. The player stays near `(0.50, 0.47)` and approximately 8–9% of frame height; vertical space expands around it instead of scaling it into a satellite icon.
2. The station shifts to the upper-right near `(0.72, 0.15)` and is visibly smaller than its desktop appearance, preserving top-HUD clearance and player primacy.
3. Contacts form a vertical perimeter: hostile silhouettes at upper-left, upper-right, mid-left, and lower-right; courier upper-left-middle; wreck lower-right-middle. None crowd the player.
4. Joystick and radar remain completely inside the lower safe area with similar diameters and do not enter the player’s immediate region; the two-line event feed fits above the joystick.
5. The two top panels stay compact at opposite corners, leaving the top-center scene readable; the station never sits beneath a panel.

## Camera, scale, and spacing

- Use an orthographic camera with fixed yaw and a 50–58 degree downward tilt. The camera follows the player in XZ while preserving a constant projection and world-up orientation.
- Map local ship forward to world `-Z`; yaw `0` moves north/up-screen, `π/2` east, `π` south, and `-π/2` west.
- Target player screen height is 9% desktop and 9% portrait, acceptable from 8–12%. Station screen occupancy stays below 12% and remains lower priority through material value and placement.
- Opening contacts retain a clear player exclusion zone of at least two player lengths. Targeting never changes camera zoom.

## Silhouette rules

- Player: tapered wedge nose, central fuselage, raised cockpit, two swept wings, and two visibly separated aft engine pods.
- Hostiles: coral pointed bodies with four structural variants: asymmetric blade, fork-tail striker, pod-wing raider, and broad delta bruiser. A palette swap alone is insufficient.
- Neutral courier: broad boxy cargo spine, paired side crates, blunt nose, and compact amber engines.
- Station: torus ring plus radial struts, hub, and raised control stack; never ship-shaped.
- Wreck: non-symmetric broken chunks around an exposed core with detached shards.
- Beacon: thin vertical shaft above two concentric rings; no fuselage or wings.
- Pickup: faceted crystal inside a small ring/halo and visibly larger than a star.

The silhouette checkpoint will use flat high-contrast class values before the lit material pass. Every category must remain nameable in both fixed viewports without hue or labels.

## Palette, lighting, and materials

- Background is navy-black (`#020812` to `#071525`), never pure black or globally brightened.
- Player uses medium cyan/teal hull values, coral hostiles use medium red/orange values, courier uses sand/amber, station uses steel/teal, wreck uses warm gray plus green salvage, and beacon uses amber.
- A cool directional key reveals top facets, a soft blue-green hemisphere fill prevents crushed shadow faces, and a restrained warm rim separates aft geometry. Emission accents state engines, station lamps, beacon, pickups, weapons, and salvage; emission is never the sole readable hull.
- Primary geometry uses `MeshStandardNodeMaterial` with TSL-connected color/emissive nodes. Shared resources remain immutable after registration; transient effects own their materials.
- Glow is restrained to CSS/transparent geometry halos and small emissive parts. No bloom dependency, full-frame vignette, fog wall, or square point particles.

## HUD and interaction hierarchy

- Panels use translucent navy with thin cyan/coral rules and small uppercase labels. Their brightest marks remain below player-engine and beacon peaks.
- Joystick is the primary persistent touch control. Radar is informational. Disengage and contextual interaction are compact and state-dependent; restart and fullscreen are small utility controls.
- Pointer-event ownership is narrow: controls intercept only their own bounds, while the playfield remains selectable.
- Events show two to four simulation-driven lines with no repeated unchanged selection messages.

## Procedural simplifications

- Painted panel textures become layered primitives, contrasting facets, and emissive strips.
- Nebula complexity becomes two or three soft CSS/canvas radial haze regions plus layered stars.
- Dense asteroid detail becomes deterministic low-poly debris clusters anchored in world space.
- Intricate station plating becomes a torus, four struts, hub cylinders, control stack, and lamps.
- Radar icons use geometric dots/triangles rather than authored sprites.

## Outline reconciliation

The shared outline is accurate for hierarchy, normalized positions, scene layers, component families, and edge-HUD balance. Direct image inspection adds two corrections: the approved desktop player reads closer to 8–9% than the outline’s 9–10% estimate, and portrait spacing should be achieved by a taller world span rather than enlarging the station or shrinking the player. These are accepted oracle residuals, not target changes.
