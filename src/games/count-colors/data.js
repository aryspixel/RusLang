export const colors = [
  { id: 'red', name: 'красный', hex: '#d83b36' },
  { id: 'blue', name: 'синий', hex: '#2268c9' },
  { id: 'green', name: 'зелёный', hex: '#23864b' },
  { id: 'yellow', name: 'жёлтый', hex: '#e4ad16' },
]

export const numberWords = [
  'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять',
  'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать', 'двадцать',
]

export const tasks = Array.from({ length: 20 }, (_, index) => {
  const count = index + 1
  const color = colors[index % colors.length].id
  return count % 5 === 0
    ? [{ count, color, ask: 'count' }, { count, color, ask: 'color' }]
    : [{ count, color, ask: 'count' }]
}).flat()
