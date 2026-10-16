# Local Silero speech synthesis

Owner preferences and findings from «Моя комната» are saved in the [skill notes](../.agents/skills/silero-tts/references/narration.md). For similar stories use `kseniya`, `slow`, and 700 ms extra sentence pauses. The notes distinguish rejected `x-slow`, explicit stress, an emotional ending, and an unconfirmed attempt at rising intonation on «шкаф».

Silero TTS `v5_5_ru` is installed for Russian speech. Run from any folder using the full `tts.bat` path. The model and Python environment are in `C:\development\RusLang\.local\silero\`, excluded from Git. Ordinary synthesis is offline and sends no text to external services. No persistent server is needed.

```powershell
cd C:\development\RusLang
.\tts.bat --text "Здравствуйте! Сегодня мы изучаем русский язык." --output .local\silero\output\lesson.wav
.\tts.bat --file C:\path\lesson.txt --speaker baya --output .local\silero\output\story.wav
.\tts.bat --list-voices
```

Voices: `aidar`, `baya`, `kseniya`, `xenia`, `eugene`. CLI default: `xenia`, 48000 Hz, mono 16-bit PCM WAV. Text input is UTF-8. Long text splits at sentences/spaces, with 0.2-second gaps. Adjacent `*.wav.json` stores the source text, voice, and parameters. Outputs resist accidental overwriting; use `--overwrite` for an intentional replacement.

Automatic stress and ё are enabled; disable with `--no-stress` and `--no-yo`. Silero accepts `+` before a stressed vowel, e.g. `з+амок`. Prepare numbers, abbreviations, and pronunciation deliberately; retain a separate clean learning source. Listen before classroom use when a listening check is authorized.

From another project:

```powershell
& C:\development\RusLang\tts.bat --file .\text.txt --output .\voice.wav
```

For a game, output into `src/games/<slug>/assets/` and import the WAV relatively through Vite. Generation runs on the developer's machine; GitHub Pages serves the finished audio. The website does not run local Python.

Set speed during synthesis: `--rate slow` or `--rate x-slow`; default `medium`, also `fast` and `x-fast`. The generator uses [Silero SSML prosody](https://github.com/snakers4/silero-models/wiki/SSML) and records rate in `*.wav.json`. `--pause-ms` controls sentence gaps (default 200 ms, range 0–10000). For «Моя комната», clean text is `src/games/my-room/story.txt`; explicit stress is in `story-tts.txt`. The current Amina recording uses `kseniya`, `--rate slow --pause-ms 700`, and `story-tts-kseniya.txt`; exclamation punctuation adds opening/closing emphasis. The owner explicitly restored «Я люблю свою комнату!». `x-slow` with one-second gaps was too slow.

## Reinstallation

For within-sentence pauses, use `--ssml-file`. Current `src/games/my-room/story-tts-kseniya.ssml` marks `Ам+ина` (stress on и) and three 450 ms furniture-list gaps via `<break>`. Command: `.\tts.bat --ssml-file src/games/my-room/story-tts-kseniya.ssml --speaker kseniya --rate slow --pause-ms 700 --output .local/silero/output/room.wav`. Keep clean story text free of SSML/stress markup.

Setup needs network access and Python 3.12 (the script also locates Python in a local Codex runtime):

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\silero\setup.ps1
# Or choose Python explicitly:
.\tools\silero\setup.ps1 -Python C:\Python312\python.exe
```

Setup installs CPU PyTorch from the official index and downloads from `models.silero.ai`; no GPU is required. The model is pinned to SHA256 recorded on download October 10, 2026: `50081637B602126EE06CB3BC8A744D25651D2DA149EE8864B9A379BFDD934437`. This is a local download pin, not a publisher signature. If the upstream file changes, setup stops; updating requires an explicit version/hash change.

## Source and license

[Silero Models, Silero Team](https://github.com/snakers4/silero-models), [models and voices](https://github.com/snakers4/silero-models#models-and-speakers), [license](https://github.com/snakers4/silero-models/blob/master/LICENSE).

The repository lists **CC BY-NC-SA 4.0** for `v5_5_ru` (noncommercial restriction). Local license: `.local/silero/LICENSE`. CIS Base models are separately MIT-licensed and are not installed in this configuration.
