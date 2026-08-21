---
title: Market Research — Agent Tutor Skills
date: 2026-08-21
data: Live GitHub API crawl on 2026-08-21 (+ marketplace checks)
tags: [market-research, product, roadmap]
---

# Market Research: Agent Tutor Skills

> [!abstract] TL;DR
> The "AI tutor as an agent skill" niche is small but moving fast (leader: **Bloom, 238★**, launched weeks ago). Almost every competitor is **Claude-Code-only** and stores progress in hidden folders or a web app. **agent-tutor is the only agent-agnostic, vault-first tutor** — that's a real wedge, but it's missing the #1 demand signal (learn from *your own* material: PDFs/URLs/repos) and has zero discovery infrastructure (no topics, no listings, no community surfaces). Fix the source-ingestion gap, own the Obsidian positioning, and ship the distribution basics below.

## 1. Method

Live data pulled 2026-08-21 via GitHub Search API (queries: `agent skill tutor learning`, `claude skill learning tutor`, `spaced repetition agent llm`, `obsidian tutor agent`), plus README crawls of the top 9 repos, `anthropics/skills` (official), agentskills.io, and skills.sh. Star counts are a snapshot; this niche moves weekly.

## 2. Market map

| Repo | ★ | Core idea | Install target | Where learning lives |
|---|---|---|---|---|
| [Li-Evan/Bloom](https://github.com/Li-Evan/Bloom) | 238 | Full tutor: syllabus → lesson → annotate → adapt. CLI + React/FastAPI web app, EN/中文, website, 2-Sigma framing | Claude Code (plugin/clone) | App DB / its folders |
| [Terryc21/tutorial-creator](https://github.com/Terryc21/tutorial-creator) | 24 | Lessons generated **from your codebase**, vocabulary + confusion tracking | Claude Code | Project tutorials dir |
| [koukekoukej-glitch/feynman-tutor](https://github.com/koukekoukej-glitch/feynman-tutor) | 20 | Role reversal: **you teach the AI**, it probes gaps (ZPD); extracts from YouTube/B站/PDF/arXiv | Claude Code + generic | Persistent notes + learner model |
| [JEFF7712/claude-tutor](https://github.com/JEFF7712/claude-tutor) | 16 | Simple adaptive tutor plugin | Claude Code | Chat session |
| [swaylq/sijiao-skill](https://github.com/swaylq/sijiao-skill) | 16 | "私教" stateful private tutor distilled from any skill; website, share buttons, CI | Claude Code (skills.sh badge) | State files |
| [briannajzhang/personal-tutor](https://github.com/briannajzhang/personal-tutor) | 11 | "Learns how you learn"; courses from anything; simulations/experiments; polished screenshots | Claude Code | Local courses |
| [hwl668/Scientific-learning-skills-](https://github.com/hwl668/Scientific-learning-skills-) | 12 | Diagnosis-before-explanation; vocabulary with memory scheduling | Claude Code/Codex/generic | Memory files |
| [Bhala-Srinivash/agent-tutor-skill](https://github.com/Bhala-Srinivash/agent-tutor-skill) | 7 | Cognitive-science loop, **FSRS** adaptive repetition, mastery badges, teach from PDF/URL/code, `~/.learn/` global profile | Claude Code | `~/.learn/` |
| [lowwwbank/anything-to-course](https://github.com/lowwwbank/anything-to-course) | 5 | Any material → self-study course | Agent skills | Course files |
| **agent-tutor (this repo)** | 1 | Interview → profile → phased plan → vault lessons → quizzes → honest feedback → spaced reviews + dashboard | **Any agent** (pi, Claude Code, Codex, Cursor, Windsurf…) | **User's Obsidian vault** |

Official ecosystem: `anthropics/skills` has **no** tutoring skill (`academy-guide` only recommends Claude product courses). agentskills.io is spec-only. skills.sh is the live directory — none of the tutoring repos above appears prominently yet. **The directory slot for "serious tutor" is still open.**

## 3. Feature matrix

| Capability | Bloom | tutorial-creator | feynman | Bhala | **agent-tutor** |
|---|---|---|---|---|---|
| Learner profile / adaptive style | ✅ reads annotations | ➖ | ✅ learner model | ✅ diagnostic | ✅ **v3 interview + teaching contract** |
| Learn from user's material (PDF/URL/video) | ✅ | ✅ (code) | ✅ | ✅ | ❌ web *verification* only |
| Learn from your codebase | ✅ | ✅ | ➖ | ✅ | ❌ |
| Spaced repetition | ➖ evaluation loop | ➖ | ➖ | ✅ **FSRS adaptive** | 🟡 fixed ladder +1d→+90d |
| Teach-back / Feynman mode | ➖ | ➖ | ✅ core | ✅ explain-back | 🟡 recall-first reviews |
| Honest-feedback contract | ➖ | ➖ | ➖ | ✅ "can't fake understanding" | ✅ explicit, non-negotiable |
| Diagram/visual standards + validators | ➖ | ➖ | ➖ | ➖ | ✅ **unique** (visualize skill + linters) |
| Dashboard with progress charts | 🟡 web UI | ➖ | ➖ | ✅ badges | ✅ vault SVG dashboard |
| User owns notes (portable markdown vault) | 🟡 CLI mode | 🟡 project files | 🟡 notes | ❌ `~/.learn/` | ✅ **core design** |
| Agent-agnostic (not Claude-Code-locked) | ❌ | ❌ | 🟡 claims generic | ❌ | ✅ **core design + 3 synced targets** |
| Web app / no agent needed | ✅ | ❌ | ❌ | ❌ | ❌ |
| Security boundaries published | ❌ | ❌ | ❌ | ❌ | ✅ (trust signal for installs) |
| Bilingual README / i18n | ✅ EN/中文 | ❌ | ✅ EN/中文 | ❌ | ❌ |

## 4. What competitors get right (steal-worthy)

1. **Bloom** — narrative marketing: Bloom's 2-Sigma research gives a *why now*, a hero image, a website, bilingual README, plugin marketplace install. Their flow "read annotations → adapt next lesson" is genuinely good.
2. **tutorial-creator** — ruthlessly specific value prop ("learn from the code you ship every day") + real example artifact linked in the README.
3. **feynman-tutor** — role reversal is memorable and evidence-based (protégé effect); multi-source extraction covers how people actually study (YouTube, PDFs, articles).
4. **Bhala** — FSRS beats fixed intervals; concept-level mastery badges and misconception ("error notes") tracking are the right data model.
5. **sijiao-skill** — distribution discipline: website, Twitter share button, skills.sh badge, CI badge, cross-links to sibling skills.

## 5. Gaps nobody is filling (your openings)

1. **Agent-agnostic.** Every serious competitor is Claude-Code-first. Codex, Cursor, Windsurf, OpenCode, pi users have no tutor option. You already sync to `.agents/`, `.claude/`, `.windsurf/` with CI enforcing it — *nobody else can claim this*.
2. **Vault-first ownership.** Bloom needs Python+Node (or Docker); Bhala hides progress in `~/.learn/`. Nobody writes the learning journey as beautiful, portable Obsidian markdown the user keeps, publishes, or exports. The Obsidian community (millions of users, plugin-obsessed) has **no** dedicated AI-tutor skill being marketed at them.
3. **Interoperable review data.** Nobody exports to Anki. Your review queue is structured markdown → an `.apkg`/CSV export is cheap and instantly viral in the Obsidian/Anki overlap.
4. **Diagram-quality tooling.** No competitor has visual standards, let alone validators. Lessons that *look* good are your screenshot magnet.
5. **Trust/transparency.** No competitor publishes security boundaries. In a niche where skills ask for file write access, this converts cautious installers.
6. **Non-English-first learners.** Bloom/feynman do Chinese; nobody serves Arabic or other languages. Your profile already captures preferred language — lean into it.

## 6. Honest gaps in agent-tutor (vs. the market)

| # | Gap | Severity | Why it matters |
|---|---|---|---|
| 1 | **No source ingestion** — can't learn *from* a PDF/URL/YouTube/repo | 🔴 critical | 5 of 9 competitors have it; it's the top stated demand. Your web rules already cover safe fetching — extend them to ingestion |
| 2 | Fixed review ladder, not adaptive (FSRS/SM-2) | 🟠 high | Bhala markets this hard; it's objectively better scheduling and easy to add as a policy in the skill |
| 3 | No teach-back mode | 🟠 high | Feynman mode is the most shareable "wow" demo of real learning |
| 4 | No vocabulary/term tracker | 🟡 medium | Two competitors track terms; fits your jargon-pacing profile field naturally |
| 5 | Discovery: no GitHub topics, no homepage, not on skills.sh, no discussions, EN-only README | 🔴 critical for growth | You're invisible; product quality is moot if unfindable |
| 6 | No contributor surfaces: no CONTRIBUTING.md, issue templates, roadmap, good-first-issues | 🟠 high | Blocks the "people contribute" goal directly |
| 7 | Single-maintainer bus factor; extensions only tested in pi | 🟡 medium | Contributors need an architecture doc and a test story for the fallback path |
| 8 | No outcome evidence (before/after learning artifacts) | 🟡 medium | Bloom sells a research narrative; you can sell a *real artifacts* narrative (your example vault) |

## 7. Positioning (recommended)

> **"The agent-agnostic AI tutor that writes into *your* Obsidian vault."**

- vs **Bloom**: "No web app, no backend, no lock-in — works in Claude Code, Codex, Cursor, or pi, and your lessons live as markdown you own forever."
- vs **Bhala**: "Same cognitive-science rigor (honest feedback, spaced repetition) — but your learning journey is a vault you can publish, not `~/.learn/`."
- vs **tutorial-creator**: "Any subject — not just code — and it profiles how *you* think before writing lesson one."

Own the triangle: **agent-agnostic × vault-owned × honest feedback**. Do not compete on web UI.

## 8. Product roadmap

**P0 — before promoting (2–3 weeks)**
1. **Source ingestion**: "learn from `<URL|PDF|path|repo>`" — ingest → build plan from the actual material, cite it in every lesson (your citation rules are already written). Include a repo mode (learn a codebase) — reuse tutorial-creator's framing, generalized.
2. **Adaptive intervals**: replace the fixed ladder with SM-2/FSRS-style scheduling computed from review verdicts (pure policy change in the skill — no code needed).
3. **Teach-back mode**: a review variant where the user explains the topic from memory and the tutor grades against the note (you already do recall-first; formalize it as `/explain-back`).

**P1 — growth wave (month 2)**
4. **Anki export** of the review queue (CSV + `.apkg` via the vault). One screenshot = instant Obsidian/Anki-community traction.
5. **Term glossary** per subject, driven by the profile's jargon pacing.
6. **Bilingual READMEs**: Arabic + Chinese (rare in this niche; Bloom proves CN demand, AR is open ground).

**P2 — moat (month 3+)**
7. Subject packs (curated plan templates: Rust, Kubernetes, ML…) — also a perfect first-contribution surface.
8. Learning-outcome reports: a "what I actually retained" artifact users share publicly (organic loop).
9. Optional light web view that *reads* the vault (no backend, GitHub Pages static) — read-only, never required.

## 9. Distribution plan (stars + installs)

**Repo hygiene (do today, ~1 hour):**
- GitHub **topics**: `claude-code, claude-skills, agent-skills, ai-agents, tutor, learning, spaced-repetition, obsidian, codex, cursor, pi` (topics:[] right now).
- Homepage → publish `examples/vault` as a static site (Obsidian Publish or a trivial GitHub Pages render). Bloom's website is half its star velocity; you already have the artifact.
- Pin an issue: "What are you learning?" — cheap engagement + social proof.

**Listings (this week):**
- Submit to **skills.sh** (directory live, tutor category empty).
- PRs to `awesome-claude-skills`-type lists, `awesome-obsidian`, and competitor-adjacent lists under "alternatives".
- `npx skills add` already works — add the one-liner + a 15-second GIF of `intake → plan → lesson → quiz` to the top of the README (the GIF exists; move it above the fold).

**Launch (when P0 ships):**
- Show HN: "My coding agent is my tutor — it profiles how I learn and writes lessons into my Obsidian vault" (agent-agnostic angle is fresh; Bloom-style posts have traction history).
- r/ObsidianMD (vault-first angle), r/ClaudeAI + r/ChatGPTCoding (skills angle), r/LocalLLaMA (agent-agnostic works with local agents).
- One honest before/after: your real learning vault, not mockups.

**Ongoing:**
- Weekly "learning in public" post using your own tool on a real subject — the tool demoing itself is the ad.

## 10. Contributor strategy

1. **CONTRIBUTING.md** — key insight to state up front: *skills are markdown; you don't need to code to contribute.* Lower the barrier below every code-first competitor.
2. **ROADMAP.md** — public, checkboxed (reuse your own plan.md format — dogfood it).
3. **Issue templates**: `new-subject-pack`, `new-language`, `feature`, `bug`; label 10+ `good-first-issue`s (translations, subject packs, diagram recipes for the visualize skill).
4. **GitHub Discussions** (enable, currently off): "Show your vault" channel — every post is marketing.
5. **ARCHITECTURE.md**: repo layout, sync-skills flow, extension/fallback duality, how CI enforces drift — contributors' first question is "why three copies of skills/".
6. **Test story for the fallback path**: a tiny harness that runs the chat-quiz fallback against a script (your `tutor.sh` demo is a start) so non-pi contributors can validate.

## 11. 90-day scorecard

| Window | Goal |
|---|---|
| Day 30 | P0 shipped (source ingestion, adaptive intervals, teach-back) · topics/homepage/listings done · 100★ |
| Day 60 | Launch posts + Anki export + AR/中文 READMEs · 500★ · first 3 external contributors |
| Day 100 | 1k★ · 5 subject packs · 10 contributors · skills.sh top-of-category |

## Sources

- GitHub Search API queries, 2026-08-21 (star counts are snapshots)
- READMEs: Li-Evan/Bloom, Terryc21/tutorial-creator, koukekoukej-glitch/feynman-tutor, Bhala-Srinivash/agent-tutor-skill, briannajzhang/personal-tutor, swaylq/sijiao-skill, hwl668/Scientific-learning-skills-, JEFF7712/claude-tutor
- anthropics/skills contents (no tutor skill), agentskills.io (spec only), skills.sh (directory)
- Own-repo audit: GitHub API (`topics: []`, no homepage, no discussions) + local tree (CI ✓, demo.gif ✓, LICENSE ✓, no CONTRIBUTING.md)
