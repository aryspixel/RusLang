// Один раздел на тренажёр. Порядок разделов согласован владельцем.
export const categories = [
  { id: 'speech', title: 'Развитие речи', description: 'Тексты, образы и выразительная речь', caption: 'Учимся выражать мысли', icon: 'M5 5h22v15H15l-7 7v-7H5z M10 10h12 M10 15h8' },
  { id: 'ent', title: 'ЕНТ', description: 'Синтаксис, предложения и пунктуация', caption: 'Разбираемся в правилах', icon: 'M9 5h16v23H7V5h2 M12 3h8v5h-8z M11 15l2 2 4-4 M11 23h10' },
  { id: 'primary', title: 'Начальный уровень', description: 'Дни недели, месяцы, числа и истории', caption: 'Открываем русский язык', icon: 'M16 8C12 5 7 5 3 7v20c4-2 9-2 13 1 4-3 9-3 13-1V7c-4-2-9-2-13 1z M16 8v20 M7 12h5 M7 17h5 M20 12h5 M20 17h5' },
]

export const subcategories = [
  { id: 'listening', category: 'primary', title: 'Аудирование', description: 'Слушаем рассказы и выполняем задания' },
]

export function trainerCount(count) {
  const last = count % 10
  const lastTwo = count % 100
  const word = lastTwo >= 11 && lastTwo <= 14 ? 'тренажёров' : last === 1 ? 'тренажёр' : last >= 2 && last <= 4 ? 'тренажёра' : 'тренажёров'
  return `${count} ${word}`
}
