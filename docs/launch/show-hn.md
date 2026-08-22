---
title: Show HN launch draft
status: draft — post after PR #2 (source ingestion) merges
tags: [launch]
---

# Show HN — launch draft

> [!warning] Gate
> Post only after #2 (source ingestion) merges — the submission promises `learn from <URL|PDF/repo>`.

## Title (pick one)

1. **Show HN: I turned my coding agent into a tutor that writes lessons into my Obsidian vault** ← recommended (personal, concrete)
2. Show HN: Agent-tutor – an AI tutor skill that works with any coding agent
3. Show HN: My agent quizzes me honestly and schedules my reviews – all in markdown I own

## Text

---

Hi HN, I built a tutor that runs inside the coding agent you already use.

The problem: chat is a great place to get answers and a terrible place to learn. You ask, you get a wall of text, you nod, you scroll — three days later you remember none of it. Every "explain X like I'm five" thread is the same story.

agent-tutor is a set of agent skills (markdown files, no runtime, MIT) that make Claude Code / Codex / Cursor / Windsurf / pi behave like a structured tutor:

- It interviews you first — not just your goal, but *how you learn* (analogies vs diagrams vs worked examples, blunt vs gentle feedback, dense vs step-by-step). The answers become a "teaching contract" stored in your vault that every lesson follows.
- It builds a phased plan (3–6 phases, topics sized to ~45-min sittings), then writes each lesson as a complete markdown note in your Obsidian vault — diagrams, worked examples, pitfalls, self-check questions.
- It quizzes after every lesson with a hard 70% pass mark and *honest* feedback: it names the exact misconception behind each wrong answer. A 60% is "you're not there yet", not "great effort".
- It schedules spaced-repetition reviews with FSRS-inspired adaptive intervals, recall-first.
- You can say "learn from <URL | PDF | repo>" and it builds the plan from that material, citing the exact sections each lesson draws on.

Everything is plain markdown on your disk. No account, no backend, no lock-in. It works on any agent that supports the Agent Skills standard because the skills themselves are just markdown instructions.

An example vault (dashboard with progress charts, a real lesson, a quiz report) is rendered here: <PAGES_URL>

Install:

    npx skills add Mohamed-El-Sharqawy/agent-tutor

The honest bits: the spaced-repetition scheduler is FSRS-inspired heuristics computed from your verdicts, not a trained model; the learner profile is an interview, not telemetry; and it only works if your agent can read/write files. I tested it mainly with pi and Claude Code.

Happy to answer anything — especially what breaks on other agents.

---

## Comment prep (likely questions)

- *"Why not just prompt ChatGPT to teach me?"* → state is the difference: the vault (plan, notes, review schedule, learner profile) persists across sessions and agents. Prompts forget; files don't.
- *"How is this different from Bloom / other tutor skills?"* → honest comparison table in the README; main axes: agent-agnostic + vault-owned, and honest-feedback rules written into the skill.
- *"Does it phone home?"* → no telemetry; the skill only writes markdown/SVG under your Learning/ folder; security rules are in the README and enforced by the skill text.
- *"Why FSRS-inspired and not full FSRS?"* → the review skill already tracks verdicts per note and adapts intervals from them; a full model-backed FSRS port stays on the roadmap.
