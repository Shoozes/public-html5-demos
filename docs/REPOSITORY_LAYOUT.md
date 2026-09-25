# Repository layout

Updated: 2026-09-25

| Location | Owner |
| --- | --- |
| `projects/<slug>/index.html` | Canonical maintained demos |
| `rounds/round-1/` through `rounds/round-6/` | Experiment protocols, historical artifacts and evidence |
| `rounds/round-5-5/` | GPT-6 follow-up protocol; no candidate runs yet |
| `rounds/index.html` | Public experiment Flight Log |
| `assets/`, `shared/` | Shared runtime media and code |
| `docs/`, `tests/`, `tools/` | Current documentation, verification and maintenance |
| `legal/` | Stable Discord policy URLs |

The root gallery links to the canonical locations. Existing playable URLs remain
available through generated compatibility entry points. These thin root folders
are intentional; put new projects and experiment content only in their owners.

Run `node tools/sync-legacy-routes.mjs` after changing canonical entry files.
`--check` rejects stale exports and redirects. Redirects retain query strings and
fragments. The Ragdoll Lab legacy entry is an executable, path-rebased export
because its separate ChatGPT Site currently fetches that raw GitHub source path.
Do not edit that export manually. Changing the Site's sync allowlist is a separate
deployment task; this move does not deploy or modify the Site.

## Historical integrity

Before this move, repository `main` was
`233cd51aa9c23185f6e910d2bb01b224e939f3f4`.
Round 5's frozen content commit remains
`591530a153eac58d4dfdfed05162cd65a7b9cc78`.

All historical Round 1–5 Markdown, manifests, submitted HTML, images and structured
results keep their bytes. Their recorded old paths describe the original runs;
they are not instructions to relocate the current checkout back to the old tree.
The Round 5 manifest and its checksums are not rewritten. Maintenance harnesses
have only the path adjustments needed by the new layout. Replays extract the
original frozen input bytes from Git, never the path-adjusted maintenance files.

The live archive verifier maps old manifest paths to their new locations and still
checks the original frozen content in Git. The layout check compares moved
historical records directly with the pre-move commit. Preserve both commits when
making a shallow checkout:

```sh
git fetch origin 233cd51aa9c23185f6e910d2bb01b224e939f3f4 591530a153eac58d4dfdfed05162cd65a7b9cc78 07845f415c78ebbb109ff6a97401f50b95ea24a4
node tests/repository-layout.mjs
node rounds/round-5/harness/verify-archive.mjs
node rounds/round-5/operator/verify-results.mjs
```

Historical GitHub file URLs can be inspected at their recorded commit. The move
preserves playable entry URLs, not every old raw documentation or image URL.
The retired one-use Anthrocybernetics upload workflow was removed: its input no
longer exists and its target predated the current canonical demo.
