# Round 5A Visual Review

Entries are appended only after their corresponding blind self-critique and native-image inspection. Fixed reference checksums and exact states are repeated in each external entry.

## Silhouette checkpoint — desktop

Screenshot: `submission/evidence/silhouette-desktop.png`
Reference: `round-5/mockups/desktop-reference-v2.png`, SHA-256 `2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d`
Viewport/state: 1440×900, flat silhouette inventory, seed 5105
Interpreter: native image view
Verdict: GOOD
Blunt read: This looks good because player, hostile, neutral, station, wreck, beacon, and pickup remain different shapes at thumbnail size.
Immediate impression: the central swept corvette is the first named shape.
Reference delta 1: hostile variants are smaller and simpler.
Reference delta 2: station structure uses fewer layers.
Reference delta 3: pickup rings are thinner.
Requirement risk: two hostile deltas converge when reduced.
Keep: player direction and non-ship landmark identities.
Repair next: none; retain geometry for the lit pass.
Expected proof: lit materials preserve the same category separations.

## Silhouette checkpoint — portrait

Screenshot: `submission/evidence/silhouette-portrait.png`
Reference: `round-5/mockups/portrait-reference-v2.png`, SHA-256 `750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547`
Viewport/state: 390×844, flat silhouette inventory, seed 5105
Interpreter: native image view
Verdict: BROKEN
Blunt read: This looks broken because the station is absent and side contacts are clipped.
Immediate impression: a readable player floats in an incomplete category inventory.
Reference delta 1: the reference station is complete at upper-right.
Reference delta 2: reference perimeter contacts retain safe margins.
Reference delta 3: reference beacon is wholly inside the right edge.
Requirement risk: portrait cropping fails the silhouette gate.
Keep: player, courier, wreck, pickups, controls, and feed remain legible.
Repair next: compress only portrait horizontal entity offsets.
Expected proof: every category center and the complete station/beacon enter frame while player and HUD stay fixed.

## First frame — desktop

Screenshot: `submission/evidence/milestone-before-first-frame-desktop.png`
Reference: `round-5/mockups/desktop-reference-v2.png`, SHA-256 `2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d`
Viewport/state: 1440×900, isolated first-frame slice, seed 5105
Interpreter: native image view
Verdict: ODD
Blunt read: This looks odd because the station becomes the largest high-value grayscale subject even though composition and bootstrap are sound.
Immediate impression: central cyan player followed too quickly by a bright upper-right ring.
Reference delta 1: player assembly is simpler and wider.
Reference delta 2: station is less detailed but tonally louder.
Reference delta 3: lower controls are smaller than the oracle.
Requirement risk: player primacy weakens at thumbnail size.
Keep: player position, scale, engine contrast, and open HUD footprint.
Repair next: lower only the station hull material value while preserving cyan instrumentation.
Expected proof: the player becomes the first grayscale subject and station remains readable.

## First frame — portrait

Screenshot: `submission/evidence/milestone-before-first-frame-portrait.png`
Reference: `round-5/mockups/portrait-reference-v2.png`, SHA-256 `750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547`
Viewport/state: 390×844, isolated first-frame slice, seed 5105
Interpreter: native image view
Verdict: BROKEN
Blunt read: This looks broken because the station is missing and the right-edge beacon is clipped.
Immediate impression: readable player, then a conspicuously empty upper-middle field.
Reference delta 1: reference station remains complete in the upper-right.
Reference delta 2: reference beacon has safe right clearance.
Reference delta 3: reference upper field has a landmark hierarchy rather than empty grid.
Requirement risk: first-frame portrait composition and landmark gate fail.
Keep: player scale, hull lighting, panels, feed, and controls do not overlap.
Repair next: apply the silhouette checkpoint’s portrait horizontal compression.
Expected proof: complete station and beacon appear with unchanged player and edge UI.

## Repair outcomes for silhouette and first frame

- Portrait horizontal compression improved beacon/contact margins but did not reveal the station because fixed camera yaw maps the station’s negative-Z offset rightward. Expected proof did not appear; the intermediate after-image is preserved.
- The station-only X correction revealed the ring but intersected utility controls. Expected proof was incomplete; the intermediate after-image is preserved.
- The final bounded portrait station scale correction made the complete landmark subordinate and clear of panels and utility buttons in `milestone-after4-first-frame-portrait.png`. Expected proof appeared; verdict upgraded to `GOOD`.
- The station-only hull-value reduction preserved the desktop landmark while lowering its grayscale priority in `milestone-after-first-frame-desktop.png`. Expected proof appeared; verdict upgraded to `GOOD`.

## Movement and camera follow

Screenshot: `submission/evidence/milestone-movement-camera.png`
Reference: both approved references and their recorded checksums
Viewport/state: 430×932, completed four-way movement sequence, seed 5105
Interpreter: native image view
Verdict: ODD
Blunt read: This looks odd because the movement diagnostic has already proximity-activated Ash Talon, adding combat density to a camera-follow proof.
Immediate impression: the player remains centered while world grid, debris, and contacts establish traversal.
Reference delta 1: grid is stronger. Reference delta 2: ships are simpler. Reference delta 3: target HUD is active rather than calm.
Requirement risk: incidental lock competes with the movement message but does not hide it.
Keep: fixed player scale and world-anchored motion cues.
Repair next: accepted non-load-bearing diagnostic residual; no visual code change.
Expected proof: functional cardinal deltas and the screenshot together establish follow behavior.

## Active combat

Screenshot: `submission/evidence/milestone-active-combat.png`
Reference: both approved references and their recorded checksums
Viewport/state: 430×932, forced Red Vesper aggression and automatic fire, seed 5105
Interpreter: native image view
Verdict: GOOD
Blunt read: This looks good because lock, hostile identity, independent turret direction, and short bidirectional bolts are readable without covering the player.
Immediate impression: cyan player and coral locked threat form a clear combat line.
Reference delta 1: bolts are simpler. Reference delta 2: target is closer. Reference delta 3: station is smaller.
Requirement risk: repeated bolts could clutter at sustained fire, but the captured density remains restrained.
Keep: short projectile length and visible child weapon pivot.
Repair next: none.
Expected proof: destruction frame clears the same named lock and render.

## Destruction and staged drops

Screenshot: `submission/evidence/milestone-destruction-drops.png`
Reference: both approved references and their recorded checksums
Viewport/state: 430×932, Red Vesper removed and five free-delay drops emitted, seed 5105
Interpreter: native image view
Verdict: GOOD
Blunt read: This looks good because the named threat and lock are gone and a compact five-token burst occupies the destruction location.
Immediate impression: cyan salvage cluster replaces the coral target.
Reference delta 1: tokens use rings. Reference delta 2: cluster is tighter. Reference delta 3: no painted explosion cloud.
Requirement risk: ring tokens are icon-like but remain larger than stars.
Keep: transactional lock/render cleanup and burst spacing.
Repair next: none.
Expected proof: magnetic pair pulls one token inward and credits once.

## Magnetic attraction and collection

Screenshot: `submission/evidence/milestone-magnetic-attraction-before.png` before; `submission/evidence/milestone-magnetic-collection.png` after
Reference: both approved references and their recorded checksums
Viewport/state: 430×932, diagnostic pickup during pull then collected, seed 5105
Interpreter: native image view
Verdict: GOOD
Blunt read: This looks good as a pair because the additional token exists during pull, disappears after cleanup, and is replaced by `5 CR` plus one recovery event.
Immediate impression: the before frame preserves the extra cyan token to player-right; the after frame makes the credit outcome explicit.
Reference delta 1: no long pull trail. Reference delta 2: halo is a ring. Reference delta 3: credit feedback is textual rather than a floating number.
Requirement risk: motion direction requires the before/after receipt rather than one still.
Keep: visible pickup family and uncluttered collection feedback.
Repair next: evidence timing only; completed without game-code change.
Expected proof: paired images and live counts show attraction/cleanup.

## Post-restart desktop

Screenshot: `submission/evidence/milestone-post-restart-desktop-stable.png`
Reference: desktop approved reference and checksum
Viewport/state: 1440×900, one second after restart, seed 5105
Interpreter: native image view
Verdict: GOOD
Blunt read: This looks good because all 13 entities and edge controls reconstruct with the same opening hierarchy and reset values.
Immediate impression: central player, ring station, and four perimeter hostiles are restored.
Reference delta 1: geometry is simpler. Reference delta 2: controls are smaller. Reference delta 3: haze is lighter.
Requirement risk: none load-bearing.
Keep: composition and one-loop reconstruction.
Repair next: none.
Expected proof: portrait restart preserves the same identities without clipping.

## Post-restart portrait

Screenshot: `submission/evidence/milestone-post-restart-portrait-stable.png`
Reference: portrait approved reference and checksum
Viewport/state: 390×844, one second after restart, seed 5105
Interpreter: native image view
Verdict: GOOD
Blunt read: This looks good because player, station, beacon, courier, wreck, four hostile centers, pickups, feed, joystick, and radar remain visible after reconstruction.
Immediate impression: restored cyan player owns the middle while contacts form a vertical perimeter.
Reference delta 1: station is farther left. Reference delta 2: hostiles are smaller. Reference delta 3: labels contribute more identity.
Requirement risk: no load-bearing crop or overlap remains.
Keep: player/control scale and complete reconstructed inventory.
Repair next: none.
Expected proof: final invariants retain one loop and no stale references.
