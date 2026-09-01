# Round 5A Visual Contract

## Fixed oracle and interpreter

The immutable targets are `round-5/mockups/desktop-reference-v2.png` (`2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d`) and `round-5/mockups/portrait-reference-v2.png` (`750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547`). Reviews use native image view only. This contract translates their observed hierarchy into original procedural geometry; it does not trace, texture, or copy them.

## Composition

- The cyan player corvette is the central subject: near `(0.49, 0.50)` on desktop and `(0.50, 0.47)` in portrait, about 8–10% of viewport height, with an immediately readable nose and warm rear engines.
- A cyan-lit ring station lives behind the player in the upper band: near `(0.58, 0.13)` desktop and `(0.72, 0.15)` portrait. It provides scale but may not dominate the player.
- Coral hostiles form a sparse perimeter rather than a crowd. A warm, blocky courier is separated at upper-left. An amber beacon and green-core wreck establish distinct non-ship landmarks at the right.
- The center retains broad navigable negative space. HUD panels are compact corners; joystick and radar have balanced bottom-corner footprints, never covering the player.

## Forms, values, and depth

- The player is a tapered, winged, multi-part corvette. Every hostile changes its wing/pod/tail profile, not merely color. The courier is cargo-blocked, the station is ring-and-strut, the wreck irregular and broken, the beacon narrow, and pickups are bright small crystals/rings larger than stars.
- Space is near-black navy with dim stars, a faint anchored tactical grid, and sparse debris. Interactive forms use moderate steel/cyan/coral/amber/green material values, key/fill/rim light, and restrained emission so grayscale thumbnails retain the player and landmarks.
- A fixed-yaw oblique camera permits height, overlap, and faceted volume while retaining tactical readability. Grid/debris are world anchored; distant stars are static or softly parallaxed.

## HUD and state readability

- Upper-left hull and credit summary, upper-right target status, lower-left event feed and virtual joystick, lower-right radar. HUD glass is quieter than the player and only contextual controls appear near selected landmarks.
- Opening frame is peaceful: hostiles are visible, but no hostile bolt fires for three seconds. Combat uses thin directional cyan/coral bolts, visible locks and destruction; salvage becomes bright magnetic pickups and collection feedback.

## Review checklist

At desktop and portrait full-size, 25% thumbnail, and grayscale reduction: subject hierarchy; silhouette naming; visible heading; player/station scale; readable interactive geometry against dark space; depth; edge HUD; unclipped controls; and state cues must be checked against these references.

The review vocabulary is fixed: `Verdict: BROKEN | ODD | GOOD` and `Blunt read: This looks <broken/odd/good> because...`.
