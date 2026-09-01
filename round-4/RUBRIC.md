# Round 4 Rubric

Apply the hard gates before assigning any quality score.

## Hard gates

| Gate | Requirement |
| --- | --- |
| Artifact | `submission/index.html` is one complete HTML document. |
| Parse | Inline module JavaScript parses without manual repair. |
| Bootstrap | Pinned imports resolve and `WebGPURenderer.init()` completes. |
| First frame | A visible player, space background, and landmark render without an error overlay. |

## Scored areas

| Area | Points |
| --- | ---: |
| Artifact and format compliance | 10 |
| Bootstrap and runtime reliability | 15 |
| World identity and lifecycle correctness | 15 |
| Movement, facing, and camera | 15 |
| Threat, targeting, and combat | 15 |
| Magnetic salvage loop | 10 |
| Visual clarity and sector atmosphere | 10 |
| Mobile UI and interaction | 5 |
| Restart, diagnostics, and cleanup | 5 |
| **Total** | **100** |

## Required evidence

The browser run must cover bootstrap, portrait and desktop composition, opening safety, four-way movement/facing, aggression, automatic target acquisition and fire, disengagement suppression, target destruction/cleanup, magnetic pickup collection, a contextual landmark action, input recovery, restart, post-restart invariants, console errors, rejected promises, and network failures.

Record model/run metadata, commands, browser backend when observable, screenshot paths, invariant output, file size, line count, failures, repairs, limitations, and operator intervention in `submission/EVIDENCE.md`.
