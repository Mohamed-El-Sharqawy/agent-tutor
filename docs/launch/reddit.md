---
title: Reddit launch drafts
status: draft — post after PR #2 merges; stagger by 2–3 days per subreddit
tags: [launch]
---

# Reddit launch drafts

> [!tip] Posting order
> 1. r/ObsidianMD (unique angle, friendliest) → 2. r/ClaudeAI → 3. r/ChatGPTCoding. Adjust tone per community. Check each subreddit's self-promo rules first.

## r/ObsidianMD

**Title:** I built an AI tutor that writes its lessons straight into my Obsidian vault

**Body:**

I use Obsidian for everything, so AI tutors that keep my notes in their own app/database never stuck for me.

So I wrote agent-tutor — a set of skills (just markdown, MIT, no runtime) that turns a coding agent (Claude Code, Codex, Cursor, Windsurf, pi…) into a tutor that works *inside my vault*:

- It interviews how I learn (analogies? diagrams? blunt feedback?) and stores a "teaching contract" at `Learning/learner-profile.md` — every lesson follows it
- Phased plan, one lesson-note per topic (callouts, worked examples, self-check questions you answer inside the note)
- Quizzes with a 70% pass mark and honest feedback, spaced-repetition reviews with FSRS-inspired adaptive intervals
- Dashboard.md gets progress donuts/forecast SVGs, updated as you go
- Your existing vault is untouched — everything lives under `Learning/`

There's a rendered example vault here: <PAGES_URL>

Install: `npx skills add Mohamed-El-Sharqawy/agent-tutor`

It's Obsidian-flavored (wikilinks, callouts) but works fine in VS Code/GitHub — notes are just markdown.

Happy to hear what the Obsidian crowd thinks — especially power users: what would you want it to write into your vault?

## r/ClaudeAI

**Title:** My Claude Code is now my tutor — a skill that profiles how you learn, writes lessons into your notes, and quizzes you honestly

**Body:**

Skills are just markdown, so I wrote a tutor one. After install, you say "I want to learn X" and it:

1. Interviews you — how you think (big-picture vs bottom-up), what makes things click for you (analogy/diagram/example), how blunt you want feedback
2. Writes a phased plan you approve
3. Writes each lesson as a full markdown note (not chat — an artifact you keep)
4. Quizzes you (70% to pass) and gives *honest* feedback — it names the exact misconception behind each wrong answer instead of "great effort!"
5. Schedules reviews so you don't forget

Works with a plain Claude Code install, or with the pi extensions for arrow-key quizzes. Also on Codex/Cursor/Windsurf since it's agent-agnostic. Example rendered vault: <PAGES_URL>

    npx skills add Mohamed-El-Sharqawy/agent-tutor

Repo: https://github.com/Mohamed-El-Sharqawy/agent-tutor

Currently building: Anki export. What subject would you throw at it?

## r/ChatGPTCoding

**Title:** Agent skills aren't just for coding — I use one to tutor me, with lessons saved as markdown I own

**Body:**

Same core post as r/ClaudeAI, but lead with the agent-agnostic angle:

> I switch agents every few months, so I wanted my learning history to outlive any of them. The skill writes everything (profile, plan, lessons, quiz reports, review schedule) as plain markdown into a folder I own. New agent, same tutor.

Then the 5-step loop, install command, repo link, and one screenshot of the dashboard + one lesson note.

## Comment policy (all subreddits)

- Reply to every question within the first 2 hours
- Be upfront about limitations unprompted (interview-based profile, no telemetry)
- Never astroturf; if someone compares to Bloom or feynman-tutor, credit them honestly
