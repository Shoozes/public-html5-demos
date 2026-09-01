# Round 5A Visual Contract

## Direct observations from the fixed references

### Desktop

1. The cyan player is the first gameplay subject, centered near `(0.49, 0.50)`, and its visible silhouette is about one tenth of the 900px frame height.
2. The player nose points toward the upper-right, with twin orange engine points behind it; heading must read without a label.
3. The ring station sits in the upper-center band around `(0.58, 0.13)`, detailed but smaller than the player’s visual emphasis.
4. Four coral hostiles form a loose perimeter, with different wing/pod profiles and enough empty space around the player for tactical movement.
5. The courier is a warm blocky utility silhouette left of center, visibly calmer and broader than combat ships.
6. The beacon is a thin amber vertical signal with a small circular base to the player’s right.
7. The wreck is an irregular warm-gray mass with a green salvage core in the lower-right quadrant.
8. Cyan pickups are small ringed crystals, brighter and more structured than star points, distributed through the travel lanes.
9. The upper-left and upper-right HUD cards are compact edge anchors; they describe the world without covering the center.
10. The joystick and radar occupy balanced lower corners while two short event lines sit beside the joystick and leave the central playfield open.

### Portrait-specific observations

1. The player remains near the middle at roughly 8–11% of viewport height rather than becoming a tiny satellite icon.
2. The station moves to the upper-right background around `(0.72, 0.15)` and stays visibly subordinate to the player and top HUD.
3. The courier remains in the upper-left/mid-left lane while a hostile occupies the right side, preserving role contrast in the tall frame.
4. The beacon is a readable amber landmark on the right; the wreck and green salvage anchor remain separated from the lower-right hostile.
5. The bottom controls are fully visible and outside the player’s immediate area; there is no permanent fire button.

## Camera and scale

- Use an orthographic tactical camera with a fixed yaw and slight oblique elevation: camera roughly `(0, 35, 27)` looking at the player, with visible hull height.
- Use a stable world span rather than zooming on target. Keep the player near 10% of viewport height on desktop and portrait.
- Keep the station, beacon, wreck, and contacts world-anchored; only far-field stars may wrap subtly.

## Silhouette rules

- Player: tapered nose, central fuselage, raised cockpit, swept wings, separated twin engine pods, and a dedicated weapon pivot.
- Hostiles: coral family palette but four different profiles using forks, fins, side pods, or asymmetric wings; never recolored player copies.
- Courier: wide rectangular body with side cargo blocks and amber engine accents.
- Station: ring/torus, hub, radial struts, and a raised control stack; it must not read as a ship.
- Wreck: broken low-poly chunks with an exposed green core and scattered shards.
- Beacon: narrow vertical shaft over a ring base.
- Pickup: compact faceted crystal plus a thin ring; brighter and larger than stars.

## Material and atmosphere rules

- Background stays near-black navy with sparse layered stars, faint grid, restrained haze, and anchored debris.
- Hulls use medium-value lit materials with cool key light, blue-green fill, restrained warm separation, and limited emission for engines, lamps, and salvage.
- Cyan, coral, warm amber, steel/teal, and salvage green are role colors; no full-frame bloom or heavy vignette may erase geometry.
- At thumbnail size, player/hostile/station/wreck must remain distinct in silhouette and luminance.

## HUD and interaction hierarchy

- Hull and credits stay upper-left; target/contact status stays upper-right or top edge; event feed is short and subordinate.
- Joystick is the primary persistent touch affordance; radar has equal lower-edge weight; contextual interaction appears only for a nearby selected landmark.
- Restart and fullscreen are compact controls. Combat lock may be disengaged contextually. There is no permanent fire control.

## Procedural simplification and corrections

- Procedural boxes, cones, cylinders, toruses, octahedra, and dodecahedra are sufficient if their assemblies preserve role silhouettes and visible height.
- The outline’s player, station, beacon, wreck, and pickup zones are accurate. The implementation should keep the station smaller and farther from the player on portrait than a literal desktop projection, matching the fixed portrait reference.
- Labels remain short and original; they communicate role without copying historical screenshot text or trade dress.
