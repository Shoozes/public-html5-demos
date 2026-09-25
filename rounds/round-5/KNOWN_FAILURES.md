# Round 5 Prior-Failure Ledger

This is the compact context supplied to every Round 5 model. It records observable failure patterns without requiring the full conversation or prior source files.

| Failure | Observable symptom | Root pattern | Required invariant |
| --- | --- | --- | --- |
| Incomplete artifact | HTML ends mid-function or lacks closing tags | Output budget exhausted before completion | Canonical file must parse before any quality score |
| Uncatchable import failure | HUD appears over a black screen | Invalid static module path fails before bootstrap error handling | Use verified pinned imports and staged visible startup failure |
| TSL namespace mismatch | Error overlay during world/resource creation | Node material constructor taken from the TSL namespace instead of Three.js | Verify API seams in the running browser |
| Noncanonical output | Game runs from another folder but benchmark path is missing | Agent follows scaffold convention rather than artifact contract | Final runtime must exist at `submission/index.html` |
| Dead target residue | Destroyed enemy, marker, or HUD lock remains | Death, deselection, scene removal, and cleanup are separate paths | Destruction is one staged transaction across simulation and rendering |
| Direct object references | Target retains a removed instance | Scene object used as authoritative world identity | Cross-entity relationships use validated IDs |
| Transform conflict | Hull snaps between movement and target direction | Movement and weapon aim write the same rotation | Hull heading and weapon aim have separate owners and pivots |
| Backwards ship | Ship travels opposite its visible nose | Model-local forward and yaw convention disagree | One documented local-forward convention validated in four directions |
| Opening ambush | Hostiles fire at or near the first frame | Spawn distance, aggro, cooldown, and grace period were not validated together | No hostile projectile during the frozen opening-safety window |
| Extreme close-up | Nearby enemies fill large portions of the screen | Camera coordinates specified without screen-space target | Player and contacts must fit approved viewport relationships |
| Satellite view | Player becomes a tiny icon | Minimum horizontal span expands portrait vertical span excessively | Match fixed portrait and desktop references rather than one competing metric |
| Flat tokens | 3D objects read as colored 2D shapes | Exact top-down camera, unlit materials, and trivial primitive assemblies | Oblique depth, lit primary materials, and distinct multi-part silhouettes |
| Crushed darkness | Geometry disappears while HUD remains bright | “Space is dark” applied to all materials and lighting | Keep background dark; light interactive geometry with key, fill, rim, and restrained emission |
| Camera-attached world | Movement appears stationary | Background or near field follows camera at the same rate | Near field is world anchored; far field uses restrained parallax or stable wrapping |
| Capsule sameness | All ships read as one pill-like form | Fast geometry shortcut satisfies entity nouns but not silhouette contract | Player, hostile variants, neutral, station, wreck, and beacon must differ at thumbnail scale |
| Square particles | Sparks look like tiles or stars | Large unmasked point primitives | Use masked sprites, billboards, or geometry with readable size and shape |
| Precision salvage | Tiny drop must be tapped or touched exactly | Pickup loop copied from contextual wreck interaction | Ordinary drops burst, magnetize, and auto-collect within readable radii |
| Shared-material corruption | Selection or hit feedback changes unrelated entities | Mutable material shared across live objects | Shared resources are immutable after registration; state uses dedicated parameters or markers |
| Restart side effects | Restart spawns wrecks, duplicate stars, listeners, or loops | Teardown reuses combat death or partial reset semantics | Restart reconstructs a clean world without gameplay side effects |
| Fake pooling | Active mesh is reused by another live item | Pool slot inferred from array length | Pool ownership uses explicit free slots or simple bounded allocation |
| Decorative diagnostics | Fields exist but never reflect runtime state | Prompt vocabulary copied without connected evidence | Every reported diagnostic is live, tested, and used by invariants |
| Screenshot without critique | Evidence folder contains images but visual defects remain unnamed | Capture was treated as visual validation | Every milestone receives a structured semantic review and bounded repair |
| Generic visual language | “Looks coherent” despite obvious imbalance | Prompt asks for polish but not candid perception | Verdict must be `BROKEN`, `ODD`, or `GOOD` with visible deltas |
| Legacy-reference overfit | Submission copies old panels, button density, artwork, labels, or low-resolution trade dress | Historical inspiration is treated as a pixel-copy target | Preserve world, role, and readability invariants; follow the approved V2 oracle and explicit exclusions |
| Platform-sensitive package hash | Main checkout passes while clean Windows worktrees report broad checksum drift | Raw working-tree bytes encode checkout-specific line endings | Canonicalize frozen text to LF before hashing; keep binary references byte-exact |

## Use

Read this ledger before writing `VISUAL_CONTRACT.md`. Do not copy its implementation suggestions mechanically. Use it to prevent known failure classes while preserving room for a different coherent design.

The Round 5 visual oracle and current pass-down remain authoritative when this ledger and a new requirement appear to conflict.
