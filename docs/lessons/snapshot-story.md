# «Снимок, который не сделали»

## Objective and audience

- Topic: художественный рассказ, comprehension, style/composition, expressive devices, sentence structure, event order, oral opinion and retelling.
- Objective: use details from a literary text to distinguish fact from a narrator's assumption, explain structure and language, identify grammatical bases, and retell an episode from another character's point of view.
- Grade 9 is explicit in the supplied DOCX. Russian interface/material; senior theme.
- Format: one narrator's story with an explicit recording button and a readable transcript alternative.
- Source WAV: `viewpoint-story-adult-gacrux.wav`, 24 kHz mono PCM, 112.04 seconds. Its spoken input matches the DOCX story verbatim. The user-provided recording is included with the trainer.

## Owner decisions

- User requested: «создай, посмотрю» after the concept proposal, then asked to include the supplied audio in the trainer.
- Base story and question objectives come from `Urok_ekzamen_Hudozhestvennyy_stil_9_klass.docx`.
- The source document labels six event frames A–E but contains no descriptions or images for them. Current implementation uses six text event cards; new imagery is not approved or generated.
- The source's 25-point scale is retained: 13 points for scored selections, six for grammar, two for ordering, and four for oral work. Oral scoring is learner self-rating using the listed criteria and can be discussed with a teacher.

## Script

The supplied story «Снимок, который не сделали» is preserved in `src/games/snapshot-story/data.js`. No new spoken lines or narrator script have been added.

## Lesson stages

1. Listen to the story using «Послушать рассказ» or open the text alternative.
2. Answer seven comprehension/fact questions with textual evidence.
3. Identify speech type/style, composition, and four expressive devices; analyze three grammatical constructions and their bases.
4. Order six text cards; explain the change from taking a photo to helping the gardener.
5. Give an opinion and retell in 5–6 sentences from Madina's point of view. Self-review against four criteria; no automatic language-quality grading.

Correct answers, short explanations, and evidence are in `src/games/snapshot-story/data.js`. Source task 3's type/style and task 4's composition are represented as separate short-choice questions. Three extra comprehension checks are formative and unscored.

## Assets and implementation

- Game: `src/games/snapshot-story/Game.vue`; data: `src/games/snapshot-story/data.js`; catalog section: `Развитие речи`.
- Source DOCX remains at its supplied local path. The supplied WAV is copied unchanged to `src/games/snapshot-story/assets/viewpoint-story-adult-gacrux.wav` and played through `SpeechControls.vue`.
- Uses shared `ChoiceGroup`, `FeedbackMessage`, `ProgressMeter`, `SurfacePanel`, and `TouchButton` components.

## Status and next step

- Trainer and audio integration are live for owner review. The WAV input text was confirmed against the story. The GitHub Pages workflow completed successfully; the public trainer's audio button started playback and the «Стоп» control stopped it. The complete 112-second recording has not been auditioned end to end.
- Await feedback on the tasks, choice wording, sequence-card approach, self-scoring of the oral part, and whether the WAV matches the story.
