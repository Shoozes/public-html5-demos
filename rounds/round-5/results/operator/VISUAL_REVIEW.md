# Round 5A Operator Visual Review

Interpreter lane: native image view

Review order: each operator-captured full-size frame was inspected alone, then against the matching fixed reference; all frames were rechecked as 25% thumbnails and grayscale copies before any builder rationale was read. The frozen references are `round-5/mockups/desktop-reference-v2.png` (`2e9daebefeaaa8b9e4a801365305d54a4d8d903d0cd1ea69c6605fd0cc28c92d`) and `round-5/mockups/portrait-reference-v2.png` (`750a786019ddf5383ad09e4a8c834f3a97f89c755f4e37583a3a1373e84a6547`).

## Luna

Screenshot: `luna/screenshots/first-frame-desktop.png` (`cc8a78343394fb93b865400540f4a9ca470c736a13b7c4e0dc7dedc988e76265`) and `luna/screenshots/first-frame-portrait.png` (`9d75e9d23b7d746850dcfcd7ef81d38d1397194175d012d7ee753e610ca17e8c`)

Viewport/state: 1440x900 and 390x844, opening state after readiness plus 250 ms, no input

Interpreter: native image view

Verdict: ODD

Blunt read: This looks odd because the player and interaction icons are legible, but the world reads as a sparse top-down diagram with simple tokens rather than the reference's dense, lit, oblique 3D sector.

Immediate impression: The large top HUD blocks and bright station ring dominate before the player; portrait makes the target panel and partly covered station feel crowded.

Reference delta 1: The player, hostile fleet, and neutral craft have much flatter and less differentiated silhouettes, with repeated arrow/plane construction.

Reference delta 2: The station is oversized relative to the player while debris and environmental density are too low, so depth and scale hierarchy weaken at thumbnail size.

Reference delta 3: Portrait preserves the center player and bottom controls, but the target panel covers the station region and edge contacts are visibly clipped.

Requirement risk: Silhouette differentiation and oblique depth fall short of the fixed visual contract; the portrait top hierarchy is crowded but does not fully block play.

Keep: Player, beacon, wreck, station, joystick, and radar remain recognizable in full-size, thumbnail, and grayscale views.

Repair next: Reduce the target panel footprint and rebuild the player plus one hostile family with wider, multi-level silhouettes and stronger light/rim separation.

Expected proof: At thumbnail size the player and at least two hostile classes should remain distinguishable without color, while the portrait station becomes fully visible below the top HUD.

## Terra

Screenshot: `terra/screenshots/first-frame-desktop.png` (`d3bfe66f3285b144b143528c6562fee2be30fe7bb5b563572847b579f3fdef63`) and `terra/screenshots/first-frame-portrait.png` (`8ef28fc1ff8df04a45822e886ce92b02bbf6488ee45168abe43bada07b1fbca0`)

Viewport/state: 1440x900 and 390x844, opening state after readiness plus 250 ms, no input

Interpreter: native image view

Verdict: ODD

Blunt read: This looks odd because the bright player and landmarks are easy to find, but repeated blocky rocket figures, an assertive grid, and oversized controls make the frame feel like a debug board rather than the richer tactical scene in the reference.

Immediate impression: The large cyan player reads first, followed by the equally large joystick/radar and station; the portrait courier and label are cut off at the left edge.

Reference delta 1: Hostile silhouettes repeat a narrow rocket/body vocabulary and collapse toward the same value range in grayscale.

Reference delta 2: The perspective grid and dotted boundary are more visually prominent than the star/debris field, while the fixed reference uses the grid as a restrained depth cue.

Reference delta 3: Portrait loses multiple contacts beyond the sides and devotes a larger fraction of the lower viewport to controls than the reference.

Requirement risk: Important-contact clipping and weak faction silhouette separation threaten portrait composition and visual convergence; functionality remains readable.

Keep: The player has strong thumbnail recognition, the station/wreck/beacon roles differ, and foreground geometry stays visible against the dark background.

Repair next: Pull the portrait camera back modestly and reduce grid/control emphasis without changing player size or gameplay coordinates.

Expected proof: The courier and its label should be fully inside portrait bounds, at least one more hostile should remain visible, and the world should outrank the grid and controls in the first glance.

## Sol

Screenshot: `sol/screenshots/first-frame-desktop.png` (`49e5ec9dde62c0326c30293fbd4baa11ceeba7bb7c6ab14a57731caa4e6ba050`) and `sol/screenshots/first-frame-portrait.png` (`36c6514cd863459f5ca911aa29932ab96bdd16c86179d20c4d657b18abb18dff`)

Viewport/state: 1440x900 and 390x844, opening state after readiness plus 250 ms, no input

Interpreter: native image view

Verdict: GOOD

Blunt read: This looks good because the oblique field, centered faceted player, distinct station/beacon/wreck, restrained HUD, distributed contacts, and world-anchored debris preserve the reference hierarchy in desktop, portrait, thumbnail, and grayscale views.

Immediate impression: The player anchors the middle, the station and beacon establish the sector above/right, and hostile contacts form a readable perimeter rather than crowding one edge.

Reference delta 1: Ship and station models remain materially simpler and less faceted than the oracle, with fewer layered mechanical details.

Reference delta 2: The diagonal grid is more prominent and the star/haze field is less rich than the reference, although debris restores some depth.

Reference delta 3: Portrait clips portions of edge hostiles and lets the top-right controls crowd the station slightly, while the reference keeps those relationships cleaner.

Requirement risk: No load-bearing visual invariant fails; the remaining gap is finish/detail density and slight portrait edge crowding.

Keep: Preserve the current camera, player scale, contact distribution, grayscale separation, and compact joystick/radar footprint.

Repair next: Reduce the grid one step and inset the portrait contact distribution while leaving camera pitch, player scale, and station scale unchanged.

Expected proof: The grid should recede behind ships at thumbnail size and the right-side hostile should remain fully legible in portrait without making the sector feel empty.
