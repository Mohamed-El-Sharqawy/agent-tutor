# Demo GIF

`demo.gif` shows a full tutor session: goal → interview → plan → lesson → quiz → honest feedback → the artifacts on disk.

It is recorded with [vhs](https://github.com/charmbracelet/vhs) from `demo.tape`, which runs the scripted session in `tutor.sh`. The same tape always produces the same recording.

## Regenerate

No local dependencies needed — vhs runs in a container (ttyd, ffmpeg, chromium, and fonts are inside):

```bash
docker run --rm -v "$PWD:/vhs" ghcr.io/charmbracelet/vhs demo/demo.tape
```

On Windows (Git Bash), use `-v "//$(pwd -W 2>/dev/null || pwd):/vhs"`.

Tweak the look in `demo/demo.tape` (theme, font size, dimensions, pacing) and re-run.

## Files

| File | Purpose |
|---|---|
| `demo.tape` | vhs tape: types the user lines, paces the recording |
| `tutor.sh` | Scripted tutor session (deterministic; copies the real example vault at the end) |
| `demo.gif` | Rendered output (committed; CI re-renders when the tape changes) |
