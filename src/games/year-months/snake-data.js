import { createWordSnakeFields } from '../word-snake.js'

// Compatibility adapter for the original month-field checks.
export function createSnakeFields(months, shuffle) {
  return createWordSnakeFields(months.map(month => ({ id: month.id, label: month.ru })), { shuffle })
}