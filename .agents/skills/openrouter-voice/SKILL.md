---
name: openrouter-voice
description: Generate audio through OpenRouter, primarily Seed Audio, from text, voice descriptions, or audio references. Use for narration, Russian voiceovers, voice comparisons, and classroom listening scenes or sound exercises; excludes music production and video generation.
---

# OpenRouter Voice

For a new RusLang listening lesson rather than an already defined audio asset,
start with [listening-lesson](../listening-lesson/SKILL.md) to settle the topic,
scenario, visual supports, feedback and exercises. Return here at the audio stage;
do not restart that discussion for an already agreed script.

Use `scripts/speech.py` instead of rebuilding API requests or researching the
catalog each time. Default to Seed unless the user chooses another model.
Seed worked well for this user's expressive Russian narration and voice references.

## Generate

Use the supplied text, or write text suited to the approximate duration. Around
40–50 Russian words is a starting point for 20 seconds; actual delivery varies.
Reuse the same text for comparisons. When comparing step by step, generate one
model at a time. Keep spoken text in a UTF-8 file, separate from voice directions.

Replace `<skill-dir>` with this skill's directory:

```bash
python3 <skill-dir>/scripts/speech.py generate \
  --env /path/to/project/.env --text-file /path/to/story.txt \
  --description 'A warm, expressive elderly Russian grandfather, naturally aged and slightly gravelly.' \
  --output /path/to/outputs/voice/grandfather.mp3

python3 <skill-dir>/scripts/speech.py generate \
  --env /path/to/project/.env --text-file /path/to/story.txt \
  --reference /path/to/reference.ogg \
  --output /path/to/outputs/voice/reference-narration.mp3
```

Report the audio link and measured duration. API acceptance does not prove that
the requested age, timbre, or reference similarity was achieved; assess by listening.

## Audio invariants

- Save original API bytes. This user explicitly wants approximate duration achieved
  with text length: no tempo changes, trimming, normalization, effects, or re-encoding.
- Reference mode preserves speaker identity and delivery. Omit `--description`
  unless additional performance directions were requested. Do not combine a Seed
  reference with a preset `voice`.
- The helper decodes references to temporary PCM WAV for upload compatibility,
  without changing tempo/pitch or modifying the source file.
- A 59-second Ogg/Opus reference worked. That is an observation, not a minimum.
  Prefer clear solo speech without music, overlapping speakers, or long silence.
  Do not automatically crop the reference.
- Inline reference media must fit 15 MiB before base64 encoding. The WAV can be
  much larger than the compressed source; the helper checks it.

## Execution

- Requires Python 3 standard library, `ffmpeg`, `ffprobe`, and network access.
- Reads `OPENROUTER_API_KEY` or `OPENROUTER_KEY` from environment, then selected
  `.env` (default: current working directory). Never print/copy secrets or source
  `.env` as shell code. Follow current task authorization and sandbox rules.
- `--dry-run` validates inputs without network calls or output writes.
- No automatic paid retries. A sibling `.request.json` reserves the output before
  submission. Existing audio or request records block duplicates. After interruption
  or timeout inspect metadata and account activity: a local failure may still be billed.
- Model aliases: `seed` (default), `fish`, `qwen-flash`, `qwen-plus`. Qwen needs
  `--voice`; the helper rejects Qwen descriptions/references because those controls
  are not established through its current OpenRouter endpoint.

Read [references/models.md](references/models.md) for comparisons, pricing,
capability errors, or provider-specific work. Routine Seed generation needs no
browsing. Verify live prices for current quotes and refresh capabilities when
a saved route fails or the user asks for current options.

## Classroom audio

Read [references/classroom.md](references/classroom.md) for emotion exercises,
dialogues, recurring characters, sound riddles, and voice-from-image requests.
It distinguishes documented capabilities from listening-tested results.

Listener-confirmed successes include two-character dialogue, train sound riddles,
and a voice inferred from a character portrait. For Russian stress correction,
capitalizing the stressed vowel worked on `росЫ`; acute accents failed and `+`
was spoken literally. See the classroom reference before dictation or pronunciation
work. Subtle suspicion was unreliable. Do not automatically repeat feature tests
the user has declined, including the multi-reference dialogue test.

For Seed scenes or non-speech audio, use a complete UTF-8 prompt with
`--prompt-file` instead of `--text-file`. This bypasses the solo-narration wrapper:

```bash
python3 <skill-dir>/scripts/speech.py generate \
  --env /path/to/project/.env --prompt-file /path/to/scene.txt \
  --output /path/to/outputs/voice/scene.mp3
```

Raw prompt mode currently takes no reference/voice/description flags; put all
directions in the prompt. Multiple reference clips and image references require
the request shapes in the classroom reference and a separate API request using
the same output-reservation and original-byte rules. Do not claim the CLI supports
flags it does not expose. Never add sound effects to ordinary narration unless asked.
