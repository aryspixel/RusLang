---
name: silero-tts
description: Generate local/offline Russian speech and game audio assets for RusLang with Silero TTS, saving WAV. Excludes cloud speech, transcription, and voice cloning; Seed/OpenRouter has a separate project skill.
---

# Local RusLang narration

For local speech use the existing root `tts.bat`. Do not duplicate the generator or replace a local task with cloud TTS. For Seed/OpenRouter, voice references, or sound scenes, use neighboring [openrouter-voice](../openrouter-voice/SKILL.md); stress notation differs. Repository root relative to this file: `../../..`.

Installed: Russian `v5_5_ru`, CPU, 48000 Hz, mono 16-bit PCM WAV. Voices: `aidar`, `baya`, `kseniya`, `xenia`, `eugene`. CLI default is `xenia`; for similar beginner stories use the owner's `kseniya`, `slow`, and 700 ms extra sentence gaps unless directed otherwise. No Kazakh model or voice cloning is installed.

Before story generation or pronunciation fixes, read [saved preferences](references/narration.md): pauses, stress, emotional ending, and an unconfirmed rising-list-intonation attempt. Follow current decisions, not rejected migration-history variants.

## Generate

Save UTF-8 text inside `.local/silero/input/` and pass `--file`. This preserves quotation marks/multiline text and avoids shell interpretation. Retain clean learning text; make pronunciation corrections in a separate synthesis file. Mark stress with `+` before the vowel: `з+амок`.

From the repository root in PowerShell:

```powershell
.\tts.bat --file .local\silero\input\lesson.txt --speaker kseniya --rate slow --pause-ms 700 --output .local\silero\output\lesson.wav
```

Use descriptive output names. Standalone recordings go in `.local/silero/output/`; game assets in `src/games/<slug>/assets/`. Choose a new filename to avoid accidental replacement; use `--overwrite` only for a requested replacement.

Wait for completion and report the actual outcome. Do not claim creation on failure. For standalone audio show `![Narration](<absolute WAV path>)`. Preserve the adjacent `*.wav.json` with text, voice, and parameters for reproducibility.

Requested narration is the core task. Trial generations, listening, and other checks require an explicit user request under `AGENTS.md`; adding/updating this skill does not itself authorize them.

Use `--rate slow` for slower speech, `--rate x-slow` for very slow; default `medium`. Rate is set during synthesis via SSML prosody and saved in WAV metadata. Keep SSML out of the learner text: the generator wraps it. Store marked text separately, e.g. `story-tts.txt` versus clean `story.txt`.

## Integration and recovery

For internal pauses, pass a separate `--ssml-file`: root `<speak>`, sentences in `<s>`, pauses as `<break time="450ms"/>`. `--rate` sets speed; `--pause-ms` adds silence between sentences. SSML stays separate from clean text and is recorded in WAV metadata. «Моя комната» example: `src/games/my-room/story-tts-kseniya.ssml`, with `Ам+ина` stressed on и.

Technical `--pause-ms` default: 200 ms. For similar stories retain `--rate slow --pause-ms 700`. Do not switch to `x-slow` without a request: it was rejected for «Моя комната». Gap length is recorded in metadata.

Import game audio relatively through Vite. GitHub Pages serves finished recordings; no Python runs in the browser. Do not change UI/content when only audio creation was requested.

If the environment/model is missing, read [local TTS setup](../../../docs/LOCAL_TTS.md), then use existing `tools/silero/setup.ps1` within the requested scope. Setup needs network access; ordinary synthesis uses the local model offline. Do not update the model, checksum, or dependencies without a task-related need.

That document covers automatic stress/ё, recovery, and licensing. The installed model is CC BY-NC-SA 4.0 with noncommercial restrictions; do not present it as MIT.
