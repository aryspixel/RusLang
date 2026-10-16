# Local Silero speech synthesis

Owner preferences and findings from «Моя комната» are saved in the [skill notes](../.agents/skills/silero-tts/references/narration.md). For similar stories use `kseniya`, `slow`, and 700 ms extra sentence pauses. The notes distinguish rejected `x-slow`, explicit stress, an emotional ending, and an unconfirmed attempt at rising intonation on «шкаф».

The CLI and installer now target Silero TTS `v5_6_ru` for Russian speech. The previous Windows installation used `v5_5_ru`; run setup on the destination computer to download the new model. Model weights are not distributed through Git. Run from any folder using the full `tts.bat` path. The model and Python environment live under the repository's `.local/silero/`, excluded from Git. Ordinary synthesis is offline and sends no text to external services. No persistent server is needed.

```powershell
cd C:\development\RusLang
.\tts.bat --text "Здравствуйте! Сегодня мы изучаем русский язык." --output .local\silero\output\lesson.wav
.\tts.bat --file C:\path\lesson.txt --speaker baya --output .local\silero\output\story.wav
.\tts.bat --list-voices
```

Voices: `aidar`, `baya`, `kseniya`, `xenia`, `eugene`. CLI default: `xenia`, 48000 Hz, mono 16-bit PCM WAV. Text input is UTF-8. Long text splits at sentences/spaces, with 0.2-second gaps. Adjacent `*.wav.json` stores the source text, voice, and parameters. Outputs resist accidental overwriting; use `--overwrite` for an intentional replacement.

Automatic stress, ё restoration, and both homograph options are explicitly enabled. `--no-stress` disables ordinary and homograph stress; `--no-yo` disables ordinary and homograph ё restoration. To disable only the homograph pass, use `--no-stress-homo` or `--no-yo-homo`. The sidecar records all four effective flags. Silero accepts `+` before a stressed vowel, e.g. `з+амок`. Prepare numbers, abbreviations, and pronunciation deliberately; retain a separate clean learning source. Listen before classroom use when a listening check is authorized.

## What changed in v5_6_ru

The [Silero release announcement](https://habr.com/ru/articles/1094196/) adds emphasis, exclamatory intonation, and updated automatic stress/homograph handling. Questions were already supported in `v5_5_ru`. The [upstream model table](https://github.com/snakers4/silero-models#models-and-speakers) retains the same five voices, sample rates, and SSML support.

Use the following notation in synthesis input, including text nodes in a separate SSML file:

| Purpose | Synthesis input | Clean learning text |
| --- | --- | --- |
| Emphasis | `Я **люблю** свою комнату!` | `Я люблю свою комнату!` |
| Question focus | `Это *твоя* комната?` | `Это твоя комната?` |
| Exclamation | `Я люблю свою комнату!` | `Я люблю свою комнату!` |
| Explicit lexical stress | `на стол+е` | `на столе` |

Double asterisks mark emphasis; single asterisks mark the intonation center of a question. Preserve `?` and `!`; no separate emphasis switch is required. Upstream recommends marking focus for general yes/no questions; special, alternative, and tag questions can work without it. Emphasis changes timing and intonation, rather than simply increasing volume. Edge cases remain according to the announcement. The CLI leaves the model's intonation intensity at its default.

Keep `+`, `*`, `**`, and XML out of learner-facing text. Sidecar `text` retains synthesis notation for reproducibility; it is not a clean learner transcript. Existing game WAVs and their sidecars still describe the model that actually generated them. Updating the CLI does not regenerate recordings or establish that the owner's requested rising list contour now works.

From another project:

```powershell
& C:\development\RusLang\tts.bat --file .\text.txt --output .\voice.wav
```

For a game, output into `src/games/<slug>/assets/` and import the WAV relatively through Vite. Generation runs on the developer's machine; GitHub Pages serves the finished audio. The website does not run local Python.

Set speed during synthesis: `--rate slow` or `--rate x-slow`; default `medium`, also `fast` and `x-fast`. The generator uses [Silero SSML prosody](https://github.com/snakers4/silero-models/wiki/SSML) and records rate in `*.wav.json`. `--pause-ms` controls sentence gaps (default 200 ms, range 0–10000). For «Моя комната», clean text is `src/games/my-room/story.txt`; explicit stress is in `story-tts.txt`. The current Amina recording uses `kseniya`, `--rate slow --pause-ms 700`, and `story-tts-kseniya.txt`; exclamation punctuation adds opening/closing emphasis. The owner explicitly restored «Я люблю свою комнату!». `x-slow` with one-second gaps was too slow.

For within-sentence pauses, use `--ssml-file`. Current `src/games/my-room/story-tts-kseniya.ssml` marks `Ам+ина` (stress on и) and three 450 ms furniture-list gaps via `<break>`. Command: `.\tts.bat --ssml-file src/games/my-room/story-tts-kseniya.ssml --speaker kseniya --rate slow --pause-ms 700 --output .local/silero/output/room.wav`. Keep clean story text free of SSML/stress markup.

## Upgrade and reinstallation

Setup needs network access and Python 3.12 (the script also locates Python in a local Codex runtime). It installs the CPU PyTorch version from `tools/silero/requirements.txt` using the official index. This update does not change that dependency pin or add a separate stress package: inference uses the downloaded Torch package.

Run the installer on the destination Windows computer; no preliminary model download or checksum entry is required:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\silero\setup.ps1
# Or choose Python explicitly:
.\tools\silero\setup.ps1 -Python C:\Python312\python.exe
```

Setup downloads `v5_6_ru.pt` from the official `models.silero.ai` HTTPS URL listed in [upstream models.yml](https://github.com/snakers4/silero-models/blob/master/models.yml). It stages the download as `.pt.part`, calculates SHA256, then saves the model and its `.pt.sha256` receipt in `.local/silero/models/`. The environment, model weights, download staging files, and local checksums stay on that computer under the Git-ignored `.local/` directory. No model download belongs in a commit or a frontend bundle.

The first download trusts the official HTTPS source; its saved digest detects later changes, rather than providing independent publisher authentication. Subsequent setup runs compare an existing model or a replacement download with the saved digest and stop on a mismatch. A model without a saved or supplied digest is downloaded afresh. For managed installations, `-ModelSha256` optionally accepts an independently reviewed 64-character digest and checks it before activating downloaded bytes. Do not silently replace a saved checksum when a mismatch occurs.

Setup preserves `v5_5_ru.pt`. To return to that model, pass `--model v5_5_ru` to `tts.bat`; `--model v5_6_ru` is the new default. Keep the selected voice, rate, and pauses when comparing versions after an explicitly requested listening check.

The retained `v5_5_ru` pin, recorded on October 10, 2026, is `50081637B602126EE06CB3BC8A744D25651D2DA149EE8864B9A379BFDD934437`. Setup can still install it with `.\tools\silero\setup.ps1 -Model v5_5_ru`. These updated installation commands have not been executed on Windows; no synthesis, tests, or listening checks were requested for this update.

## Source and license

[Silero Models, Silero Team](https://github.com/snakers4/silero-models), [models and voices](https://github.com/snakers4/silero-models#models-and-speakers), [license](https://github.com/snakers4/silero-models/blob/master/LICENSE).

The Russian model remains subject to the upstream **CC BY-NC-SA 4.0** repository license (noncommercial restriction). Setup saves the license to `.local/silero/LICENSE`. CIS Base models are separately MIT-licensed and are not installed in this configuration.
