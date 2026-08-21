Output demo/demo.gif
Set Shell bash
Set Width 1000
Set Height 620
Set FontSize 22
Set Framerate 15
Set Theme "Catppuccin Mocha"
Set TypingSpeed 40ms

# ── start the scripted tutor session ──────────────────────────
Type "bash demo/tutor.sh"
Enter
Sleep 1200ms

# ── exchange 1: the user states the goal ──────────────────────
Type "I want to learn Rust. I have 45 min a day."
Enter
Sleep 1200ms

# ── exchange 2: the tutor asks, the user answers ──────────────
Type "Side project. JS background. No deadline."
Enter
Sleep 2600ms

# ── exchange 3: approve the plan ──────────────────────────────
Type "approve"
Enter
Sleep 3400ms

# ── exchange 4: answer the quiz question ──────────────────────
Type "B"
Enter
Sleep 4200ms

# ── payoff: the artifacts it wrote ────────────────────────────
Type "ls -R Learning"
Enter
Sleep 2500ms
