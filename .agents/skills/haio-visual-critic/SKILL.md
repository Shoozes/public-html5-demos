---
name: haio-visual-critic
description: Compare deterministic HAIO browser screenshots against fixed visual references, issue blunt evidence-based verdicts, and drive bounded visual repairs without replacing functional tests.
---

# HAIO Visual Critic

Use this skill for browser games, visual explainers, and HTML-all-in-one artifacts when a fixed reference image or written visual contract exists.

The purpose is not pixel copying. Clone the observable visual contract: hierarchy, scale, spacing, silhouette, contrast, depth, motion cues, HUD footprint, and interaction readability.

## Required inputs

Before reviewing, locate and confirm:

- fixed desktop reference image;
- fixed portrait reference image;
- `submission/VISUAL_CONTRACT.md`;
- actual screenshot path;
- exact viewport and game state;
- selected visual-interpreter lane from the experiment manifest.

Do not review from memory. Do not substitute a different reference. Do not edit or regenerate frozen references.

## Tool ownership

- Playwright owns deterministic browser state, console/network capture, and screenshots.
- The selected visual interpreter owns semantic image analysis.
- Functional tests own behavior and lifecycle proof.
- This skill owns comparison language, evidence structure, repair scope, and before/after preservation.

A screenshot existing does not prove visual quality. A visual critique does not prove functional correctness.

## Visual-interpreter lane

The operator must freeze one lane for the whole comparison.

### Native image-reading lane

Use the environment’s image-viewing capability to inspect both the fixed reference and actual screenshot in the same review context.

### GenEye lane

Use only when the same real GenEye profile is available to every run.

Before semantic use:

1. discover capabilities and resolved paths;
2. inspect model profiles;
3. confirm the selected profile is ready;
4. use the real profile, preferably `general-game-qa`;
5. require the real model rather than accepting a mock profile;
6. record the exact command and output path.

A typical saved-image review is equivalent to:

```text
geneye quick --image <actual-screenshot> --prompt <critic-prompt> --profile general-game-qa --require-real-model
```

Playwright should still capture headless browser screenshots. Do not replace deterministic browser capture with desktop-compositor capture.

If the frozen lane is unavailable, stop and record a harness failure. Do not silently switch lanes for one model.

## Review order

1. Confirm viewport, state, seed, and reference checksum.
2. Inspect the actual screenshot alone for immediate impression.
3. Inspect actual and reference together.
4. Inspect both at full size.
5. Inspect both at approximately 25 percent thumbnail size.
6. Inspect grayscale or luminance-reduced copies when available.
7. Write the verdict before reading the builder’s source rationale.
8. Name one bounded repair.
9. Capture a new screenshot after the repair.
10. Compare before and after against the same reference.

This ordering reduces builder commitment bias. The critic evaluates the presented frame, not the effort that produced it.

## Required visual dimensions

Evaluate all of these:

### Composition

- Is the intended subject obvious?
- Is the player near the intended screen position and scale?
- Does a station, landmark, HUD panel, or effect dominate unintentionally?
- Is useful negative space preserved?
- Are important contacts clipped or crowded?

### Silhouette

- Can player, hostile, neutral, station, wreck, beacon, and pickup be distinguished without labels?
- Do ships have meaningful multi-part profiles?
- Are faction variants more than recolored copies?
- Does the forward direction read correctly?

### Lighting and contrast

- Is the background dark while interactive geometry remains readable?
- Do key, fill, rim, and emission reveal form?
- Are shadow faces crushed to black?
- Does the player survive thumbnail and grayscale inspection?
- Are HUD panels visually louder than the game world?

### Depth and motion cues

- Does the oblique view reveal height?
- Are near-field objects world anchored?
- Does the far field provide restrained parallax instead of moving rigidly with the camera?
- Does movement look like traversal rather than animation in place?

### HUD and touch hierarchy

- Does the HUD stay at the edges?
- Does it block selections or central play?
- Are controls clipped or overlapping?
- Is the joystick the primary persistent control?
- Are contextual controls small and state-dependent?

### Gameplay-state readability

- Can aggression, target lock, weapon aim, damage, destruction, drops, magnetic pull, collection, and restart state be read from the image?
- Are particles shaped and scaled appropriately?
- Are pickups visible without resembling background stars?

## Verdict scale

### BROKEN

A load-bearing visual invariant fails. Examples:

- player or major landmark not visible;
- scene is effectively black;
- camera orientation is wrong;
- ship faces backwards;
- HUD blocks the game;
- reference hierarchy is absent;
- controls clip or overlap;
- rendered state does not match the requested milestone.

### ODD

The frame is functional but visibly wrong, awkward, ambiguous, or poorly calibrated. Examples:

- station dominates portrait view;
- player is too small or too large;
- ships read as capsules;
- far field makes movement look stationary;
- lighting is technically present but forms remain muddy;
- event feed or particles compete with the player.

### GOOD

The frame preserves the main visual contract and has no load-bearing defect. `GOOD` does not mean identical or finished. It still requires three reference deltas and one possible improvement.

## Mandatory review entry

Append one entry to `submission/VISUAL_REVIEW.md`:

```text
Screenshot: <path>
Reference: <path and checksum>
Viewport/state: <width>x<height>, <state>, seed <seed>
Interpreter: <native image view | GenEye profile>
Verdict: BROKEN | ODD | GOOD
Blunt read: This looks <broken/odd/good> because...
Immediate impression: <what a person notices first>
Reference delta 1: <specific visible relationship>
Reference delta 2: <specific visible relationship>
Reference delta 3: <specific visible relationship>
Requirement risk: <which visual or gameplay invariant is threatened>
Keep: <one thing that already works>
Repair next: <one bounded visual change>
Expected proof: <what should visibly improve in the next screenshot>
```

Disallowed evidence-free phrases:

- looks coherent;
- looks polished;
- matches the vibe;
- seems fine;
- visually pleasing;
- good enough.

These phrases may appear only when followed by concrete visible evidence.

## Repair discipline

Make one bounded repair per review entry. Examples:

- reduce station scale or move it outside the player’s immediate hierarchy;
- raise fill-light intensity without changing the background;
- enlarge the player by 12 percent;
- replace one capsule hull with a multi-primitive silhouette;
- reduce event-panel height;
- separate pickup hue and scale from stars;
- anchor near debris in world space;
- add a weapon pivot without changing hull heading.

Do not combine a camera rewrite, lighting redesign, HUD rewrite, and ship rebuild into one untraceable “polish pass.”

After repair:

1. capture a new file with a new name;
2. compare to both the prior screenshot and fixed reference;
3. state whether the expected proof appeared;
4. keep the change only when it improves the target without breaking functional tests.

Limit a milestone to three repair loops. Exceeding that limit means the initial visual contract or architecture was insufficient and must be recorded as such.

## Darkness gate

Space may be near-black. Important objects may not disappear into it.

Mark the frame `BROKEN` or `ODD` when:

- more than half of an interactive ship collapses into black;
- player, hostile, station, and wreck merge into one grayscale value range;
- emission is the only visible geometry;
- a heavy vignette or fog erases play-space information;
- the HUD is the brightest and most detailed subject;
- the player fails thumbnail recognition.

Repair object lighting, material value, rim separation, and local contrast before brightening the entire background.

## Self-critique and external critique

For controlled experiments, preserve two reviews:

1. **Blind self-critique:** written by the coding agent from the reference and screenshot before seeing external critic output.
2. **Standardized external critique:** produced through the frozen semantic lane with the same prompt for every model.

Do not merge them retroactively. Record disagreements. The final evidence must identify which defects the model saw alone, which required the tool, and which neither caught.

## Evidence integrity

- Never overwrite reference images.
- Never overwrite before screenshots.
- Record viewport, seed, state, and checksum.
- Do not claim the screenshot was inspected when only its path was listed.
- Do not claim a repair worked without a new image.
- Do not use image generation to fabricate proof of the implemented game.
- Do not treat pixel similarity as the only success criterion.
- Preserve functional console, network, interaction, and invariant results separately.

## Done when

The visual checkpoint is complete only when:

- the screenshot was captured from the actual artifact at the required state;
- the fixed reference and actual image were both inspected;
- the required verdict entry exists;
- the critique names concrete deltas;
- a bounded repair was attempted when required;
- before/after evidence is preserved;
- the expected visual change is confirmed or honestly rejected;
- functional gates still pass.