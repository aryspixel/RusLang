# RusLang narration preferences

Saved at the owner's request on October 10, 2026 after «Моя комната». These are starting settings for similar beginner stories; direct instructions for a recording take priority.

## Voice, rate, pauses

- Existing recording model: **Silero `v5_5_ru`**, current voice: **`kseniya`**. The CLI now targets `v5_6_ru`; setup downloads it on the destination computer and records a local checksum. Existing recordings remain unchanged. Start similar listening material with `kseniya`; do not revert to `xenia` solely because it is the CLI default.
- Rate: **`slow`**. The owner rejected `x-slow` as too slow. Longer gaps do not imply slower word delivery.
- Sentence gaps: **700 ms additional silence** (`--pause-ms 700`). Furniture-list gaps: **450 ms** (`<break time="450ms"/>`). These exclude the synthesizer's natural pauses.
- Current command: `tts.bat --ssml-file src/games/my-room/story-tts-kseniya.ssml --speaker kseniya --rate slow --pause-ms 700 --output <new-file.wav>`.

## Pronunciation and expression

- Owner correction: **на столé**, synthesis form `на стол+е`. Automatic stress does not override explicit corrections; retain them in subsequent recordings.
- For **Алия**, the owner specified final-я stress: `Али+я`. The character was later renamed **Амина**; current notation: `Ам+ина`. Do not transfer stress between names automatically; apply new owner corrections to all synthesis variants.
- Delivery should be lively/emotional. Closing **«Я люблю свою комнату!»** needs warmth and exclamation. The owner first removed it, then explicitly restored it; keep it now.
- For future `v5_6_ru` recordings, `!` requests exclamatory intonation and `**word**` requests emphasis. Use `*word*` for question focus. Keep these in synthesis input only; preserve the approved clean wording. These capabilities are upstream-documented, not locally confirmed listening results. Do not regenerate the current recording merely to adopt the new model.
- The list must remain intonationally unfinished until its final item: **«стол… стул… шкаф ↗ … и кровать ↘»**. Falling pitch on «шкаф» was unwanted; falling on «кровать» was acceptable.
- Latest version uses `<prosody pitch="high">шкаф,</prosody>` and a pause before «и кровать». The comma is synthesis-only; clean text has no comma before the single «и». Higher register does not guarantee a rising contour. This version **has not received owner confirmation**; successful WAV creation does not establish approved intonation.

## Text and revisions

Keep clean narration in `story.txt`, explicit stress in synthesis files, and exact pauses/intonation directions in separate SSML. On-screen text must match recorded words; hide service `+` and XML from learners.

The owner approved the story text first. Do not rewrite it for expressiveness; limit changes to requested edits and synthesis-only intonational punctuation. When renaming a character update headings, questions, and text files too. Already-requested specific edits need no repeated approval.

Preserve all other chosen settings during targeted edits. Archive the previous recording/metadata in `.local/silero/archive/` if needed and use the current WAV in-game. Let the owner listen. A request to remember preferences alone does not authorize checks or extra generation.
