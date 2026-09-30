// Контролируемый словарь тегов: один id имеет одну подпись во всём каталоге.
export const filterGroups = [
  { key: 'grade', title: 'Класс', options: [
    { id: 'primary', label: '1–4' },
    { id: 'middle', label: '5–8' },
    { id: 'senior', label: '9–11' },
    { id: 'unknown', label: 'Уточняется' },
  ] },
  { key: 'topic', title: 'Тема', options: [
    { id: 'weekdays', label: 'Дни недели' },
    { id: 'routine', label: 'Распорядок дня' },
    { id: 'numbers', label: 'Числа' },
    { id: 'text-types', label: 'Типы текста' },
    { id: 'literary-devices', label: 'Художественные средства' },
    { id: 'syntax', label: 'Синтаксис' },
  ] },
  { key: 'format', title: 'Формат', options: [
    { id: 'choice', label: 'Выбор ответа' },
    { id: 'sequence', label: 'Собрать порядок' },
    { id: 'memory', label: 'На память' },
    { id: 'writing', label: 'Написать текст' },
    { id: 'diagram', label: 'Схемы' },
  ] },
  { key: 'language', title: 'Язык', options: [
    { id: 'ru', label: 'Русский' },
    { id: 'ru-kz', label: 'Русский + казахский' },
  ] },
]

export function matchesFilters(game, filters, query = '') {
  const text = query.trim().toLocaleLowerCase('ru')
  if (text && !`${game.title} ${game.topic} ${game.interaction}`.toLocaleLowerCase('ru').includes(text)) return false
  return filterGroups.every(({ key }) => {
    const selected = filters[key] || []
    return selected.length === 0 || selected.some(id => game.facets[key].includes(id))
  })
}
