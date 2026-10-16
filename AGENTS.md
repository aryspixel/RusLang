# RusLang contributor instructions

This repository is a catalog of interactive Russian-language trainers for a 75″ touch panel. Migrate legacy HTML games one at a time, collecting feedback after each. See `docs/MIGRATION.md` for the current inventory and status.

Write maintainer documentation and agent instructions in English. Preserve Russian/Kazakh learning content, exact UI labels, filenames, and pronunciation examples where their wording matters. Continue discussing tasks in the user's language.

## Before adding or migrating a game

1. Read [UX rules](docs/UX.md), [age and theme rules](docs/THEMES.md), [catalog navigation](docs/NAVIGATION.md), and the [migration plan](docs/MIGRATION.md).
2. Identify the learning objective, recommended grade and its source, interface language, answer format, evaluation method, and expected feedback.
3. Compare the scenario with the interaction types in the UX document. For a new type, update that document and shared components.
4. Preserve source learning texts, answers, and explanations; record factual corrections in the migration entry.

## New listening lessons

- For a listening lesson/trainer, start with [listening-lesson](.agents/skills/listening-lesson/SKILL.md): if the topic is unknown, ask and wait; then propose story/dialogue and visual-support options, incorporate feedback, and agree on exact lines and exercises. For a single already-defined recording, use the audio skill directly.
- The lesson skill handles content planning; [openrouter-voice](.agents/skills/openrouter-voice/SKILL.md) joins at the agreed audio stage for multiple characters and an optional narrator. Do not generate paid assets in place of discussion or request permission again for already-agreed actions. Do not implement a game when only a lesson script was requested.
- Save the current plan and decisions in `docs/lessons/<slug>.md`. On resuming, read it and the current stage's instructions. Load skill references on demand; keep the detailed workflow in the skill rather than duplicating it here.

## Owner preference: vocabulary word snake

- The owner approved word-snake search in level three of «Круглый год» and intends to reuse it for vocabulary learning. Consider it a standard option when it serves the objective; do not add it to every game automatically.
- Reuse `src/components/WordSnakeTrainer.vue` and `src/games/word-snake.js`, not a copy of the months level. See the [word-snake template](docs/WORD_SNAKE.md) for parameters and a starter.
- Preserve adjacent-letter taps, undo, separate checking, input locking after an answer, explicit continuation, and replay. In multilevel games, switch levels with one tap while preserving state; introductory descriptions are unnecessary by default.

## Audio and project skills

- Use [openrouter-voice](.agents/skills/openrouter-voice/SKILL.md) for expressive cloud narration, character voices, audio references, dialogues, and sound exercises. Its default model is Seed Audio. Setup and commands: [docs/OPENROUTER_AUDIO.md](docs/OPENROUTER_AUDIO.md). Keep Silero for ordinary local/offline speech; do not change an already-selected generator without a reason or user instruction.
- Before dictation, stress correction, or audio scenes, read the [Seed listening results](.agents/skills/openrouter-voice/references/classroom.md). `росЫ` worked, an acute accent did not, and `+` was spoken literally; Silero and Seed use different notation. Keep synthesis markup separate from learner text. API acceptance does not establish exact pauses or perceived voice age.
- Preserve OpenRouter audio without tempo changes, trimming, normalization, or re-encoding. Control approximate duration through text length and generation directions. Keep prompts, references, and metadata in `.local/openrouter/`; copy only the required audio and clean learning text into a game. Do not commit private recordings or local paths from generation metadata.
- The owner configures `OPENROUTER_API_KEY` or `OPENROUTER_KEY` in the working machine's root `.env` or environment. Do not copy keys between machines or prefix them with `VITE_`. Developers generate audio ahead of time: credentials and paid API calls must not enter the browser, GitHub Pages, or client bundle.
- Adding/updating a skill does not authorize paid trial generations. Use saved parameters and recipes instead of repeating research unnecessarily; verify current prices when asked. Multi-reference dialogue is documented but not tested here; the owner declined a separate trial.

## Architecture

- For local Russian speech, use the project [silero-tts](.agents/skills/silero-tts/SKILL.md) and installed `tts.bat`; parameters and recovery: [docs/LOCAL_TTS.md](docs/LOCAL_TTS.md). Model: `v5_5_ru`. For similar beginner stories, the owner's baseline is `kseniya`, `slow`, and 700 ms between sentences. Before generation read the [saved narration notes](.agents/skills/silero-tts/references/narration.md): stress, list pauses, and intonation. Generation is offline; model and environment live in `.local/silero/`. Put game audio in that game's assets. Respect the documented model license.
- Vue 3 + Vite. Each trainer is a Vue module in `src/games/<slug>/`, with exercise data separate from presentation.
- Shared colors, sizes, spacing, and states live in `src/styles/`; shared controls in `src/components/`. Do not copy button, card, and feedback styles into every game.
- Grade and visual theme are independent registry metadata. Mark an unspecified grade recommendation provisional or unknown. Themes supply decorative tokens through `src/styles/themes.css`; changing a theme must not change content or results.
- Catalog and loading live in `src/games/registry.js`. Use lazy `import()`; do not load all games on the home page.
- Assign exactly one `category`: `speech` (Развитие речи), `ent` (ЕНТ), or `primary` (Начальный уровень). Home displays these three sections without search or filters, per the owner's October 10, 2026 decision. Preserve controlled `facets` from `src/catalog/filtering.js`; placement rules: `docs/NAVIGATION.md`.
- Assets must work under a GitHub Pages subdirectory. Use Vite's relative base and local assets without a mandatory CDN. Avoid root-absolute `/` paths.
- Keep educational content separate from components. Do not insert user text through `v-html` unless the fragment is vetted and its use justified.
- Each exercise needs clear instruction/introduction, task, answer, explanation, transition, result, and replay states.

## Touch interaction and accessibility

- Beginner listening exercises belong to «Аудирование»: `category: 'primary'`, `subcategory: 'listening'`. The first trainer is «Среда Али: покупки и рассказ». The subsection has its own card; games return to that subsection.
- The main path must work by touch without hover, precise dragging, keyboard, or required sound. Always provide “select item → select destination” alongside dragging.
- Use semantic buttons, visible focus, readable labels, and textual feedback. Never indicate correctness by color alone.
- After an answer, lock repeated input, show the correct answer and explanation, then an explicit «Дальше» action. Accidental taps must not advance the task.
- Preserve source RU/KZ pairs; do not shorten translations for layout.
- Run checks only at the user's explicit request, per the October 10, 2026 owner preference. Without it, do not run builds, tests, browser checks, touch walkthroughs, layout measurements, or create/view screenshots. An interface complaint alone does not request checks. This rule overrides testing recommendations elsewhere in the project.
- When responsive checks are requested, use 1920×1080, 1366×768, and a narrow screen. Avoid horizontal scrolling and clipped controls during implementation.

## Migration and verification

- Migrate legacy HTML strictly one game at a time. Stop for owner feedback after each, then proceed. Record status and details in `docs/MIGRATION.md`. Do not delete legacy sources.
- Compare new behavior with the source: task count/types, scoring, hints, replay, and bilingual text.
- When verification is explicitly requested, run `pnpm build` (or `npm run build` with npm). For a requested new interaction check, cover touch/emulated touch, wrong answers, completion, and replay.
- `.github/workflows/pages.yml` deploys GitHub Pages on pushes to `main`. Check the build/current game only when explicitly requested; preserve lazy loading and relative asset paths.
