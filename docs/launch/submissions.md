---
title: Directory submissions & awesome lists
status: draft — checklist + copy-paste PR texts
tags: [launch]
---

# Directory submissions & awesome lists

> [!info] Rule
> Directories want *working installs* and *populated repos*. Submit after PR #1–#4 merge so the Pages site, topics, and CONTRIBUTING exist.

## skills.sh

The repo already carries a skills.sh badge. To be sure it's indexed:

1. Open <https://skills.sh> and search `agent-tutor`.
2. If missing, submit via their flow (Add skill → GitHub URL `Mohamed-El-Sharqawy/agent-tutor`). The package already validates: `npx skills add ./ --list` discovers all three skills.
3. Verify the page shows all 3 skills and recent activity.

## awesome lists — PR texts

### awesome-claude-code (and any awesome-claude-skills list)

> **PR title:** Add agent-tutor — structured AI tutor skills (plans, lessons in your vault, honest quizzes, spaced repetition)
>
> **Entry:**
> ```markdown
> - [agent-tutor](https://github.com/Mohamed-El-Sharqawy/agent-tutor) — Turn your agent into a structured personal tutor: learner profile, phased plans, lesson notes in your own Obsidian vault, honest 70%-pass quizzes, and spaced-repetition reviews. Works on Claude Code and 70+ agents.
> ```

### awesome-obsidian / Obsidian community

> **PR / forum post title:** agent-tutor — an AI tutor that writes lessons, quizzes, and a review schedule into your vault
>
> **Body (short):** The tutor is an agent skill (plain markdown, MIT). It keeps everything under `Learning/` in your vault: a learner profile it actually follows, phased plans, complete lesson notes with self-check questions, quiz reports, and a spaced-repetition review queue rendered on your dashboard. Example rendered vault: <PAGES_URL>

### awesome-agents / agent-adjacent lists

> **Entry:**
> ```markdown
> - [agent-tutor](https://github.com/Mohamed-El-Sharqawy/agent-tutor) — Agent-agnostic tutor skills: interviews how you learn, teaches from your own sources (URL/PDF/repo), quizzes honestly, schedules reviews — all as markdown you own. Claude Code, Codex, Cursor, Windsurf, pi, 70+ agents.
> ```

## Checklist (ordered)

- [ ] PR #1 (learner profile) merged
- [ ] PR #2 (source ingestion) merged
- [ ] PR #3 (README reposition) merged
- [ ] PR #4 (Pages homepage) merged + Pages enabled + homepage URL set
- [ ] Repo topics set
- [ ] Pinned "What are you learning?" issue live
- [ ] skills.sh listing verified
- [ ] awesome-claude-code PR opened
- [ ] awesome-obsidian PR/forum post opened
- [ ] Show HN posted (docs/launch/show-hn.md)
- [ ] r/ObsidianMD posted
- [ ] r/ClaudeAI posted (2–3 days later)
- [ ] r/ChatGPTCoding posted (2–3 days later)

## Replace before posting

- `<PAGES_URL>` → `https://mohamed-el-sharqawy.github.io/agent-tutor/`
- Screenshot links → final demo/screenshots/* paths
