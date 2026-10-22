# Verified routes and listening results

Default updated October 22, 2026: **Gemini 3.8 Flash TTS**, chosen by the owner
after the backpack narration. Voice `Puck`, normal pace. Direct speech endpoint,
`instructions` separate from `input`, `response_format: pcm`. Original PCM plus
WAV header for playback; 98.2 seconds. The MP3 request returned HTTP 400. This
records generation success and the owner's model choice, not verified correctness
of every stress. Preserve «не было» stress on «не» and «дождь» corrections.

The remaining comparison/pricing snapshot is from October 16, 2026; do not use
its prices as current without verification.

| Alias | OpenRouter model | Verified input |
|---|---|---|
| gemini (default) | `google/gemini-3.8-flash-tts` | Spoken text, top-level instructions, voice `Puck`, PCM |
| seed | `bytedance-seed/seed-audio-1-0` | Natural-language prompt; optional audio reference |
| fish | `fish-audio/s2.1-pro` | Text and top-level `instructions`; no preset voice needed in trial |
| qwen-flash | `qwen/qwen-audio-3.0-tts-flash` | Text and voice `loongjohn` or `longanhuan_v3.6` |
| qwen-plus | `qwen/qwen-audio-3.0-tts-plus` | Text and voice `longanlingxin` or `longanlufeng` |

Seed treats input as a prompt. Explicitly separate directions from spoken text.
One reference: put `@Audio1` in the prompt, omit `voice`, send one
`input_references` item: `type: input_audio`, with
`input_audio.data: data:audio/wav;base64,...`. Seed ignores reference transcripts.
Documented Seed limits: 3000 prompt characters, 120 generated seconds.
Inline media limit: 15 MiB decoded / 20 MiB base64 per reference.

Fish supports references through the same input structure; the helper supports
that combination, although this session tested Fish only with instructions.

Qwen endpoints reported `supports_voice_cloning: false`. An elderly-voice instruction
under `provider.options.alibaba.instruction` was accepted but the user heard ordinary
male voices. Do not call this verified voice design. Qwen cloning through Alibaba
requires separate Alibaba credentials and enrollment for each target model.

## User preferences from actual listening

- Qwen: excellent expressiveness, unconvincing age with elderly directions.
- Fish S2.1 Pro: better elderly result, less expressive than Qwen to this user.
- Seed: strongly preferred; elderly, child descriptions and reference mode tested.
- Seed classroom results: dialogue, train soundscape, image-inferred voice approved;
  joy/hurt recognized, suspicion unreliable. `росЫ` corrected stress; acute and `+`
  failed. Details and ready request shapes: [classroom.md](classroom.md).
- Preserve originals. Early tempo-adjusted comparison derivatives are unsuitable
  as benchmarks of original API quality.

## Price snapshot, USD

Seed: $0.0025 per generated second ($0.15/minute), input prompt free.
Fish S2.1 Pro / Qwen Flash: $15 per million characters; Qwen Plus: $20.
These routes' generic pricing fields use seconds or characters, not token units.
Verify current pricing before quoting it as current.

## Further candidates

Voice conversion was discussed separately: Seed-VC is not Seed Audio. Its repository
was downloaded but installation/testing was deferred by the user. ElevenLabs Voice
Changer requires separate ElevenLabs access; the user has no key and deferred it.
Do not resume either experiment without a new request. A Seed voice reference
conditions newly generated speech; it does not guarantee preservation of source
pronunciation/timing as a dedicated speech-to-speech conversion would aim to do.

The earlier sequential comparison reached Fish, then Seed; Gemini was subsequently used for the backpack story and selected as the default.
Other available families included ElevenLabs, MiniMax, Microsoft MAI Voice,
Grok Voice, and Mistral Voxtral. Check the chosen endpoint before promising
Russian or reference support. Do not assume identical family-wide capabilities.

## Sources

- [OpenRouter TTS](https://openrouter.ai/docs/guides/overview/multimodal/tts)
- [Speech catalog](https://openrouter.ai/api/v1/models?output_modalities=speech)
- Capabilities: `https://openrouter.ai/api/v1/models/{model-id}/endpoints`
- [Alibaba cloning](https://www.alibabacloud.com/help/en/model-studio/voice-cloning-user-guide)
