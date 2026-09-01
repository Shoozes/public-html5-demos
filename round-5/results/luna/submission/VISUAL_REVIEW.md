# Round 5A Visual Review

The fixed semantic interpreter for this run is native image view. Reference checksums are recorded in `evidence/reference-copies-or-checksums.txt`.

## First-frame checkpoint

Screenshot: `evidence/milestone-before-first-frame-desktop.png` and `evidence/milestone-before-first-frame-portrait.png`
Reference: `round-5/mockups/desktop-reference-v2.png` (`2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d`); `round-5/mockups/portrait-reference-v2.png` (`750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547`)
Viewport/state: 1440x900 and 390x844, opening state, deterministic seed 981723
Interpreter: native image view
Verdict: ODD
Blunt read: This looks odd because the implementation is procedurally readable but the browser capture must confirm exact screen-space scale and station hierarchy before it can be called good.
Immediate impression: The intended subject should be the cyan player against a dark navy field, with a ring station and perimeter contacts providing scale.
Reference delta 1: The player must occupy roughly one tenth of the frame height and remain centered rather than becoming a tiny icon.
Reference delta 2: The station must sit in the upper band and stay visually subordinate to the player.
Reference delta 3: The lower controls must balance joystick and radar weight without invading the play center.
Requirement risk: A camera or lighting mismatch could recreate the known satellite-view or crushed-darkness failures.
Keep: The procedural role palette and multi-part silhouettes are designed to preserve the reference hierarchy.
Repair next: Capture both viewports and make one bounded camera/lighting calibration repair if the player or station misses the measured relationships.
Expected proof: New before/after captures should show the player near 10% of viewport height, a smaller upper station, and readable lower controls.

## Functional-state checkpoint

The combat, destruction, salvage, collection, and restart visual states are reviewed after the first functional run. Each entry names three concrete deltas and preserves before/after evidence.

## Opening self-critique (blind)

Screenshot: `evidence/milestone-before-first-frame-desktop.png`, `evidence/milestone-before-first-frame-portrait.png`
Reference: fixed desktop and portrait V2 references; checksums in `evidence/reference-copies-or-checksums.txt`
Viewport/state: 1440x900 and 390x844, opening state, seed 981723
Interpreter: native image view
Verdict: BROKEN
Blunt read: This looks broken in portrait because the first capture clipped the station and pushed the courier, beacon, and wreck outside the narrow horizontal world span.
Immediate impression: Desktop established a clear cyan player and dark tactical field; portrait made the station/HUD collision and missing landmarks obvious.
Reference delta 1: The fixed portrait oracle keeps the station visible below the top cards; the first capture left only a clipped ring behind the telemetry card.
Reference delta 2: The oracle shows side contacts and the courier in the portrait travel lanes; the first capture lost most perimeter silhouettes.
Reference delta 3: The oracle distributes cyan pickups through the scene; the first capture had no opening pickups.
Requirement risk: Portrait readability and the landmark/role silhouette gates were threatened.
Keep: Desktop player scale, dark navy background, amber beacon, green wreck core, and balanced bottom controls were already legible.
Repair next: Widen only the portrait camera's horizontal world span, then add sparse ordinary pickups to the opening field.
Expected proof: Both fixed portrait landmarks and several cyan pickups should be visible without changing player vertical scale.

## Standardized external critique

Screenshot: `evidence/milestone-after-first-frame-desktop.png`, `evidence/milestone-after-first-frame-portrait.png`
Reference: `round-5/mockups/desktop-reference-v2.png` and `round-5/mockups/portrait-reference-v2.png`; checksums in `evidence/reference-copies-or-checksums.txt`
Viewport/state: 1440x900 and 390x844, opening state, seed 981723
Interpreter: native image view
Verdict: ODD
Blunt read: This looks odd because the portrait world is now present and readable, but the upper perimeter hostiles remain partly cropped and the no-lock telemetry card overlaps the station more than the oracle.
Immediate impression: The cyan player is still the central subject; cyan pickup rings now supply travel rhythm and the amber/green landmarks separate well from the navy field.
Reference delta 1: The station remains partially behind the top-right telemetry card in portrait instead of sitting cleanly beneath it.
Reference delta 2: The four hostile silhouettes are less evenly distributed than the oracle, with top contacts near the portrait edges.
Reference delta 3: Procedural ships use simpler block assemblies and less facet/panel detail than the reference mockup.
Requirement risk: Further visual improvement is limited by the remaining portrait overlap and silhouette complexity, but no load-bearing first-frame element is absent.
Keep: The player, courier, beacon, wreck, pickups, grid, radar, joystick, and compact HUD all survive the portrait frame.
Repair next: No further visual repair within the bounded arm; preserve the successful camera and pickup changes and proceed to final gates.
Expected proof: Final captures and functional evidence should retain all required roles, with no console/network failure or invariant regression.

## Bounded repair receipt

- Repair 1 attempt: an out-of-scope portrait helper was ineffective because it could not see the renderer block; it was superseded and not counted as a retained change.
- Repair 2 retained: portrait camera horizontal span widened while vertical span stayed fixed; station, courier, beacon, wreck, and controls became visible.
- Repair 3 retained: five sparse cyan pickups were seeded after bootstrap; the opening field now communicates salvage and navigation without changing combat or collection rules.
- Before/after files are preserved under `evidence/`; the final standardized verdict remains `ODD` with no `BROKEN` load-bearing checkpoint.
