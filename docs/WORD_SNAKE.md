# Template: vocabulary word snake

The owner approved this format on October 8, 2026 using months and plans to reuse it for vocabulary. This standing preference is also recorded in AGENTS.md. Use it for word recognition and letter order. Searching a supplied word list alone does not establish knowledge of meaning or unaided recall.

## Reusable foundation

- `src/components/WordSnakeTrainer.vue`: complete flow—board, targets, assembled word, checking, feedback, continuation, result, replay.
- `src/components/LetterSnakeBoard.vue`: shared letter-button board.
- `src/games/word-snake.js`: board generator for arbitrary vocabulary.
- `src/games/year-months/SnakeMonths.vue`: months integration example.

New trainers define vocabulary in a separate data.js; do not copy the logic.

```js
// src/games/<slug>/data.js
export const vocabulary = [
  { id: 'birch', label: 'Берёза' },
  { id: 'pine', label: 'Сосна' },
  { id: 'oak', label: 'Дуб' },
]
```

```vue
<!-- src/games/<slug>/Game.vue -->
<script setup>
import WordSnakeTrainer from '../../components/WordSnakeTrainer.vue'
import { vocabulary } from './data.js'
</script>

<template>
  <WordSnakeTrainer :vocabulary="vocabulary"
    title="Найди названия деревьев"
    result-title="Все деревья найдены!" />
</template>
```

This is a starter for a standalone Vue module, not another registered catalog game. Register with lazy import(), establish the grade and recommendation source for each content set, and use `word-search` with a suitable subject facet.

## Parameters

| Parameter | Default | Purpose |
| --- | --- | --- |
| `vocabulary` | Required | Nonempty `{ id, label }` list with unique IDs and distinct words. |
| `wordsPerField` | 3 | Words per board; the last board may have fewer. |
| `showTargets` | true | Show target words. When false, only found words appear; errors do not reveal remaining answers. Months uses false. |
| `alphabet` | Russian alphabet including Ё, Й, Ъ, Ь | Filler letters. Pass the Kazakh alphabet for Kazakh vocabulary. |
| `title` | Найди слова змейкой | Task heading. |
| `resultTitle` | Все слова найдены! | Result heading. |
| `resultText` | Ты прочитал все слова по буквенным змейкам. | Result text. |
| `repeatLabel` | Повторить | Replay label. |

Words contain letters only, without spaces or hyphens. Comparison is case-insensitive; Ё and Е differ. Labels retain source spelling; board letters are uppercase. Long words are not truncated: extra rows are added. Reduce `wordsPerField` for long words to limit board height on the panel. One- and two-letter words work but cannot geometrically turn. Word letters need not belong to the filler alphabet; they are always placed exactly.

The generator preserves list grouping and shuffles words within each board. Paths are randomly distributed without intersections, with direction changes. Words of at least four letters contain a straight run of at least three cells, avoiding uniformly two-cell zigzags. Bounded search, retries, and guaranteed fallback placement keep every word accessible, including long words. Intersecting words are not part of this template.

## Required behavior

Taps select letters in order through edge-adjacent cells only. A cell cannot repeat within one word. Tapping the last selected letter undoes one step; «Сбросить слово» clears the path. Step numbers and the assembled word show reading order.

A blue thread joins current-path cell centers. After a correct check it remains green while the next word is selected. Undo/reset affect only the current path. Lines do not intercept taps; letters render above them. Coordinates update on resize and return to the level.

«Проверить» compares the word with the current targets; any valid path spelling a target is accepted. Already-found words earn no extra credit. After checking, lock the board until explicit continuation. Found cells remain available for another word so accidental alternative paths cannot block completion. After all words, provide a separate transition, then results and replay with regeneration.

`showTargets` controls the target list. Picture-only, translated clues, and definition-based prompts are potential extensions, not implemented features.

In multilevel games keep the component mounted with `v-show`, as in «Круглый год», to preserve selections/progress when switching. Vocabulary/settings apply to one attempt; change `:key` to replace them or fully restart.

## Verifying new content

When requested under AGENTS.md, cover word spelling, distinct Ё/Е and Kazakh letters, a partial final board, long words, errors, undo, duplicate-word rejection, locking, completion, and replay. Check 1920×1080, 1366×768, and a narrow screen; targets at least 48 px and no horizontal overflow. Screenshots and `pnpm build` also require an explicit owner request; an unsolicited check is not authorized by this checklist.
