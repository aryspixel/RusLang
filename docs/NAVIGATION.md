# Catalog navigation

Since the owner's October 10, 2026 decision, home shows three sections in this order: **Развитие речи → ЕНТ → Начальный уровень**. Search and filters were removed. Tapping a card opens that section; a separate link returns to all sections. Games return to their section; the RusLang logo returns home.

## Sections and assignment

Every `src/games/registry.js` entry has exactly one `category`. Section definitions live in `src/catalog/categories.js`. Only `ready` games appear; counters use the same set. Games are not duplicated across sections.

| Section | ID | Trainers |
| --- | --- | --- |
| Развитие речи | speech | Типы текста: осень; Типы речи и художественные средства |
| ЕНТ | ent | Односоставные предложения; ССП, СПП и придаточные; Союз или союзное слово; Союзы и запятые: шесть тренировок; Как подчиняются придаточные; БСП: смысл подсказывает знак; Н и НН в частях речи; НЕ с разными частями речи; Средства выразительности; Литература: подготовка к ЕНТ |
| Начальный уровень | primary | Круглый год: 12 месяцев; Собери неделю; Распорядок дня; Поймай число; Среда Али: покупки и рассказ; Моя комната |

The main learning objective determines placement: text/expressiveness → «Развитие речи»; syntax/punctuation/spelling → «ЕНТ»; basic vocabulary/calendar/numbers/everyday situations → «Начальный уровень». ENT groups relevant topics; placement does not mean every trainer reproduces the exam format. Recommended grade remains separate metadata.

«Средства выразительности» belongs to «ЕНТ» by the owner's explicit October 16, 2026 instruction.

«Литература: подготовка к ЕНТ» belongs to «ЕНТ» by the owner's explicit October 19, 2026 instruction. Controlled topic `literature` covers works, authors, characters, and literary details.

## Cards and transitions

«Перепутанный дом Али» belongs directly to `primary`, by the owner's October 21, 2026 publication request. Its objective is household vocabulary and room choice; optional question playback does not make it a listening lesson. Provisional grades 1–4; controlled topic `place-prepositions`, format `choice`.

«Падежи: первые шаги» belongs directly to `primary`, following the owner's October 20, 2026 choice of beginner practice. It covers case questions and noun cases in simple sentences. The controlled topic is `noun-cases`; the provisional grade recommendation is 3–4. It has no listening subsection.


«Обставь мою комнату» sits directly in `primary`, continuing «Моя комната». Its main activities are object placement and sentence construction, without required audio, so it has no `listening` subsection. Its controlled format is `placement`.

«Начальный уровень» contains **«Аудирование»** (`listening`) with «Среда Али: покупки и рассказ» and «Моя комната»; the other four trainers appear directly in the category. The subsection card opens `#/category/primary/listening`. Games return to «Аудирование», which returns to «Начальный уровень». Category counts include games inside subsections.

Define subsections in `src/catalog/categories.js`; a game may have `subcategory` alongside its main `category`. New beginner listening trainers use `category: 'primary'`, `subcategory: 'listening'`. Do not also list them directly in the category. Subsection contents/counts derive from ready games; hide empty subsections.

Home has three fully clickable cards with title, short description, and trainer count, arranged in a row on wide screens and a column on narrow screens. Trainer cards show the title, interaction format, and a large «Начать» link.

Section route: `#/category/<id>`; existing `#/game/<id>` links remain. Browser Back/Forward, reload, and direct section links work. Move focus to main content on navigation. Unknown sections/games show a message and return link.

## Metadata and loading

Controlled `facets` (grade, learning topic, format, language) and `src/catalog/filtering.js` remain as educational metadata. They are not home-page filters or tag lists. Grade and appearance are independent; audience-recommendation sources are documented in `docs/THEMES.md`.

Assign one section by the main objective and retain suitable facets. Shared topics include `literary-devices`, `months-seasons`, `place-prepositions`, and `orthography`; `word-search` covers word search, including word snakes.

Load games lazily with `import()` on opening. Home and section pages do not load game modules. Paths and hash navigation support a GitHub Pages subdirectory.

