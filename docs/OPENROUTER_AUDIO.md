# OpenRouter narration and sound exercises

Project skill: [openrouter-voice](../.agents/skills/openrouter-voice/SKILL.md).
It is versioned here, so `git pull` brings it to another machine without copying
global skills. Ask the agent: “Use `$openrouter-voice` to narrate this text in a
character voice.” If the client does not discover project skills automatically,
ask it to read that `SKILL.md`; a global installation is not required.

The default cloud model is **Gemini 3.8 Flash TTS**, selected by the owner on
October 22, 2026. The successful backpack narration used `Puck` at a normal pace.
Use Seed Audio when requested or when its scene/reference capabilities are needed.
Keep [Silero](LOCAL_TTS.md) for local offline speech. Its `+` and SSML conventions
are not interchangeable with Gemini or Seed pronunciation input.

## Working-machine setup

Requires Python 3.10+, OpenRouter access, and account balance. Non-Gemini
generation and audio references also need `ffmpeg` and `ffprobe` on PATH. No Python packages or application dependencies are needed by this
standard-library script.

The owner creates the root `.env` from [.env.example](../.env.example), setting
`OPENROUTER_API_KEY` or `OPENROUTER_KEY`, or configures an environment variable.
`.env` is already ignored; the example contains a placeholder only. Never put
credentials in chat, client code, `VITE_*`, or deployment configuration.

## Commands

PowerShell examples run from the RusLang root. Replace `py -3` with an installed
Python 3.10+ command as needed; Linux uses `python3`. Save text as UTF-8.
Create the working folder:

```powershell
New-Item -ItemType Directory -Force .local/openrouter/input | Out-Null
```

Save text in `.local/openrouter/input/story.txt`. Prepare without API calls or
creating a recording:

```powershell
py -3 .agents/skills/openrouter-voice/scripts/speech.py generate --env .env --text-file .local/openrouter/input/story.txt --voice Puck --description "A clear young male Russian narrator, natural normal pace" --output .local/openrouter/output/story.wav --dry-run
```

For requested generation, omit `--dry-run`. The script reads the key itself.
This is a paid network request. Gemini narration ran on this Windows machine
through the direct speech endpoint with PCM; the helper integration was then
updated without an additional generation or check.
Installing the skill alone does not configure Python, FFmpeg, or credentials.

For a voice reference instead of a description:

```powershell
py -3 .agents/skills/openrouter-voice/scripts/speech.py generate --model seed --env .env --text-file .local/openrouter/input/story.txt --reference C:/path/to/reference.ogg --output .local/openrouter/output/story-reference.mp3
```

For a Seed dialogue/sound riddle, save the complete prompt in `scene.txt`:

```powershell
py -3 .agents/skills/openrouter-voice/scripts/speech.py generate --model seed --env .env --prompt-file .local/openrouter/input/scene.txt --output .local/openrouter/output/scene.mp3
```

This bypasses the solo-narration wrapper. Do not combine it with `--reference`,
`--voice`, or `--description`: the CLI rejects these combinations. Multiple audio
references and image-derived voices have request recipes in the
[reference](../.agents/skills/openrouter-voice/references/classroom.md); these modes
currently need a separate API request, not invented CLI flags.

Gemini uses `.wav` output. The helper saves the original PCM as a sibling
`.pcm` file and adds a WAV container for playback without altering audio samples.
Delivery directions are sent in `instructions`, never in the spoken text.
The Gemini MP3 attempt returned HTTP 400; use the established PCM route.

## Outputs and game integration

An adjacent `.request.json` stores prompt, model, generation ID, and duration.
Keep private data and working inputs in ignored `.local/openrouter/`. Existing
audio/request records block accidental duplicate submissions. On timeout or
interruption do not delete the record to retry immediately: determine whether
the paid request completed first.

Copy the required WAV or MP3 to `src/games/<slug>/assets/` and use a relative Vite import.
Keep clean learner text separate from synthesis prompts. The browser runs neither
Python nor paid generation. Do not copy `.request.json`, private references, or
keys into game assets.

Preserve API output without re-encoding, trimming, or tempo changes. Target an
approximate duration through text length. Audio references are temporarily
decoded to WAV for upload without modifying the source. Put pronunciation fixes
in separate synthesis text: Seed handled `росЫ`, but not `росы́` or `рос+ы` in our
trial. This is one observed word, not a universal guarantee.

Refresh prices/capabilities when requested or when a saved route fails; routine
generation needs no repeated research. Paid trials, builds, and checks require
an explicit request under [AGENTS.md](../AGENTS.md).
