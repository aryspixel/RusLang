# Legacy HTML migration plan

As of October 19, 2026: 19 trainers—2 in «Развитие речи», 10 in «ЕНТ», 7 in «Начальный уровень». Migration history follows.

## Migration entry: «Литература: подготовка к ЕНТ»

Migrated `trenazher_literatura_ENT.html` into «ЕНТ» at the owner's request on October 19, 2026. Implemented; checks not run; awaiting feedback.

- Objective: recognize works from descriptions, connect authors and works, recall characters, details, and meaning. Provisional grades 9–11 based on content and ENT preparation; no exact source grade. Russian UI/content, senior theme, senior / literature / choice / ru metadata.
- Directly extracted all 333 questions and 197 work passports/revision cards across nine sections. Preserved choices, correct answers, hints, explanations, reasoning methods, and all passport fields in separate `src/games/literature-ent/data.json`. No factual content changes; source HTML unchanged.
- Preserved learning/test modes, section/type selection, 10/20/40/all questions, shuffled questions/choices, two hints and disabling help, question navigation, editable test choices before completion. Learning uses separate checking, locks the response, reveals explanations, and advances explicitly. Tests hide correctness/passports until completion. Finishing with skipped questions requires a separate action.
- Preserved accuracy, errors/skips, hint usage, time, section summaries, full review with an error filter, comparison against a wrongly selected work, retry of current errors, and localStorage error history with the original key. Reference search covers author/title/characters with a section filter. Leaving an active attempt for settings/reference requires confirmation; storage failures do not prevent practice.
- Reused existing interaction types and SurfacePanel, TouchButton, ChoiceGroup, FeedbackMessage, ProgressMeter. Shared typography/touch controls; collapsible question map. Lazy import, no external assets.
- No build, tests, browser/touch checks, measurements, or screenshots under the owner's preference. Owner requested publication; pushing main triggers the standard Pages workflow.


## Migration entry: «Средства выразительности»

Migrated `trenazher_sredstva_vyrazitelnosti.html` into «ЕНТ» at the owner's request on October 16, 2026. Implemented; checks not run; awaiting feedback.

- Objective: identify tropes/figures in a fragment, explain their distinguishing feature and role. Provisional grades 9–11 based on content; no source grade (`audienceSource: provisional`). Russian UI/content, senior theme, senior / literary-devices / choice / ru metadata.
- Directly extracted 36 tasks in six blocks, all choices, answers, analysis phrases, nonfigurative meanings, features, functions, and hints. Preserved a 27-device glossary with definitions/examples/guidance, six references, and ten comparisons of similar devices. No factual learning-data corrections; source HTML unchanged.
- Preserved learning mode, three hint stages, disabling hints, revealing answers, glossary search, block/all-36 tests, delayed test review, accuracy percentage, difficult-task retry, and learning-mode error review. Difficult tasks mean errors/help-assisted answers in learning and errors in tests. Tests hide hints, glossary, and current correctness. Review has four steps and distractor comparisons.
- Project UX adaptation: one selection plus separate checking, locked after the first response, correct answer/explanation, explicit «Дальше», rather than repeated guesses. Revealed answers earn no independent credit. Block/mode switches preserve state and shuffled choice order. Restart is separate; no extra start screen.
- Reused choice, modes, hints, glossary, and shared SurfacePanel, TouchButton, ChoiceGroup, FeedbackMessage, ProgressMeter. Data: `src/games/expressive-devices/data.js`; view: `Game.vue`; lazy `import()`. No external assets.
- Build, tests, browser/touch checks, measurements, and screenshots not run: no separate owner request.

## New trainer: «Обставь мою комнату»

October 16 owner request: adjusted the desk book and bed teddy bear. The book moved onto visible tabletop to the right of the bed, became smaller/flatter on the desk (`scaleY: 0.4`, bottom anchoring) to match its frontal view. The bear moved toward the headboard and mattress center. Furniture dependencies/learning answers remain; source images unchanged. No build, browser checks, or screenshots.

Owner request: enlarged the bed 25% in all three positions (base width 32 → 40% of scene). Adjusted items on/near the bed; desk stays behind it. Build/browser checks not run.

Later October 15 request: lowered the main wall shelf from 33 to 44% scene height; shelf objects moved down the same 11 percentage points. Desk placed behind the bed in depth. Dependents now retain order relative to furniture within its depth layer: desk book/lamp no longer show over the bed. Destination markers remain above all objects. Build/tests/browser checks not run without a separate request.

After October 15 feedback that furniture did not match the room, created separate bed/desk/wardrobe/chair images (`*-room-v2`) using the empty room as visual reference. Wardrobe is tall/narrow with visible right side; desk nearly frontal with less exposed top; bed follows the left wall; chair uses a matching angle. Disabled extra CSS wardrobe reflection because the new drawing already had the required orientation. Updated sizes/positions and small-object placement on new surfaces. Game uses WebP; earlier images preserved. Tasks/answers unchanged. No requested build/browser checks; scene alignment awaits owner feedback.

October 15 adjustment from owner's photo: wardrobe mirrored in scene/card (`flipX`), width near door increased 19 → 24% of scene. Desk moved right/down; book/lamp/ball/chair positions match its new top; box/cat moved right of the larger wardrobe. CSS reflection leaves source images unchanged. No browser/build checks.

October 15, 2026 owner request: desk lowered to floor; wardrobe on floor at far wall left of door; other item sizes/positions aligned. Added separate transparent rug/shelf/plant/clock images, with lightweight WebP in-game. Now 14 objects, 7 furnishing tasks, 7 object tasks, and 18 sentence tasks instead of 6. Original six sentences preserved, with additional item descriptions and four fronted-place-adverbial sentences. Free-room objects move with furniture; slots on missing furniture are disabled; removing furniture removes dependents. Objective, provisional grades 1–4, and Russian UI retained; added «над», «у», «посреди». No build/tests/browser checks/screenshots: not separately requested.

After the owner reported incomplete image loading, added WebP versions of ten objects instead of importing large PNGs; preserved PNG sources, dimensions, and transparency, with quality 85 compression. Reduced downloads without changing illustrations. Network-failure cause unconfirmed; no requested build/browser checks.

October 14, 2026 feedback: replaced source-sheet rectangles with ten separate transparent PNGs in `src/games/furnish-room/assets/items/`, one object each, lamp separate from nightstand. Built-in ImageGen produced a consistent educational illustration style. Cards/scene share local imports; removed `mix-blend-mode`. Tasks/answers preserved. No requested build/browser checks/screenshots.

Created October 14, 2026 from an agreed scenario. Implemented; checks not run; awaiting feedback. Continues «Моя комната», with a separate card directly in `primary`.

- Objective: furniture/object vocabulary, placement directions, sentences with «в», «на», «под», «около», «рядом с». Provisional grades 1–4 by vocabulary complexity, not confirmed curriculum (`audienceSource: provisional`), junior theme, Russian UI. No source RU/KZ pairs.
- Sources: three PNGs from owner's «моя комната» folder—«Моя комната: большое повторение» worksheet, sticker sheet, empty room. Copied room/sheet locally, preserving sources. Initially displayed stickers with shared `ImageSprite.vue`, softening white via CSS mix-blend-mode. New interactive adaptation, not a literal migration of all seven printed activities. No factual corrections; new wording for this scenario.
- Four parts: five furniture instructions, five small-object instructions, six card-built sentences, free room for guided oral description. Practice scores separate: 5, 5, 6; free mode not auto-graded. No timer/required audio.
- New shared `RoomPlacementBoard.vue`: item → large labeled numbered destination → preview → separate check → lock → correct phrase/explanation → explicit continuation. Retain correct placement for the next task. Parts two/three independently accessible, starting with furniture/full scene respectively. Each preserves state, result, answer review, replay. Free mode supports moving/removing items, finishing for retelling, returning to arrangement, and a new room.
- Separate data: `src/games/furnish-room/data.js`; view: `Game.vue`; lazy import; local PNGs via Vite. Added controlled `placement` format; interaction documented in UX.
- Under owner rules, no build/tests/browser/touch checks, measurements, or screenshots. Scene/sprite placement not yet browser-verified.

## New trainer: «НЕ с разными частями речи»

Created October 14, 2026 from an approved scenario. Implemented; checks not run; awaiting feedback. New material, not HTML migration.

- Objective: joined/separate НЕ spelling, contextual part-of-speech identification, explanation. Provisional grades 7–11 by editorial content assessment (`audienceSource: provisional`), not confirmed curriculum. Russian UI/content, `ent`, `senior`, middle / senior / orthography / choice / ru metadata.
- Bank: 30 sentences, six each for verbs/adverbial participles, nouns, adjectives, participles, adverbs. «Слитно или раздельно?» uses all 30; «Докажи написание» uses 15 (three/block, three graded steps); «Что изменилось?» uses ten pairs (two/block). Individual blocks and «Всё вместе». Pronouns, numerals, and systematic недо- practice excluded from version one.
- Covers ordinary negation with verbs/adverbial participles, words not used without НЕ, affirmation of a new concept/property, contrast with «а», emphatic negation, full participles with/without dependent words, short participles, and «не по-дружески». Reference notes discuss the modified noun, degree words, «но», and недо-. No educational source; examples written for this scenario.
- Tap selection, separate check, lock, correct text/explanation, explicit continuation. Spelling: one point; proof: one/step, max three/task; pairs: one only for both correct. First proof step shows morphology; spelling rule appears after step two. Results/review, full retry, error-only retry including repeated errors. Preserve each mode/block combination until exit. No timer/required audio/extra start screens.
- Reused ChoiceGroup, TouchButton, SurfacePanel, FeedbackMessage, ProgressMeter and choice, multistep choice, tabs, reference interactions. Data: `src/games/ne-parts/data.js`; view: `Game.vue`; lazy `import()`. No external assets.
- Build/tests/browser/touch checks, measurements, screenshots not run: not requested.

## New trainer: «Н и НН в частях речи»

Created October 12, 2026 at owner request. Implemented; checks not run; awaiting feedback. New scenario, not legacy HTML migration.

- Objective: Н/НН from part of speech, derivation, context; distinguish full/short forms; explain/compare cases. Provisional grades 7–11, not tied to approved curriculum (`audienceSource: provisional`). Russian UI, `ent`, `senior`, middle / senior / orthography / choice / ru metadata.
- Three modes: «Н или НН?»—24 tasks; «Докажи ответ»—12 from the same bank with part-of-speech/spelling/reason steps; «Сравни пару»—eight pairs. Covers adjectives, full/short participles, a short adjective, adverbs, nouns, exceptions, dependent words, perfective aspect, short-form comparisons. New material, no source learning text to migrate.
- Tap choice, separate checking, lock, correct answer/explanation, separate continuation. One/spelling; one/proof step; pair point only when both are correct. Results/review, full-mode or error-only retry, recurring errors re-enter retry. Modes retain state while open. No timer/introduction screens; task-level instructions and expandable reference.
- Reused single choice, multistep choice, modes, reference, ChoiceGroup, SurfacePanel, TouchButton, FeedbackMessage, ProgressMeter; no new interaction type. Data: `src/games/n-nn/data.js`; view: `Game.vue`; lazy loading. Added `orthography`; no external assets.
- Owner rules: no build/tests/browser/touch checks, measurements, or screenshots without an explicit request.

## New trainer: «Моя комната»

Current audio: `my-room-amina-kseniya-shkaf-up.wav`. Replaced Aliya with Amina in narration, text files, headings, and questions. Synthesis uses «Ам+ина» (и stress). Latest owner request raised «шкаф» via SSML `<prosody pitch="high">` with a synthesis-only comma signaling continuation; no pitch rise on «и кровать». This attempts a rising contour; contour control is unverified. Clean text has no service comma. Retained `kseniya`, `slow`, 700 ms sentence gaps, 450 ms list gaps, and exclamatory ending. Connected recording; previous version archived locally. Checks not run; owner evaluates intonation by listening.

Previous audio: `my-room-aliya-kseniya-list-pauses.wav`, `kseniya`, `slow`, 200 ms sentence gaps. Owner specified «Али+я» (final-я stress), with 450 ms gaps between «стол», «стул», «шкаф», «и кровать». Source: `src/games/my-room/story-tts-kseniya.ssml`; clean text separate. Preserved «Я люблю свою комнату!». Checks not run.

Previous configuration: owner feedback restored `slow`, short 200 ms extra gaps, and `kseniya`; connected `my-room-aliya-kseniya-warm.wav`. Restored «Я люблю свою комнату!» in story/text/audio, totaling 11 sentences. Synthesis: `src/games/my-room/story-tts-kseniya.txt`, with opening/closing exclamations, explicit «любл+ю», «к+омнату», and retained «на стол+е». Rejected `x-slow` with one-second gaps as too slow. Earlier audio archived locally. No new checks; owner evaluates warmth/expression by listening.

Created October 10, 2026; checked, awaiting owner feedback. New agreed scenario, not HTML migration.

- Objective: understand a Russian room story, recognize named objects, answer «Где?» with «в», «на», «под», «около / рядом с». Owner approved the 11-sentence text unchanged. Prepositions/full RU/KZ pairs from the supplied picture: «в — ішінде», «на — үстінде», «под — астында», «около / рядом с — жанында». Russian UI/story, RU/KZ reference. Provisional editorial grades 1–4 by vocabulary; junior theme.
- Placement: `primary / listening`, return to «Аудирование». Controlled topic `place-prepositions`, format `choice`; separate `import()`.
- Initially narrated locally by Silero `v5_5_ru`, xenia: 48 kHz mono 16-bit WAV, 21.15 seconds. Recording/generation parameters in `src/games/my-room/assets/`. Initial verification matched metadata text to agreed story. Model: Silero Team, https://github.com/snakers4/silero-models; installed license CC BY-NC-SA 4.0, see LOCAL_TTS.md.
- Two blocks: select six named characters/items from ten cards; six four-choice location questions. Full card set checked without separate score; questions one point each, final out of six. After check show correct set/answer, explanation, separate continuation. Lock inputs; tabs retain state. Results/review/full replay; no timer.
- Reused ChoiceGroup, SpeechControls, SurfacePanel, TouchButton, FeedbackMessage, ProgressMeter; no new interaction. Replay narration at any step or reveal text; explicit audio start, stop on part switch/exit. Reference expands separately.
- Explicit owner-requested verification: `npm run build` passed; Edge touch at 1920×1080, 1366×768, 390×844 covered errors, deselection, locking, explicit continuation, part-switch state, 5/6 result, correct-set replay, RU/KZ reference, playback/stop/end, subsection return. No JS errors, horizontal overflow, or width-clipped targets; buttons/summary at least 48 px. Media-request failure separately checked: readable text and clear message. No screenshots created/viewed; owner asked to assess pronunciation by listening.
- Later feedback replaced Dima with Aliya in narration/headings/clothing question. Clean text: `src/games/my-room/story.txt`; synthesis: `story-tts.txt`, with «на стол+е», «стол+ом», «шкаф+у», «кров+ати», «кров+атью». Regenerated `slow` via SSML prosody; connected `my-room-aliya-slow-xenia.wav`, archived initial recording only in `.local/silero/archive/`. Prior browser results apply to version one; no checks after this edit.

All fourteen legacy HTML files, including folders 01, 02, 03, were migrated into twelve catalog games; newer versions expanded the conjunction trainer. Games were checked/published through incremental pushes. Temporary owner authorization on October 1, 2026 allowed finishing the list without feedback pauses. Legacy files remain in `C:\Users\User\OneDrive\Desktop\ИГРЫ HTML` as content/behavior references.

October 8, 2026: migrated «Односоставные предложения», bringing the catalog to thirteen games.

October 8, 2026: created «Круглый год: 12 месяцев» from the owner's agreed scenario, bringing it to fourteen. Implemented/checked; awaiting feedback.

## New game: «Круглый год: 12 месяцев»

October 9, 2026: owner approved and requested publication. Before pushing main, reran build/touch checks on all three levels at four screen sizes; publication includes the trainer/shared word-snake template.

Latest level-three update: hid target month list (`showTargets=false`), showing found words only; errors reveal no remaining words. Blue thread joins selected letters; found paths remain green; undo/reset clear only the current path. ResizeObserver aligns lines/cells on resize/level switching. Generator distributes nonintersecting paths across the board instead of uniform two-row routes. Words of four-plus letters require both a turn and straight run of at least three cells. Bounded search has a guaranteed difficult-vocabulary fallback. Checked 200 month sets, varied straight runs, no hint leaks, centered lines, tap passthrough, found paths, all 12 words, errors/undo/replay, and 1920×1080, 1366×768, 390×844, 320×700; build passes.

Owner request made word snake a permanent project template: AGENTS.md preference and docs/WORD_SNAKE.md integration/settings. Shared WordSnakeTrainer.vue now owns logic; months level three supplies vocabulary/headings only. src/games/word-snake.js supports arbitrary vocabulary size, partial final boards, untruncated long words, Ё, and Kazakh letters. Tested an independent five-word set including «Достопримечательность», «Берёза», «Қаңтар», boards 2/2/1, results/replay at 1920×1080, 1366×768, 320×700. Full months touch walkthrough at four sizes and pnpm build passed again.

Added level three «Найди месяцы»: four 4×6 boards, three months each, all 12 Russian names, no translations. Initially showed target names beside the board. Each word turns; paths use edge adjacency without diagonals/reused cells. Last-letter tap undoes; separate reset. Any valid spelling path accepted. Errors/duplicate words earn no points; lock after checking until explicit continuation. Mark found letters/words; separate transition after three words. Result of 12 words and regenerated replay. Three level buttons support one-tap switching preserving letters/feedback/results. Shared LetterSnakeBoard.vue, snake-data.js generation, SnakeMonths.vue learning view. Added `word-search` format.

Initial level-three verification: 200 generated sets with correct month spelling, no path intersections, adjacent letters, a turn per word. Touch at 1920×1080, 1366×768, 390×844, 320×700 found all 12 and covered wrong words, rejected diagonals/cell reuse, undo/reset, uncredited duplicates, locking/transitions/state/results/replay. No JS errors/overflow/clipped buttons; targets at least 48 px. Existing two levels, weekday ordering, Ali basket rechecked; pnpm build passes. No screenshots created/viewed.

Level one added seasonal card backgrounds: winter blue, spring green, summer yellow, autumn peach. Month colors persist during placement/dragging; selection adds a border; correctness retains shared states and ✓/✕. Level two has no seasonal card colors. Build/color/drag/width checks passed at 1920×1080, 1366×768, 390×844 without screenshots.

Owner feedback removed introductory screens/long descriptions. Game opens on year assembly; two persistent buttons switch levels in one tap anytime. Each level retains answers/check/feedback; level two also current season/card order. Completed level two reopens at results. Unplayed level one appears unchecked in results.

- Objective: Russian names/order of all 12 months and four-season membership. Owner explicitly chose grade 4 on October 8, 2026 (`audienceSource: source`), junior theme, Russian UI with Kazakh translations on level-one cards/reference. No HTML source; new agreed scenario.
- Level one: assemble January–December from 12 shuffled RU/KZ cards, month-then-slot taps plus shared SequenceBoard dragging. Deselect, return, replace/swap occupied slots. Separate full-order check shows correct-position count, textual markers, RU/KZ order, December → January explanation.
- Level two: four local season SVGs with Russian names/alt text; select three of 12 untranslated months. Retap basket cards to remove; order irrelevant. Calendar winter: December/January/February; spring: March/April/May; summer: June/July/August; autumn: September/October/November. Separate check then correct set/explanation.
- Lock after checking; separate continuation. Persistent one-tap level buttons with preserved state; level-one reference; results with separate months/12 and seasons/4, answer review, shuffled full replay. No timer/required audio. Existing interactions; extended SequenceBoard/SelectionBasket parameters preserve old defaults.
- Data separate from Game.vue in src/games/year-months/data.js; Vite image imports, no CDN. Separate import(), primary / months-seasons / sequence + choice / ru-kz tags. New «Месяцы и времена года» topic documented in NAVIGATION.md.
- October 8, 2026 verification: pnpm build, full Edge touch at 1920×1080, 1366×768, 390×844, 320×700. Covered incomplete answers, undo/return/replace/swap, reference, all RU/KZ pairs, no level-two translations, four image loads, three-selection limit, deselection, wrong/right answers, locking/transitions, 10/12 and 3/4 results, replay to 12/12 and 4/4. No JS errors/overflow/clipped controls; targets at least 48 px. Rechecked weekday ordering/Ali basket after shared-component extensions. No screenshots created/viewed. Awaiting owner feedback; not published at that point.

| Source file | Content / details | Status |
| --- | --- | --- |
| `Trenazher_odnosostavnye_predlozheniya_9_klass.html` | Three ten-question levels, reference, error review/retry | Migrated; checked; awaiting feedback |
| `soberi_nedelyu_RU_KZ.html` | RU/KZ, seven-day order, drag/tap, glossary | Migrated |
| `den_Ali_game_RU_KZ (1).html` | RU/KZ, clock/choice, then event order | Migrated; checked |
| `poimai_chislo_1_20.html` | RU/KZ, three-second flickering number, ten rounds | Migrated; checked |
| `Trenazher_tipy_teksta_osen_9_klass.html` | Three modes: text type, formulaic phrases, free text/example | Migrated; checked |
| `trenazher_SSP_SPP_vidy_pridatochnyh.html` | Grammar-choice modes/explanations | Migrated; checked |
| `trenazher_soyuz_ili_soyuznoe_slovo.html` | Two-step classification/question to relative word | Migrated; checked |
| `trenazher_soyuz_ili_soyuznoe_slovo (1).html` | Extended three-mode version; preserve unique tasks from both versions | Migrated; checked |
| `Podchinenie_pridatochnyh_interaktivnaya_kartochka.html` | iframe export with tabs/four subordination diagrams; rebuild content without export wrapper | Migrated; checked |

The original two conjunction/relative-word files have separate cards. Folder 03 versions expand the second to six modes; all unique tasks/explanations remain.

## Procedure for each file

1. Extract tasks, answers, explanations, modes, scoring, RU/KZ text. Establish grade/source/theme under `docs/THEMES.md`; assign tags under `docs/NAVIGATION.md`.
2. Map to `docs/UX.md` interactions and required components.
3. Put data in `src/games/<slug>/data.js`, view in Vue; register lazily.
4. When explicitly authorized under AGENTS.md, check physical/emulated touch, keyboard, target viewports, and `pnpm build`.
5. Update table status only after verification; record deliberate departures from the source.

## Build and GitHub Pages

Vite builds the catalog/lazy games into hashed files, allowing unchanged assets to be reused from browser cache after publication: the first level of incremental behavior. Per-game selective builds are not needed yet. `base: './'` supports a Pages subdirectory. `.github/workflows/pages.yml` publishes `dist/` on every push to `main`.

## Migration entry: «Собери неделю»

- Objective: order seven days Monday–Sunday and match RU/KZ names. Provisional grades 1–4 by content/THEMES.md; no source grade. `junior`, primary / weekdays / sequence / ru-kz.
- Preserved all seven Russian names, Kazakh pairs, persistent glossary, source check messages. One activity, no points/timer; result is correctly placed day count. No factual corrections.
- Main input: day → destination; optional drag retained. A displaced day returns to the pool; added deselection/explicit return. Shuffle clears slots and starts a new attempt.
- UX changes: introduction, textual correctness markers, correct RU/KZ order/explanation, locking after complete response, separate «Дальше: исправить»/«Показать итог», results/replay. Source allowed editing immediately after checking. Incomplete answers retain source fill-all-seven message and remain editable. Extra instructions/explanations separate from component.
- Touch verification at 1920×1080, 1366×768, 390×844: incomplete answer, deselection, return, occupied-slot replacement, error, lock, correction, correct answer, result/replay/shuffle, theme switch without result reset. Drag events checked; physical automated drag succeeded at 1920×1080. No horizontal overflow; long screens scroll vertically. Screenshots viewed. pnpm build passes; separate lazy chunk.

## «Собери неделю» Android update

After feedback, combined UI into one compact instruction/cards/numbered slots/actions block. Retained all seven RU/KZ pairs in expandable glossary. Shared `SequenceBoard.vue` supports actual finger/mouse dragging via Pointer Events; tap card/slot remains fallback. Chrome CDP touchStart/move/end/cancel, occupied-slot replacement, return, errors/locks/correction/results/replay, shuffle-deselection checked at 1920×1080, 1366×768, 390×844. Initial activity also fits 960×540 at 100% zoom. Actual Android panel still needs owner verification; emulation does not establish its viewport.

## Overall migration verification

For each new game, historical checks covered touch at 1920×1080, 1366×768, 390×844; wrong/right answers, input locking, explicit continuation, completion/replay. Modes preserve progress; writing preserves drafts/example disclosure. No horizontal overflow/JS errors. All routes also opened at 960×540. Screenshots viewed. Each game has its own `import()`; relative Vite base/local assets. Sources unchanged. Current checks remain subject to explicit authorization under AGENTS.md.

## Migration entry: «Распорядок дня»

Objective: time and daily routine. Provisional grades 1–4; no source grade. RU/KZ, junior, routine / choice / sequence. Preserved six events, ten questions, four random choices, clock, one point/correct answer; automatically matched data to HTML. Part two retains sequential event selection: wrong choices occupy no slot and earn no points. Parts now switch with state preservation; added introduction, RU/KZ explanations, explicit step continuation, results/replay for both parts. Clock/answers side by side on wide screens.

## Migration entry: «Поймай число»

Objective: remember/recognize numbers 1–20. Provisional grades 1–4; no source grade. RU/KZ, junior, numbers / memory / choice. Preserved ten rounds, random numbers/colors/sizes/positions, exactly three-second display, one point/answer, source result messages with eight-point threshold. Calm mode default; optional slow flicker disabled under reduced motion. Replaced automatic 1.1-second advance with explicit «Дальше». Number placement uses actual field size without clipping. Clear timers on exit; replay without page reload. Checked all rounds with virtual time and an actual three-second display.

## Migration entry: «Типы текста: осень»

Objective: distinguish narration/description/reasoning and use formulaic phrases. Source explicitly grade 9; senior, text-types / choice / writing. Preserved nine texts, six phrase tasks, three independent three-field tasks, all hints/explanations/examples, ten RU/KZ vocabulary pairs. Corrected language metadata to ru-kz: Russian tasks/Kazakh glossary. First wrong answer is now fixed with correct answer/explanation, replacing repeated guessing. Added results/review. Reference/glossary expand separately in every mode. Drafts/examples persist across modes; independent texts not auto-graded.

## Migration entry: «ССП, СПП и придаточные»

Objective: distinguish coordinate/subordinate complex sentences, subordinate-clause type, punctuation. Source grade 9; RU, senior, syntax / choice. Preserved banks of 16 structure, 24 clause-type, 12 punctuation sentences, ten random tasks/attempt. Automatically matched all text/answers/explanations to HTML. Retained reference, clause questions, scoring/error review. Shared GrammarTrainer.vue handles checks/explicit «Дальше», results/replay; modes now preserve state.

## Migration entry: «Союз или союзное слово»

Objective: distinguish conjunctions/relative words and formulate a question to a relative word. Source grade 9; RU, senior, syntax / choice. Preserved 24-sentence bank (11 conjunctions, 13 relative words), 13 question prompts. Attempt: 15 random sentences, seven conjunctions/eight relative words, max 23 points. Steps checked separately, with explicit transition and previous explanation retained. Reference/explanations/results/error review preserved. Exact source-data comparison completed.

## Migration entry: «Союз или союзное слово: три тренировки»

Objective: distinguish так как / так, как, conjunction/relative word, subordination types. Source grade 9; RU, senior, syntax / choice. Modes: 12 так как / так, как tasks (ten/attempt, 5+5); 24 conjunction/relative-word sentences (15/attempt, 23 points); 12 subordination tasks (ten/attempt: three homogeneous, three heterogeneous, four sequential). Compared both versions: identical 24-sentence bank/13 question prompts; extension adds 24 unique tasks/reference. Kept two catalog cards and all unique material. Independent state/explanations/results/review/replay per mode.

## Migration entry: «Как подчиняются придаточные»

Objective: explore main/subordinate clause links in four subordination types. Grade unknown, unspecified by source; RU, neutral, syntax / diagram. Extracted all four types/rules/examples, 13 nodes, nine question-labeled links from export. Rebuilt without iframe/CDN/export scripts; source aria descriptions also shown as text equivalents. Added introduction, viewed-type marks, explicit next/result/replay without grading. No factual learning-data corrections.

## «Поймай число» update: digits and words

Owner requested digit/Russian-name matching for 1–20. Ten rounds alternate five digit displays with 20 word choices, five word displays with digit choices. Compare numeric value; result remains out of ten. Expanded RU/KZ instructions/explanation; separate word-display font size and wider word cards. Checked both directions, all 20 labels, wrong answer/lock, 9/10 result, replay, untruncated long words/no overflow at 1920×1080, 1366×768, 960×540, 320×700. pnpm build passes.

## Additional folders 01, 02, 03

| Source | Content | Status |
| --- | --- | --- |
| `Trenazher_odnosostavnye_predlozheniya_9_klass.html` | Three ten-question levels, reference, error review/retry | Migrated; checked; awaiting feedback |
| `01/ali_sreda_click_basket_3_apples (1).html` | Story, basket shopping selection, six questions | Migrated; checked |
| `02/Trenazher_hudozhestvennye_sredstva_osen_9_klass.html` | Three blocks, speech types/literary devices, 34 tasks | Migrated; checked |
| `03/trenazher_soyuz_ili_soyuznoe_slovo (1).html` | Extra tasks/comma modes | Added to existing game; checked |
| `03/trenazher_soyuz_ili_soyuznoe_slovo (2).html` | All version (1) tasks plus 12 comma-insertion tasks | Added to existing game; checked |

Folder 01 PNGs are unused by these HTML files, whose illustrations are emoji. Folder 02 PDF/PPTX and folder 03 DOCX are supplementary lesson materials, not interactive games; originals preserved.

## Migration entry: «Типы речи и художественные средства»

Objective: speech types and epithet/comparison/metaphor/personification in autumn texts. Explicit source grade 9, RU, senior, text-types / literary-devices / choice. Added controlled «Художественные средства» topic to shared search vocabulary without a new hierarchy. Preserved six speech-type, eight literary-device, 20 text tasks (34 total), choices/hints/explanations/references. Automatically compared arrays to HTML for exact equality. Answers now lock with correct answer/explanation; separate continuation/results/review/replay. Tabs retain state. All tasks passed touch checks at 1920×1080, 1366×768, 390×844, 960×540; no JS errors/overflow. Screenshots viewed, build passes.

## Migration entry: «Среда Али: покупки и рассказ»

Objective: understand a story/select its named shopping items. Provisional grades 1–4 by content; no source grade. RU, junior, routine / choice. Exactly preserved story, 12 products (six targets/six distractors), three-apple image, six questions/choices/answers. Text story plus optional listening. Whole basket checked, items added/removed by tap; lock afterward, separate correction action. Questions one point each with explicit continuation; added story-based explanations/results/replay. Shared SelectionBasket.vue/SpeechControls.vue. Checked all questions, errors/basket/mode switches/replay/speech failure at 1920×1080, 1366×768, 390×844, 960×540. Automatic source-data comparison; no JS errors/overflow. Rechecked touch at 1366×768/390×844 after extracting basket component. Screenshots viewed, build passes.

## Folder 03 extension: «Союзы и запятые: шесть тренировок»

Objective: conjunctions/relative words, subordination, commas in complex sentences/constructions. Source grade 9; RU, senior, syntax / choice. Version (1) entirely included in (2), so merged both with earlier tasks into one card. Preserved prior wording; added ten changed explanation/sentence variants and 36 tasks across three new modes: constructions, comma-position numbers, direct comma insertion. Banks total 94: 12 + 29 + 17 + 12 + 12 + 12, plus 13 question prompts. Retained prior sampling/scoring; new modes sample ten of 12. Shared CommaSentence.vue provides position buttons; lock after check and show missing/extra numbers, correct answer/explanation. Fixed source distractor generator's `(undefined)`: valid unique options now, educational answers unchanged. All six modes touch-tested at 1920×1080, 1366×768, 390×844, 960×540, covering wrong/right answers, locks, mode-state preservation, results/review/replay; compact labels checked separately. Rechecked previous «ССП, СПП и придаточные»/«Союз или союзное слово» at 1366×768/390×844 after shared-component changes. No JS errors/overflow; screenshots viewed; build passes.

## Willicat recording for «Среда Али»

Owner selected supplied ElevenLabs/Willicat MP3 (22.28 seconds, 373 KB) instead of browser story synthesis. File in src/games/ali-apples/assets, Vite import with Pages-subdirectory-compatible paths. SpeechControls.vue supports prerecorded button-only playback, stop, restart, end, textual load error. Stop when leaving story; transcript remains accessible. No extra speed adjustment. Verified actual touch playback without speechSynthesis at 1920×1080, 1366×768, 390×844, stop/end/replay/tab switch/MP3 load failure. Build passes. No API key in client code.

## Migration entry: «Односоставные предложения»

- Objective: five one-member sentence types, main-member features, contrast with similar two-member sentences. Grade 9 explicit in source title/header; audienceSource: source, senior, Russian UI/material, senior / syntax / choice / ru.
- Preserved three ten-question levels in source order, all sentences/answers/explanations, level-two choices, choice shuffling, complete reference. One point/correct answer; lock after first answer, show correct answer/explanation, explicit continuation. Retained error review, error-only retry including recurring errors, level restart, next level. No factual learning-data corrections.
- Reused choice/modes/reference and SurfacePanel, TouchButton, ChoiceGroup, FeedbackMessage, ProgressMeter; no new interaction. Deliberate UX changes: instruction/start per level; switches retain progress, selected answer, option order, result. Correct responses also display answer text.
- Data: src/games/one-member-sentences/data.js; view Game.vue; separate import(). Source HTML unchanged; no external assets; relative Vite base retained.
- October 8, 2026 checks: pnpm build; full automatic comparison of all 30 sentences/answers/explanations/choice sets to HTML; Microsoft Edge touch at 1920×1080, 1366×768, 390×844. All levels covered wrong/right answers, lock, explicit continuation, stateful level switches, reference, 9/10 result, review, retry with another error, successful retry/full restart. Checked catalog card discovery, no JS errors/overflow/clipped button labels; targets at least 48 px. No screenshots created/viewed. Ready for owner feedback.

## Migration entry: «БСП: смысл подсказывает знак»

October 9, 2026: migrated `trenazher_BSP.html` at owner request. Catalog now fifteen games.

- Objective: semantic relationships between conjunctionless complex-sentence clauses, punctuation, distinction from simple/coordinate/subordinate sentences. Provisional grades 9–11 from content/«Подготовка к ЕНТ» label; no explicit source grade. RU, senior, senior / syntax / choice / ru.
- Exactly preserved all 36 tasks: punctuation 12, semantic link 10, sentence type six, numbered positions eight. Automatically compared sentences/choices/answers/explanations/hints/meaning clarifications to HTML. All eight reference rows/explanations retained. No factual corrections; source unchanged.
- Learning shows correct answer/explanation after separate check. Source-style self-check hides correctness/scores/hints/reference until final full-answer review. One point for exact set match, no partial credit. Both modes lock after checking and require separate «Дальше».
- Preserved shuffle, block restart, accuracy percentage, error-only retry including repeated errors. UX improvement: independent choices/order/hint/progress/result for every block/mode across switches. Open directly into a task with short instructions, no extra start screen.
- Data src/games/bsp/data.js; Game.vue view; separate import(), relative base, no external assets. Shared ChoiceGroup.vue now supports arrays while preserving single choice. Multiple-number selection documented in UX.
- October 9, 2026 checks: pnpm build; exact automatic comparison of 36 source tasks/choice sets; all four blocks in learning/self-check touch-tested at 1920×1080, 1366×768, 390×844, 320×700. Covered errors/hints, multi-number selection/deselection, locks, explicit continuation, stateful switches, results/review, successful error retry, restart/shuffle. No JS errors/overflow/clipped labels; targets at least 48 px. Rechecked the previous 30 one-member-sentence tasks at three sizes after ChoiceGroup changes. No screenshots created/viewed. Ready for owner feedback.

