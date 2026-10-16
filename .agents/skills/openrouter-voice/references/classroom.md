# Seed Audio for classroom activities

These are teaching ideas built on documented Seed capabilities, not claims of
measured learning outcomes. Use the learner's language, level, and requested task.
Do not produce a whole paid batch when one example will let the user judge it.

## Choose a mode

| Activity | Prompt approach | Listening status |
|---|---|---|
| Emotional meaning | Same sentence with contrasting delivery; learners identify emotion | Joy and hurt confirmed; suspicion failed twice, including contextual text |
| Role-play | Two clearly described speakers; short alternating turns; no spoken role labels | Grandfather/girl dialogue with emotional changes approved by listener |
| Recurring character | Reuse the same audio reference for a series of stories | Single-reference Russian narration worked in this session |
| Sound riddle | Describe a soundscape, explicitly no speech/music; learners infer the place or write a story | Railway/platform soundscape approved; listener recognized a train and inferred overcast mood |
| Voice from a picture | One image reference plus narration prompt | Illustrated forest ranger voice approved; no textual age/timbre description was supplied |
| Dictation/listening | Request clear diction, natural slow delivery, pauses between sentences | Generally approved, but a stress error required correction; exact pauses unverified |

## Russian stress and observed limitations

For a problematic word, try capitalizing only its stressed vowel and explain that
the capital marks stress, with no spelling out of letters. This exact approach
worked for the listener on `На мокрой траве блестели капли росЫ.`:

> В слове «росЫ» заглавная гласная Ы обозначает ударение на последний слог.
> Произнеси это слово слитно и естественно, не называя буквы отдельно.

This is one successful word, not guaranteed general stress markup. Keep a clean
correctly spelled transcript for learners; capitalization is synthesis input only.
When troubleshooting, generate just the affected sentence before regenerating
the whole passage. Do not substitute different words in a user-supplied dictation
without agreement.

Observed failures in this session:

- `росы́` (combining acute accent), even with explicit final-syllable instructions,
  did not fix the original first-syllable stress.
- `рос+ы` was read literally as something like «росплюсы». Do not recommend `+`
  as supported Seed stress notation.
- Suspicion was unconvincing on both «А я тебя ждал» and a contextual line about
  knowing where a key was hidden. Treat subtle suspicion as unreliable here.
- The three-emotion recording had an apparent background/doubled voice according
  to the listener. Cause unknown. Request one dry isolated voice, no overlaps or
  background speech, but do not promise this always prevents artifacts.

Prompted pauses are approximate. Do not claim requested four-second pauses were
measured or exact. Preserve original audio rather than adding pauses afterward.

## Raw prompt recipes

Use `--prompt-file` for the following modes; the ordinary text helper forces solo
narration without background sounds and is unsuitable for dialogue or soundscapes.
Keep directions separate from the words to be spoken. Explicitly request that
role labels and performance directions are not read aloud.

Dialogue: describe two contrasting voices and an emotional arc, then supply a
short script. Example direction: "Two Russian speakers: a warm, gravelly elderly
grandfather and a bright girl around nine. Distinct consistent voices, natural
turn-taking. No narrator, music or background sounds. Speak only the dialogue."
Voice descriptions are requests, not a guarantee of exact age or speaker consistency.

Emotion exercise: «А я тебя ждал» with joy, then hurt/reproach. Both were
recognized by the listener. Avoid using suspicion as a reliably distinguishable
target. For a clean retry, separate recordings can help isolate a delivery issue;
this has not been proven to eliminate the background-voice artifact.

Sound riddle: "A quiet railway platform: distant train approaching, wheels
rolling, a brief brake hiss. No intelligible speech and no music."
Duration in a prompt is approximate; keep original API bytes regardless.

## Multiple audio references: request shape

Seed accepts up to three clips through `input_references`. Number audio clips
in order and refer to every supplied clip in `input` using `@Audio1`, `@Audio2`,
`@Audio3` as applicable. Do not reference a clip that was not supplied. Omit `voice`.

```json
{
  "model": "bytedance-seed/seed-audio-1-0",
  "input": "@Audio1 Привет! Как прошёл день? @Audio2 Отлично, я решил задачу!",
  "response_format": "mp3",
  "input_references": [
    {"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64,<clip-one>"}},
    {"type": "input_audio", "input_audio": {"data": "data:audio/wav;base64,<clip-two>"}}
  ]
}
```

This multi-reference route is documented, not listening-tested here. The user
explicitly declined an additional verification run: do not generate one merely
to complete a capability checklist. Use it when requested for an actual task,
without describing voice separation as our measured guarantee. Preserve
existing credentials, request reservation, no automatic retries, and output-byte
invariants when building a request outside the helper. Never log inline audio.

## Voice from an image: request shape

Send exactly one `image_url` reference (JPEG, PNG, WebP), with no audio reference
and no preset `voice`. A local image can be encoded as a data URI; no public
upload is needed. Seed infers a voice from the depicted character; it does not
recover the real voice of a person from their photograph.

Successful trial: a generated portrait of a fictional elderly forest ranger,
followed by a 13-second Russian invitation to explore a forest. The audio prompt
asked Seed to infer the voice from the picture, with no age/timbre description.
The listener approved the result. For another image-only test, avoid textual voice
descriptions that would confound what the image contributes. A supplied image
does not require generating a new one. Use an image-generation skill only when
creating a character portrait is part of the authorized task.

```json
{
  "model": "bytedance-seed/seed-audio-1-0",
  "input": "The pictured character says in Russian, warmly and expressively: Добро пожаловать на урок!",
  "response_format": "mp3",
  "input_references": [
    {"type": "image_url", "image_url": {"url": "data:image/png;base64,<image>"}}
  ]
}
```

Do not combine image and audio references for Seed. Do not use `@AudioN` in
image-only or reference-free mode. Other providers have different rules.

Limits: 3000 prompt characters and up to 120 generated seconds per request.
Exact pauses, age, voice similarity, and sound placement require listening checks.
Record user feedback before promoting an experiment to a proven recipe.

Source: [OpenRouter TTS](https://openrouter.ai/docs/guides/overview/multimodal/tts),
sections Multiple Reference Clips, Image References, and Non-Speech Prompts.
Capability snapshot: 2026-10-16.
