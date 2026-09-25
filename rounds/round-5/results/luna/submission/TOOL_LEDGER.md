# Round 5A Tool Ledger

| Tool or skill | Available | Used | Why | Evidence produced | Decision or repair caused | Skip/failure reason |
| --- | --- | --- | --- | --- | --- | --- |
| `node round-5/harness/verify-package.mjs` | yes | yes | Verify the frozen package before edits | Harness pass output | Allowed the arm to proceed | none |
| Native image view | yes | yes | Fixed semantic interpreter lane for both references and actual captures | Reference inspection and screenshot reviews | Set composition, silhouette, lighting, HUD, and repair targets | GenEye intentionally not used; lane is frozen |
| Playwright 1.62.1 | yes | yes | Deterministic browser bootstrap, functional scenarios, and screenshots | `submission/evidence/*.png`, scenario log | Drove functional repairs and visual captures | none |
| Google Chrome 152.0.7977.65 | yes | yes | Frozen browser lane | Browser harness output | Kept capture environment stable | none |
| HAIO visual critic skill | yes | yes | Required bounded visual review and repair discipline | `VISUAL_REVIEW.md`, self/external evidence | Limited repairs to one visible issue at a time | none |
| `apply_patch` | yes | yes | Scoped writes only inside `submission/` | Submission files | Preserved frozen inputs and owner boundaries | none |

## Frozen run facts

- Dispatch commit: `1aa2761d8d091c687f91d83bcd02a1efd8b67a59`
- Visual interpreter: native image view
- Viewports: 1440x900 desktop; 390x844 portrait references; functional mobile lane 430x932
- Budgets: 60 minutes; at most 12 visual repairs and 8 functional repairs
- Frozen package harness: passed before implementation
