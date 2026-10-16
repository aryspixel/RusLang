# RusLang trainer UX and visual system

Version 0.5. Based on legacy HTML in `ИГРЫ HTML` and subfolders 01, 02, 03. Target use: a teacher and pupils at a 75″ touch panel, usually landscape. Physical diagonal does not define CSS resolution: adapt to the actual browser viewport. See [themes](THEMES.md) for audiences/appearance and [navigation](NAVIGATION.md) for catalog behavior.

## Existing interaction types

| Interaction | Source examples | Shared behavior |
| --- | --- | --- |
| Single-choice cards | «Распорядок дня», grammar trainers | Large buttons; lock after answering, show correct choice/explanation, then «Дальше». |
| Multistep choice | «Союз или союзное слово?» | Clearly show step number/current question; check each step separately without prematurely hiding earlier explanations. |
| Ordering | «Собери неделю», part two of «Распорядок дня» | Finger/mouse dragging plus card-then-position taps. Outline the selected slot; allow undo/reordering. |
| Brief display and memory answer | «Поймай число» | Show rules/duration before starting; allow unhurried answering afterward; offer a nonflickering mode. |
| Tabs and modes | «Типы текста», extended conjunction trainer, subordination card | Keep mode names/selection visible; preserve each mode's state during accidental switches. |
| Hint, vocabulary, reference | «Типы текста», «Собери неделю» | Explicit touch-accessible expansion; do not obscure the task. |
| Free text and example | «Типы текста: осень» | Large field, clear prompt, separate example disclosure; no automatic grading without a verifiable criterion. |
| Diagram with switchable examples | «Подчинение придаточных» | Readable diagram with textual description, large tabs/labels; no precise tapping on thin lines. |
| Basket multiselection | «Среда Али» | Tap to add/remove; separately check the full set, then lock. Shared `SelectionBasket.vue`. |
| Selecting a season's months | «Круглый год: 12 месяцев» | Existing `SelectionBasket.vue` with neutral labels, maximum three months, textual image description, correct set/explanation after checking, explicit continuation. |
| Word-snake search | «Круглый год: 12 месяцев», level 3 | Shared `LetterSnakeBoard.vue`: edge-adjacent taps, no reused cell; last-letter tap undoes, separate reset. Numbers/assembled word show order. Lock after checking until continuation; found words have textual ✓. |
| Inserting commas | «Союзы и запятые» | Numbered gap buttons at least 48 px with `aria-pressed`; tap toggles comma, check separately. Shared `CommaSentence.vue`. |
| Listening with text equivalent | «Среда Али», «Моя комната» | Explicit playback; sound off by default. Story/tasks remain available as text; game completable without sound on missing voice/failure. Shared `SpeechControls.vue`; answer sounds optional. In «Моя комната», replay at any step, separate transcript disclosure, stop on part switch. |

## Common screen structure

### Object placement in a scene

«Обставь мою комнату» uses shared `RoomPlacementBoard.vue`: select an object, then a large destination button below the scene. Button numbers match image markers; neither precision tapping nor dragging is required. An expandable text list describes objects/positions. Separate checking fixes the answer, locks input, and shows the correct phrase/explanation. After explicit continuation the item occupies its correct place and remains. Free arrangement is ungraded, allows moving/removing items and finishing the room for an oral description. `ImageSprite.vue` renders a source-sheet rectangle via SVG viewBox without editing the file. Sentence construction uses card taps: add a word, tap it in the answer to remove, check separately.

After October 14 owner feedback, room objects use separate transparent PNGs, one item per file without neighboring fragments. `RoomPlacementBoard.vue` and cards use data's `image`; this game no longer uses sheet fragments via `ImageSprite.vue`. No background color blending, preserving clean outlines/source colors.

Since October 15, free-room objects depend on furniture: moving furniture moves books, lamps, and other dependent items. Slots on absent furniture are disabled with a hint to place the furniture first. Removing furniture also removes dependents; explain this beside removal. The rug renders below furniture; wall items stay on walls. There are 14 objects and 7, 7, and 18 tasks in the three practice parts.

1. Header: trainer title, topic/grade, «К каталогу» action.
2. One or two short instruction sentences before starting. In RU/KZ games, place corresponding language blocks together, Russian first and Kazakh visually secondary.
3. Task area: one main question, then content/answer controls; no competing primary actions.
4. Status: e.g. «Задание 3 из 10», optional score; progress also has text.
5. Stable feedback location below answers: «Верно»/«Неверно», correct answer, brief explanation. Errors get supportive, specific wording.
6. Final result and replay; preserve source error review if present.

## Dimensions and placement

- Baseline viewport: 1920×1080 CSS px; include 1366×768/narrow viewports in authorized checks. Learning column maximum about 1440 px to avoid overly long lines.
- Large-screen edge spacing: 24–32 px; touch targets separated by at least 12–16 px.
- Primary buttons: at least 56 px visible height; choice/sort cards: at least 64 px. Never below 48 px even on narrow screens. Targets must not depend on a small internal icon.
- Body text about 18–24 CSS px, task text 22–30 px, headings 30–46 px, utility labels 18–22 px. Moderate reduction at 1366×768 is acceptable while remaining readable from several meters.
- Wrap long grammar sentences. Do not shrink them to tiny single lines; allow vertical scrolling when needed.
- Do not lock the whole viewport with `overflow: hidden`; scrolling is better than clipped questions/answers. Keep the primary action visible or naturally immediately after the task.

## Color, typography, states

- Shared light base with age-related themes changing backgrounds/decorative accents, not layout, button sizes, or answer rules. Educational colors (e.g. weekdays) may be minor accents without changing button location/meaning.
- System sans-serif supporting Cyrillic and Kazakh characters; no required network font.
- States: normal, selected, correct, incorrect, unavailable, focus. Combine text/border/icon with color. Maintain panel-readable contrast.
- Short optional motion; respect `prefers-reduced-motion`. «Поймай число» needs a static alternative to flickering.
- Explicit audio start and visual equivalent. Stop speech, timers, and audio context on exit.

## Interaction rules

- Touch is primary; hover is decorative. All actions also support keyboard through `<button>`, `<textarea>`, and correct labels.
- Sorting needs a stepwise tap path; drag cannot be the sole input. Clearly mark selected cards; repeat tap deselects.
- Explanations appear beside tasks and are announced with `role="status"`/`aria-live` without unexpected page jumps. Do not reorder options after an answer.
- Users advance explicitly. Replay starts a fresh attempt and resets progress clearly. Accidentally closing a hint does not change the answer.
- Use timers only when intrinsic to the task; state duration in advance. Countdown must not demand precise taps on moving targets.
- Store RU/KZ wording in separate data fields, not HTML embedded in question strings.

## Shared project elements

In «Н и НН» and «НЕ с разными частями речи», pair comparison uses two existing ChoiceGroups with one separate check. Either choice is editable before checking; both lock afterward. Each example shows correct spelling and textual feedback. Award a pair point only when both answers are correct; continuation is explicit. «НЕ с разными частями речи» preserves each mode/block combination independently; blocks use a dropdown with the current block in its heading. Proof steps identify part of speech first, spelling second, so the spelling rule is not revealed before the second response.

Word snake is an approved reusable vocabulary format. [WORD_SNAKE.md](WORD_SNAKE.md) describes the starter, parameters, and extensions. `WordSnakeTrainer.vue` accepts vocabulary and manages the full flow; `LetterSnakeBoard.vue` handles taps; `src/games/word-snake.js` generates boards. Reuse them rather than copying month-level logic.

`src/styles/tokens.css`: shared sizes/spacing/states; `src/styles/themes.css`: appearance; `src/styles/base.css`: typography/base elements. `src/components/`: panel, large button, choice, progress, feedback. Introduce components for repeated behavior, not merely visual resemblance.

For year construction, `SequenceBoard.vue` supports a secondary Kazakh label, configurable group labels, and column counts; previous weekday defaults remain. `SelectionBasket.vue` supports set/basket labels and an optional selection limit; without options it retains Ali's shopping behavior.

## Pre-release verification

Only when explicitly requested under AGENTS.md: walk through the complete game at 1920×1080 and 1366×768, including error, hint, replay, and mode switches. Cover touch emulation, operation without hover, visible focus, unclipped text, RU/KZ wording, and reduced motion. Run sorting entirely by taps as a separate path.

## Android panel notes

Owner feedback found earlier sizes required 50% browser zoom. Base sizes/spacing now target 100%; wide viewports below 800 px height use compact headers/panels. Physical diagonal differs from CSS resolution: use actual viewport dimensions; retain targets at least 48 px. Expand references/vocabulary separately; keep the main screen to a short instruction/task. Ordering uses Pointer Events for Android finger dragging; ordinary HTML drag is insufficient. Card-then-slot taps remain an accessible alternative.

## Multiple-number selection and self-check

«БСП: смысл подсказывает знак» uses shared ChoiceGroup.vue with a selected-value array: tap a number to select/deselect; aria-pressed exposes each state. Check the full set separately; credit requires an exact match. Lock until explicit continuation.

Delayed review may preserve the original self-check mode: show «Ответ принят» after answering, revealing correctness/explanations only in results. Hide hints/reference/current scores until then. Clearly label the mode and retain explicit continuation after every task. Default learning mode shows the correct answer/explanation immediately. Preserve each block/mode independently during switches.
