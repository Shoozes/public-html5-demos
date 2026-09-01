# Next Round: Explicit Mockup and Visual-Critic Contract

Use this as Round 5A. It keeps image generation fixed at the operator layer so the coding-model comparison is not confounded by different generated images.

## Frozen inputs

Every model receives the same:

- baseline commit;
- pass-down and rubric;
- read-only browser harness;
- `mockups/desktop-reference.png`;
- `mockups/portrait-reference.png`;
- browser executable and dependency paths;
- reasoning setting, time budget, and repair allowance.

The operator generates the reference pair once with the imagegen skill before any model run. Models must not regenerate, edit, or replace the references during Round 5A.

## Required skill/tool stack

Each model must use the same declared workflow:

1. Read the reference mockups with an image-viewing or visual-analysis tool before coding.
2. Use Playwright for deterministic navigation, interaction, console/network capture, and screenshots.
3. Use image viewing or the designated visual-capture skill to inspect every saved milestone screenshot.
4. Do not use Sites, a design-template generator, or another scaffold that changes output paths or runtime contracts.
5. Record each skill/tool used, why it was used, and the evidence it produced.

If a required skill is unavailable, record that as a harness failure; do not silently substitute a different workflow.

## Phase 0: Translate the mockup into an implementable contract

Before coding, write `submission/VISUAL_CONTRACT.md` with:

- ten concrete observations from the desktop reference;
- five portrait-specific observations;
- player viewport-height target;
- camera angle/projection interpretation;
- object placement and spacing relationships;
- silhouette rules for player, hostile, neutral, station, wreck, and beacon;
- palette, lighting, material, glow, and grid rules;
- HUD placement, maximum footprint, and control hierarchy;
- which reference details are practical with procedural Three.js;
- which details will be simplified without losing the invariant.

Every observation must name visible evidence. “Polished sci-fi” is not an observation; “the cyan player is approximately one tenth of viewport height and isolated by negative space” is.

## Phase 1: Build the first frame

Implement only bootstrap, camera, player, station, beacon, background, and compact HUD. Capture desktop and portrait screenshots before adding combat.

Do not proceed until both frames pass the visual-critic checkpoint below.

## Mandatory visual-critic checkpoint

After every milestone screenshot, append one entry to `submission/VISUAL_REVIEW.md` using this exact form:

```text
Screenshot: <path>
Verdict: BROKEN | ODD | GOOD
Blunt read: This looks <broken/odd/good> because...
Immediate impression: <what a person notices first>
Reference delta: <three specific differences from the fixed mockup>
Requirement risk: <which pass-down invariant those differences threaten>
Keep: <one thing that already works>
Repair next: <one bounded visual change>
Expected proof: <what should visibly improve in the next screenshot>
```

Rules:

- The blunt read is mandatory. Generic “looks coherent” or “looks polished” language fails the checkpoint.
- A `GOOD` verdict still requires three reference deltas and one possible improvement.
- Cite visible relationships: scale, overlap, clipping, negative space, silhouette, contrast, depth, hierarchy, alignment, or crowding.
- Do not discuss source architecture in this checkpoint unless it directly explains a visible defect.
- Make one bounded visual repair, capture again, and compare before continuing.
- Keep before/after screenshots. Never overwrite evidence.

## Phase 2: Gameplay layers

Repeat the visual checkpoint after:

1. first frame;
2. movement and camera;
3. active combat;
4. destruction and pickups;
5. magnetic collection;
6. restart;
7. final desktop and portrait states.

Functional assertions remain mandatory. Visual review supplements the browser harness; it does not replace behavior proof.

## Visual scoring additions

Add 20 visual-convergence points alongside the existing 100-point functional rubric:

| Visual area | Points |
| --- | ---: |
| Reference analysis specificity | 4 |
| Desktop composition convergence | 4 |
| Portrait composition convergence | 4 |
| Silhouette/material/lighting convergence | 4 |
| Critique honesty and repair effectiveness | 4 |

Record both scores separately. Do not hide a functional failure with visual polish or a visual failure with passing assertions.

## Round 5B option

Only after Round 5A, run a separate workflow experiment in which every coding agent invokes imagegen to create its own mockup before implementation. That tests autonomous art direction plus implementation, but it no longer isolates coding-model quality because generated references will differ.
