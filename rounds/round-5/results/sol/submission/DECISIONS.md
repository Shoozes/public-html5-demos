# Round 5A Material Decisions

- I will take stable numeric entity IDs as the only authoritative cross-entity identity; scene objects remain replaceable representations.
- I will take local ship forward as geometric `-Z` while storing tactical facing clockwise from north, keeping movement heading independent from the child weapon pivot.
- I will take the approved player scale residual literally: target roughly 9% of frame height rather than enlarging the player toward a cinematic close-up.
- I will take portrait as a responsive world layout with a fixed projection language, not a cropped desktop camera or a competing zoom mode.
- I will take encounter aggression as proximity after the three-second opening grace; only aggressive hostiles enter sticky auto-targeting.
- I will take disengagement as a 1.6-second reacquisition suppression window, preserving a valid lock otherwise until death or break radius.
- I will take ordinary salvage as burst, readable free drift, magnetic pull, and automatic collection; selection is reserved for landmarks.
- I will take station telemetry as a contextual long-range traffic-data request inside 36 world units, so the compact action can support the frozen scenario without a permanent control slab.
- I will take procedural low-poly differentiation as structural: four hostile variants change wings, tails, pods, or breadth instead of relying on hue.
- I will take restart as clean world reconstruction inside the single existing animation loop, without combat-death side effects or duplicate listeners.
