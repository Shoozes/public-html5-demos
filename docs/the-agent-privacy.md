# The-Agent Privacy Policy

**Effective date:** 2026-09-01  
**Operator:** Shoozes (Justin Case Caceres)  
**Contact:** GitHub [@Shoozes](https://github.com/Shoozes) issues on [public-html5-demos](https://github.com/Shoozes/public-html5-demos), or the Discord server owner who invited the bot.

This notice describes the intended first-release behavior of **The-Agent**, a private-team, local-first Discord bot. It is a public summary for Discord’s application profile and for people who interact with the bot. It is **not** permission to enable cloud workers before the operator’s privacy gates pass.

## What this bot is

The-Agent is experimental software for a private Discord team. It is invited to servers by an operator. It is not a consumer SaaS product and does not sell personal data.

## What may be processed

When the bot is invited and authorized by operator policy, it may process:

| Class | Examples | Purpose |
| --- | --- | --- |
| Discord source and queue | Message content, author/channel/guild/thread IDs, reply references, principal, attempts, errors | Intake and work routing |
| Sessions | Conversation turns, message/subject IDs, summaries, timestamps | Continuity in an authorized channel/thread |
| Voice evaluation rows (if enabled) | Draft/final text and quality/privacy flags | Private voice evaluation |
| Live corpus | Curated project notes, shallow preferences, evidence indexes | Operator-authorized memory for a project |
| Logs / activity | Operational events, errors, model/process health | Operator diagnostics |
| Screenshots (only on explicit request) | Pixels and capture metadata | Visual request handling |
| Approvals / audit | Principal, scopes, action, outcome, evidence IDs | Security and high-impact controls |
| Backups | Encrypted private stores and manifests | Recovery |

The bot does **not** run hidden screenshot capture, build a deep personal dossier, or keep cross-channel memory by default.

## Local vs cloud processing

- **Default:** local-first processing on the operator’s host.
- **Cloud workers:** off by default. Cloud processing happens only if the operator explicitly allowlists a channel (and, where required, separate DM/thread opt-ins).
- Sensitive classifications and screenshots remain local-only unless separately reviewed by the operator.

## Retention (intended maxima)

| Store | Intended maximum |
| --- | --- |
| Terminal queue payloads | 7 days |
| Sessions | 30 days |
| Voice evaluation rows | 30 days |
| Operational logs | 14 days |
| Screenshots | 24 hours |
| Approvals / audit | 90 days |
| Backups | 30 days |

Active work may be retained until it finishes. Project evidence follows project retention rather than an implicit permanent lifetime.

## Access, export, and deletion

- Runtime state, tokens, exports, and backups are **private** and are not published in this public repository.
- Ask the Discord server owner / operator for privacy status, export, or deletion (`/privacy`, export, or `/forget` style controls where enabled).
- Owner-confirmed subject deletion removes matching structured records and clears derived indexes and eligible backups where those controls are implemented.

## Children

The-Agent is not directed at children under 13. Do not use it to collect personal information from children.

## Changes

The operator may update this policy. Material changes will be reflected on this page with a new effective date.

## Related

- [Terms of Service](https://shoozes.github.io/public-html5-demos/legal/tos/)
- Discord’s own [Privacy Policy](https://discord.com/privacy) and [Terms](https://discord.com/terms) also apply when you use Discord.
