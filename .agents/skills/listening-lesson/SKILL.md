---
name: listening-lesson
description: "Design a RusLang listening lesson or trainer: establish the topic, propose visual supports and a story/dialogue, incorporate feedback, prepare exercises, then narrate the agreed script. Use for new or revised listening lessons; a single defined utterance only needs the audio skill."
---

# RusLang listening lessons

Plan the lesson collaboratively with the owner in stages. The main audience is
children from Kazakh-medium schools learning Russian as a second language;
ENT preparation is a separate objective. Do not infer language proficiency solely
from grade or school language.

This skill owns the script and learning sequence. Read the technical audio skill
only at the audio stage. Use an available image-generation skill when new images
are part of the agreed concept; otherwise prepare an image description and explain
the missing capability. A skill reference means reading instructions when needed,
not automatically launching another agent or clearing the current context.

## 1. Topic and objective

If the topic is unknown, first ask one short question, e.g. «На какую тему сделаем
аудирование?», and wait. Do not ask again if already provided. Resume existing
lessons from saved decisions.

Then clarify only details affecting the concept: grade/Russian proficiency,
learning objective, approximate duration. Reuse known information; for optional
gaps propose a provisional version with explicit assumptions. Avoid a long intake
form. For ENT, establish subject and target skill; do not claim exam-format fidelity
without an established basis.

## 2. Proposal and feedback

Offer 2–3 short, meaningfully different options, such as:

- one character's story with a setting illustration or sequence of frames;
- two-character dialogue, optionally with a narrator;
- a scene or sound riddle when it supports the objective.

For each, describe the situation, speakers, what pupils should understand by
listening, useful visual supports, and follow-up actions. This proposes content,
not mandatory image generation. A no-image version or existing assets may suffice.

Let the owner choose, combine, or revise options and wait for feedback. Do not
substitute paid audio, images, or a finished game for discussion. If a concept is
already described and approved, do not restart the selection step.

## 3. Agreed script and exercises

Turn the selected concept into concrete reviewable material:

- clean story/lines; for dialogue, roles and turn order, optional narrator separately,
  voice characteristics, and visual-support plan;
- before listening: a clear task and only essential new vocabulary;
- first listen: overall meaning; repeat: details, sequence, or target construction;
  then a short independent response/retelling;
- questions/tasks with answers, brief explanations, and evidence in the audio text.
  Assessed details must be audible, not merely inferable from the image.

Real-life situations, short natural turns, and manageable vocabulary matter more
than effects. Adapt length, listening count, and tasks to proficiency; the sequence
above is a starting point, not a mandatory screen layout. Preserve/add RU/KZ
support as appropriate, without requiring every line's translation. Do not replace
listening comprehension with reading the full transcript beforehand; retain an
accessible text alternative.

Show the script, tasks, and visual plan; incorporate feedback. Preserve earlier
agreements in targeted edits. Feedback on characters/plot alone does not approve
unseen lines. Once the concrete script is agreed and asset creation is requested,
proceed without repeated formal permission. A request only to plan/update a skill
does not include generation or game implementation.

## 4. Audio and visual assets

For expressive dialogue, multiple characters, narration, or references, read
[openrouter-voice](../openrouter-voice/SKILL.md). For explicitly selected offline
speech, read [silero-tts](../silero-tts/SKILL.md). Do not duplicate their API
instructions here. Seed is the initial OpenRouter model unless another is chosen.

Pass agreed wording, roles, delivery, approximate duration, and new output names
to the audio skill. Scenes need a complete prompt rather than a solo-narration
wrapper. Add a narrator as a separate voice only when needed, not automatically.
Specify the speaker of each line; role labels and directions must not be spoken.

For multiple references or image-derived voices, read the relevant section of the
[Seed reference](../openrouter-voice/references/classroom.md), not the whole model
catalog. Seed accepts up to three audio references; a narrator's reference uses one.
Respect technical prompt/duration limits. Split longer scripts into agreed episodes
without modifying original audio.

Use agreed/existing images; generate new ones in the available image tool only
when needed. Their content must match the lines and tasks. Do not publish private
reference sources or keys.

Give the owner a result link and wait for evaluation when acceptance is pending.
Successful API output does not confirm voice, stress, or speaker separation.
Do not run extra trial generations to complete a feature checklist; retry for
specific feedback/requests. Do not change tempo, trim, or re-encode OpenRouter audio.

## 5. Trainer integration and resuming

Implement a game when it is requested and content is established. First read the
project documents listed in `AGENTS.md`; reuse shared components/data structures.
Beginner listening uses `category: primary`, `subcategory: listening`; do not
place it in ENT automatically. Explicit taps start/replay audio; exiting stops it.
Retain a text alternative, separate checking, explanations, explicit continuation,
and replay.

Record current decisions in `docs/lessons/<slug>.md` using the
[plan template](references/lesson-plan.md). Keep the current script, answers,
statuses, and next step rather than a full chat log. Distinguish approved material,
proposals, and audio not yet auditioned. Prompts/private references remain local;
lesson records contain only necessary public relative paths. On game integration,
add a `docs/MIGRATION.md` entry under project rules.

After a break, read the specific lesson plan and current-stage documentation only.
Do not preload every skill/reference. RusLang verification rules remain: builds,
tests, and browser walkthroughs require a separate request.
