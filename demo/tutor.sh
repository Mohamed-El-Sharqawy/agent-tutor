#!/usr/bin/env bash
# demo/tutor.sh — scripted tutor session for the README demo GIF (vhs).
#
# Deterministic: the same input sequence always produces the same recording.
# The artifacts shown at the end are the real files from examples/vault/.
# Run it interactively to rehearse: bash demo/tutor.sh

cd "$(dirname "$0")/.." || exit 1
rm -rf Learning

B=$'\033[1;36m'   # tutor accent (cyan)
G=$'\033[1;32m'   # green
Y=$'\033[1;33m'   # yellow
D=$'\033[2m'      # dim
N=$'\033[0m'      # reset

say()   { printf '%s\n' "$1"; }
stream() { while IFS= read -r l; do printf '%s\n' "$l"; sleep 0.09; done; }
prompt() { printf '%syou%s> ' "$Y" "$N"; }

clear
say "${B}agent-tutor${N} ${D}v0.1 — the agent is now a tutor${N}"
say "${D}chat is orientation. the note is the artifact.${N}"
say ""

# ── exchange 1: goal ─────────────────────────────────────────────
prompt; read -r _
say ""
stream <<EOF
${B}tutor>${N} Got it. Before I plan anything, three questions:
${B}tutor>${N} 1. Why Rust — a job, a project, or curiosity?
${B}tutor>${N} 2. Where are you now — new, some exposure, or refresh?
${B}tutor>${N} 3. Deadline, or open-ended? (45 min/day noted.)
EOF
say ""

# ── exchange 2: answers -> plan ──────────────────────────────────
prompt; read -r _
say ""
cp -r "examples/vault/Learning" ./Learning
stream <<EOF
${B}tutor>${N} JavaScript background helps — I will map Rust ideas to JS where it helps.
${B}tutor>${N} ${G}Plan written → Learning/Rust/plan.md${N}
${B}tutor>${N}   Phase 1  Ownership & Borrowing      (4 topics)
${B}tutor>${N}   Phase 2  Structuring Programs        (3 topics)
${B}tutor>${N}   Phase 3  The Ecosystem               (2 topics)
${B}tutor>${N}   Phase 4  Build: CLI tool             (3 topics + final)
${B}tutor>${N} Goal: read and write idiomatic Rust without fighting the borrow checker.
${B}tutor>${N} Approve the plan, or adjust it?
EOF
say ""

# ── exchange 3: approve -> lesson + quiz question ────────────────
prompt; read -r _
say ""
stream <<EOF
${B}tutor>${N} ${G}Lesson written → notes/01-ownership-model.md${N}
${B}tutor>${N}    stack/heap figure, worked example, 2 self-check questions
${B}tutor>${N}    answer them in the note, then say "check my answers"
${B}tutor>${N} Quick quiz — 5 questions. First one:

${B}Q1.${N} What happens after  let s2 = s1;  where s1 is a String?

    A) s1 and s2 both own the buffer
    B) s2 owns the buffer, s1 is invalid
    C) the buffer is copied, both are valid
    D) the compiler allocates a second buffer
EOF
say ""

# ── exchange 4: answer -> honest result ───────────────────────────
prompt; read -r _
say ""
stream <<EOF
${G}✓ Correct.${N} A move transfers ownership at compile time. Using s1 after
  the move fails with E0382 — that is the feature, not a bug.

${B}tutor>${N} Topic 1.1 result: ${G}6/8 (75%) — passed${N}
${B}tutor>${N} ${Y}Gap:${N} "Copy" does not compose — (i32, String) moves, because
  String is not Copy. You applied tuple-of-numbers intuition.
${B}tutor>${N} Action: re-read the Copy section, re-quiz after topic 1.2.
${B}tutor>${N} ${G}Review scheduled: +1d${N}  Dashboard updated.
${B}tutor>${N} Session logged → Learning/Rust/logs/$(date +%F).md
${D}tutor> session over — the notes are yours to keep.${N}
EOF
sleep 0.4

# ── epilogue: the dashboard, as the user sees it in Obsidian ────
# Pre-rendered so the terminal shows exactly what Obsidian renders:
# the progress donut (SVG) + completion pie + review forecast (mermaid).
demo/render_dashboard
