export const russianAlphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'

function mixed(values, random) {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function varied(path) {
  if (path.length < 3) return true
  const steps = path.slice(1).map((cell, index) => cell - path[index])
  const turns = new Set(steps).size > 1
  // Longer words include a straight run of at least three cells as well as a turn.
  return turns && (path.length === 3 || steps.some((step, index) => index && step === steps[index - 1]))
}

function findRoute(length, cells, blocked, random) {
  let budget = 8000
  const visited = new Set(blocked)
  function walk(path) {
    if (--budget < 0) return null
    if (path.length === length) return varied(path) ? [...path] : null
    const last = path.at(-1)
    const neighbors = [last - 4, last + 4, ...(last % 4 ? [last - 1] : []), ...(last % 4 < 3 ? [last + 1] : [])]
    for (const cell of mixed(neighbors.filter(cell => cell >= 0 && cell < cells && !visited.has(cell)), random)) {
      visited.add(cell); path.push(cell)
      const result = walk(path)
      if (result) return result
      path.pop(); visited.delete(cell)
    }
    return null
  }
  for (const cell of mixed(Array.from({ length: cells }, (_, index) => index).filter(cell => !blocked.has(cell)), random)) {
    visited.add(cell)
    const result = walk([cell])
    if (result) return result
    visited.delete(cell)
    if (budget < 0) break
  }
  return null
}

function placeWords(entries, random) {
  const length = entry => [...entry.text].length
  const rows = Math.max(6, Math.ceil((entries.reduce((total, entry) => total + length(entry), 0) + entries.length) / 4))
  // Place long words first, retrying the whole layout if shorter words get trapped.
  for (let attempt = 0; attempt < 30; attempt++) {
    const blocked = new Set(), routes = new Map()
    for (const entry of [...entries].sort((a, b) => length(b) - length(a))) {
      const path = findRoute(length(entry), rows * 4, blocked, random)
      if (!path) break
      routes.set(entry.id, path); path.forEach(cell => blocked.add(cell))
    }
    if (routes.size === entries.length) return { cells: rows * 4, words: entries.map(entry => ({ ...entry, path: routes.get(entry.id) })) }
  }
  // Bounded fallback guarantees a solvable field for unusually crowded vocabularies.
  let rowOffset = 0
  const words = entries.map(entry => {
    const size = length(entry), bandRows = Math.max(2, Math.ceil(size / 4))
    const route = Array.from({ length: bandRows * 4 }, (_, i) => Math.floor(i / 4) * 4 + (Math.floor(i / 4) % 2 ? 3 - i % 4 : i % 4))
    if (size === 3) route.splice(0, 3, 0, 1, 5)
    if (size === 4) route.splice(0, 4, 0, 1, 2, 6)
    const mirror = random() < .5, flip = random() < .5
    const path = route.slice(0, size).map(cell => (rowOffset + (flip ? bandRows - 1 - Math.floor(cell / 4) : Math.floor(cell / 4))) * 4 + (mirror ? 3 - cell % 4 : cell % 4))
    rowOffset += bandRows
    return { ...entry, path }
  })
  return { cells: rowOffset * 4, words }
}

// Routes use the whole field, with variable straight runs and turns.
// Four columns keep touch targets large on narrow screens; long words add rows.
export function createWordSnakeFields(vocabulary, { wordsPerField = 3, alphabet = russianAlphabet, shuffle, random = Math.random } = {}) {
  if (!Array.isArray(vocabulary) || !vocabulary.length) throw new Error('Для змейки нужен непустой список слов.')
  if (!Number.isInteger(wordsPerField) || wordsPerField < 1) throw new Error('Число слов на поле должно быть положительным целым.')
  const lettersForFill = [...alphabet.normalize('NFC').toLocaleUpperCase('ru')]
  if (!lettersForFill.length || lettersForFill.some(letter => !/^\p{L}$/u.test(letter))) throw new Error('Алфавит должен содержать только буквы.')
  const ids = new Set(), spellings = new Set()
  const entries = vocabulary.map(entry => {
    const label = entry.label?.trim().normalize('NFC'), text = label?.toLocaleUpperCase('ru')
    if (entry.id == null || ids.has(entry.id)) throw new Error('У слов должны быть уникальные id.')
    if (!text || !/^\p{L}+$/u.test(text) || spellings.has(text)) throw new Error('Нужны разные слова без пробелов и знаков препинания.')
    ids.add(entry.id); spellings.add(text)
    return { id: entry.id, label, text }
  })
  const mix = shuffle || (values => mixed(values, random))
  const fields = []
  for (let offset = 0; offset < entries.length; offset += wordsPerField) {
    const { cells, words } = placeWords(mix(entries.slice(offset, offset + wordsPerField)), random)
    const letters = Array.from({ length: cells }, () => lettersForFill[Math.floor(random() * lettersForFill.length)])
    for (const word of words) [...word.text].forEach((letter, index) => { letters[word.path[index]] = letter })
    fields.push({ columns: 4, letters, words })
  }
  return fields
}
