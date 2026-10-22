---
name: silero-stress
description: Prepare Russian text with lexical stress marks, restored ё, and context-sensitive homographs for reading or speech synthesis. Use for standalone pronunciation preparation or correcting stress errors; does not generate audio.
---

# Russian stress preparation

Prepare a separate pronunciation artifact from the supplied Russian text. Work from the full passage, including earlier messages or saved files; do not ask the owner to identify every wrong word when the source is available. This is a linguistic preparation skill, not an installed automatic accentuation engine or speech-recognition tool. Do not claim to have heard errors in audio that you have not listened to.

## Preserve the source

Keep the original learner text unchanged. Preserve wording, word order, punctuation, paragraphs, role labels, and explicit owner pronunciation choices. Put stress marks and restored ё in a separate UTF-8 file. Do not rewrite a difficult word or sentence to avoid deciding its pronunciation.

Retain the audio task's chosen generator. Ordinary Silero TTS already handles automatic stress and ё; this standalone preparation is optional, not a mandatory second pass or a generator hook.

## Resolve pronunciation

Read whole sentences before marking individual words. Determine each word's part of speech, inflection, meaning, and syntactic role. Restore ё where established; do not globally replace е with ё. Resolve homographs from context, for example:

- `ст+арый з+амок` versus `дверн+ой зам+ок`.
- `я плат+ил` versus `он пл+атит`.
- `всё пропало` versus `все пришли`.

Mark lexical stress rather than expressive emphasis. By default mark every ordinary multisyllabic word in the pronunciation version, including familiar words, so the owner can inspect the entire passage. Leave monosyllables unmarked unless a specific issue requires otherwise. A normal word has one primary stress; do not force this rule onto compounds, clitics, or exceptional words. Treat ё as inherently stressed in ordinary words without a redundant mark.

Preserve existing unambiguous marks and owner corrections. Do not transfer one name's stress to another name. For unfamiliar names, genuine contextual ambiguity, or uncertain dictionary forms, consult an authoritative Russian dictionary if available; otherwise flag just the unresolved words and relevant alternatives. Do not silently invent a confident answer. Continue preparing the rest while an ambiguity is unresolved.

## Choose output notation

Use the current task's generator or requested reading format. If neither is specified, follow the project default: Gemini 3.8 Flash TTS. Use human-reading acute accents in a separate Gemini synthesis file and put pronunciation directions in instructions, not spoken text. Use Silero notation for explicit Silero requests. Do not ask again when the generator is already settled.

| Target | Notation | Example |
|---|---|---|
| Silero | `+` immediately before the stressed vowel | `перепр+аве`, `рюкз+ак`, `скамь+ю` |
| Human reading | Combining acute after the stressed vowel | `перепра́ве`, `рюкза́к`, `скамью́` |
| Gemini | Reading accents with separate pronunciation instructions; not guaranteed stress control | `перепра́ве`, `рюкза́к`, `скамью́` |
| Seed Audio | Uppercase the stressed vowel in synthesis input | `перепрАве`, `рюкзАк`, `скамьЮ` |

Seed handling is experimental: uppercase `росЫ` worked in a previous listening session, combining acute failed, and `+` was spoken literally. Read [the Seed pronunciation notes](../openrouter-voice/references/classroom.md) for Seed input. Do not send Silero `+` notation to Seed. Keep voice directions separate from spoken text and explain there that uppercase vowels mark stress and words must be pronounced naturally, without naming letters. Uppercasing every stressed vowel in a long passage has not been established as reliable by listening; present it as a preparation strategy, not a guarantee. Preserve sentence-initial capitals and proper-name capitalization. Do not infer stress from existing capital letters.

## Deliverables and scope

For saved sources use a sibling such as `<stem>-stress-silero.txt`, `<stem>-stress-seed.txt`, or `<stem>-stress-reading.txt`. Keep local narration artifacts under `.local/silero/input/` or `.local/openrouter/input/`, matching the generator. Provide the absolute file link, notation, and unresolved pronunciations if any. Do not imply that a recording has been corrected merely because marked text exists.

Text preparation does not authorize paid generation, retries, model installation, or switching generators. If audio generation is also explicitly authorized, continue with [silero-tts](../silero-tts/SKILL.md) or [openrouter-voice](../openrouter-voice/SKILL.md), retaining the task's parameters and authorization boundaries. Creating this skill alone does not request a trial recording, application changes, or checks.