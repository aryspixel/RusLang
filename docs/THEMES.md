# Audience and visual themes

Version 0.2. Recommended grade and visual theme are separate properties. Grade identifies suitable learning material; theme changes appearance. Themes are assigned automatically and do not restrict access.

## Audience

Each `src/games/registry.js` entry has `gradeMin`, `gradeMax`, and `audienceSource`:

- `source`: the source file or approved task description explicitly names the grade;
- `provisional`: an initial editorial estimate based on content, to confirm during migration;
- `unknown`: insufficient information; do not guess the grade.

Sources explicitly assign grade 9 to «Типы текста: осень», «ССП или СПП?» and both «Союз или союзное слово?» versions. Weekday, Ali's day, and numbers 1–20 games have provisional grades 1–4. The exported «Как подчиняются придаточные» card has no established grade. During migration, confirm curriculum fit and wording with the owner, then update metadata.

Grade is a teaching recommendation, not an access restriction. Do not hide games because the selected age range or theme differs. The catalog has «Развитие речи», «ЕНТ», «Начальный уровень», and «Средний уровень» without search or filters; grade remains separate card metadata.

## Themes

| Theme | Automatic assignment | Appearance |
| --- | --- | --- |
| `neutral` | Unknown grade and general catalog | Calm, light base. |
| `junior` | Provisional grades 1–4 | Warmer backgrounds, soft accents; no busy illustrations behind text. |
| `middle` | Future grades 5–8 tasks | Restrained turquoise accents. |
| `senior` | Grades 9–11 tasks | Restrained blue-gray accents, emphasizing text and diagrams. |

The catalog uses the neutral theme. A game automatically uses its `defaultTheme`. The owner removed the theme switcher from the header; themes do not change exercises, answers, scoring, or grade recommendations.

## Allowed changes

- Page/header backgrounds, accent color, borders, decorations, and selected-option tint.
- Future small local background illustrations, provided they do not impair reading or cover controls.
- Small topic/card accents that retain the common layout.

Do not change action order, primary-control positions, touch-target sizes, wording, icon meaning, or correctness colors without accessibility verification. Success, error, and focus states use shared tokens. Never use color alone to indicate correct answers in junior themes.

## Implementation

`src/styles/tokens.css` holds shared dimensions, spacing, and semantic states. `src/styles/themes.css` defines decorative tokens for `.theme-neutral`, `.theme-junior`, `.theme-middle`, and `.theme-senior`. Components use variables, not theme names. New games specify recommended grade and `defaultTheme` in the registry; appearance is automatic. Use separate local illustrations, with contrast/readability checks at 1920×1080 and 1366×768 when verification is authorized.

Before theme release, verification should cover a long question, four choices, hint, error, result, and RU/KZ screen, including reduced motion. If a background interferes, simplify it instead of shrinking text. Run these checks only when explicitly requested, as required by `AGENTS.md`.
