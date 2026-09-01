# Round 5 Reference Outline and Component Map

This operator-authored outline decomposes the approved V2 images into implementable layers and parts. It is supplied identically to every Round 5A arm. `HOSTILE_SPACE_REFERENCE.md` records the historical behavioral lineage; `STARBLAST_REFERENCE.md` records the 3D presentation language. Both define explicit non-cloning boundaries.

The images remain authoritative. This outline reduces ambiguity; it does not replace the model’s required `submission/VISUAL_CONTRACT.md` or its independent visual judgment.

## Coordinate convention

Positions use normalized viewport coordinates: `(0, 0)` is upper left and `(1, 1)` is lower right. Sizes are approximate visible relationships, not pixel-copy targets.

## Desktop composition outline

| Element | Approximate center/zone | Relationship to preserve |
| --- | --- | --- |
| Player | `(0.49, 0.50)`, roughly 9–10% of viewport height | Central cyan subject with clear negative space and forward nose toward upper right |
| Station | `(0.58, 0.13)`, upper-center band | Detailed landmark, visibly behind the player, never the first subject |
| Hostiles | perimeter at upper-left, upper-right, lower-left, lower-right | Related coral faction language with four non-identical profiles |
| Courier | `(0.35, 0.27)` | Warm neutral block silhouette, smaller and calmer than combat ships |
| Beacon | `(0.67, 0.37)` | Thin amber vertical signal with a small ring base |
| Wreck | `(0.80, 0.54)` | Irregular warm-gray mass with green salvage core |
| Pickups | distributed around the player and landmarks | Small cyan tokens with halos, brighter and larger than stars |
| Player HUD | upper-left edge | Compact hull/credits panel; does not extend into central play |
| Target HUD | upper-right edge | Compact hostile status panel |
| Joystick / radar | lower-left / lower-right corners | Equal edge weight; central playfield remains open |
| Event feed | lower-left, just inside joystick | Two short persistent-world or interaction events, subordinate to world geometry |

## Portrait composition outline

| Element | Approximate center/zone | Relationship to preserve |
| --- | --- | --- |
| Player | `(0.50, 0.47)`, roughly 8–9% of viewport height | Mid-frame cyan subject; accepted near the lower edge of the preferred scale band |
| Station | `(0.72, 0.15)` | Repaired smaller landmark in the upper-right background |
| Hostiles | upper-left, upper-right, mid-left, lower-right | Perimeter threat ring without crowding the player |
| Courier | `(0.24, 0.30)` | Warm neutral contact clearly separated from hostiles |
| Beacon | `(0.72, 0.39)` | Bright vertical landmark on the right side |
| Wreck | `(0.77, 0.60)` | Green salvage anchor, separated from the lower hostile |
| Controls | bottom edge | Joystick and radar remain fully visible and outside the play center |
| Top HUD | two corner panels | Leaves the top-center scene visible and avoids station overlap |

## Scene layers

Build from back to front:

1. Near-black navy background.
2. Sparse layered stars and restrained blue haze.
3. Faint world-anchored navigation grid.
4. Low-contrast debris and asteroid clusters.
5. Station, wreck, courier, beacon, hostiles, player, and pickups.
6. Small selection/status markers and restrained emissions.
7. Compact edge HUD and controls.

Cargo, scan, target, hull, and radar are information roles inherited from the historical reference, not fixed panel shapes. Prefer compact edge summaries and contextual disclosure over a permanent control slab.

The low-poly presentation should reveal faceted volume, heading, depth overlap, and landmark scale at gameplay distance. Short emissions and trails may clarify motion, but must not become the only readable part of a ship.

Near-field debris and grid must remain world anchored. Far-field stars may use restrained wrapping or parallax, but must not move rigidly with the camera.

## Component inventory

| Component | Procedural outline | Distinguishing requirement |
| --- | --- | --- |
| Player corvette | tapered nose, central fuselage, raised cockpit, two swept wings, twin engine pods, small dorsal/ventral height | cyan medium-value hull, orange engines, unmistakable forward direction |
| Hostile family | pointed fuselage plus asymmetric wings, side pods, fins, or forked tails | coral/red shared faction palette; each variant changes more than color |
| Neutral courier | broad rectangular fuselage, side cargo blocks, compact amber engines | reads as utilitarian and non-aggressive |
| Ring station | torus/ring, radial struts, central hub, upper control stack, small lamps | large structural silhouette but lower visual priority than player |
| Wreck | broken hull chunks, exposed center, scattered nearby shards | irregular outline and green salvage emission |
| Beacon | small ring/torus base plus vertical emissive shaft | narrow amber signal, not ship-shaped |
| Pickup | compact crystal/polyhedron or small ringed token | consistent pickup family, clearly larger/brighter than star points |
| Projectile/effect | thin beam, small bolt, or directional streak | must communicate weapon direction without hiding silhouettes |
| Joystick | two restrained concentric circles and a movable inner puck | primary persistent touch control, no permanent fire control |
| Radar | compact concentric rings, axes, and tiny contact markers | similar footprint to joystick, visually subordinate to game world |

## Silhouette-outline checkpoint

Before materials or effects, render player, each hostile variant, courier, station, wreck, beacon, and pickup as flat high-contrast silhouettes. Capture desktop and portrait frames and confirm:

- every category can be named without its label or hue;
- the player’s forward direction is obvious;
- no hostile is a recolored player;
- the station and wreck do not read as ships;
- pickups do not read as stars;
- portrait cropping preserves the same identities.
- station/player scale remains readable at gameplay distance rather than requiring a cinematic close-up.

Only after this checkpoint passes should the implementation add lighting, emissive accents, particles, and HUD detail.

## Individual-component escalation

Do not generate component references during one model’s run. If the operator concludes before the baseline freeze that an image still leaves a component ambiguous, create one component sheet for that category, review and checksum it, add it to `EXPERIMENT.json`, and restart every arm from the same baseline. A model-specific component image would change the experiment and invalidate the comparison.
