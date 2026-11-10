export const colors = [
  { id: 'red', name: 'красный', swatch: '#d94747' },
  { id: 'blue', name: 'синий', swatch: '#2567c8' },
  { id: 'yellow', name: 'жёлтый', swatch: '#f4ca3c' },
  { id: 'green', name: 'зелёный', swatch: '#31945a' },
  { id: 'white', name: 'белый', swatch: '#ffffff' },
  { id: 'black', name: 'чёрный', swatch: '#242933' },
]

export const tasks = [
  { stage: 1, color: 'red', prompt: 'Найди красный цвет.', explanation: 'Это красный цвет.' },
  { stage: 1, color: 'blue', prompt: 'Найди синий цвет.', explanation: 'Это синий цвет.' },
  { stage: 1, color: 'yellow', prompt: 'Найди жёлтый цвет.', explanation: 'Это жёлтый цвет.' },
  { stage: 1, color: 'green', prompt: 'Найди зелёный цвет.', explanation: 'Это зелёный цвет.' },
  { stage: 1, color: 'white', prompt: 'Найди белый цвет.', explanation: 'Это белый цвет.' },
  { stage: 1, color: 'black', prompt: 'Найди чёрный цвет.', explanation: 'Это чёрный цвет.' },
  { stage: 2, color: 'red', noun: 'мяч', gender: 'm', prompt: 'Какой мяч?', explanation: 'Мяч — он, поэтому говорим «красный мяч».' },
  { stage: 2, color: 'blue', noun: 'книга', gender: 'f', prompt: 'Какая книга?', explanation: 'Книга — она, поэтому говорим «синяя книга».' },
  { stage: 2, color: 'yellow', noun: 'яблоко', gender: 'n', prompt: 'Какое яблоко?', explanation: 'Яблоко — оно, поэтому говорим «жёлтое яблоко».' },
  { stage: 2, color: 'green', noun: 'лист', gender: 'm', prompt: 'Какой лист?', explanation: 'Лист — он, поэтому говорим «зелёный лист».' },
  { stage: 2, color: 'white', noun: 'чашка', gender: 'f', prompt: 'Какая чашка?', explanation: 'Чашка — она, поэтому говорим «белая чашка».' },
  { stage: 2, color: 'black', noun: 'перо', gender: 'n', prompt: 'Какое перо?', explanation: 'Перо — оно, поэтому говорим «чёрное перо».' },
  { stage: 3, color: 'red', noun: 'книга', gender: 'f', prompt: 'Собери словосочетание.', explanation: 'Книга — она: красная книга.' },
  { stage: 3, color: 'blue', noun: 'мяч', gender: 'm', prompt: 'Собери словосочетание.', explanation: 'Мяч — он: синий мяч.' },
  { stage: 3, color: 'yellow', noun: 'перо', gender: 'n', prompt: 'Собери словосочетание.', explanation: 'Перо — оно: жёлтое перо.' },
  { stage: 3, color: 'green', noun: 'яблоко', gender: 'n', prompt: 'Собери словосочетание.', explanation: 'Яблоко — оно: зелёное яблоко.' },
  { stage: 3, color: 'white', noun: 'лист', gender: 'm', prompt: 'Собери словосочетание.', explanation: 'Лист — он: белый лист.' },
  { stage: 3, color: 'black', noun: 'чашка', gender: 'f', prompt: 'Собери словосочетание.', explanation: 'Чашка — она: чёрная чашка.' },
]

export const forms = {
  red: { m: 'красный', f: 'красная', n: 'красное' },
  blue: { m: 'синий', f: 'синяя', n: 'синее' },
  yellow: { m: 'жёлтый', f: 'жёлтая', n: 'жёлтое' },
  green: { m: 'зелёный', f: 'зелёная', n: 'зелёное' },
  white: { m: 'белый', f: 'белая', n: 'белое' },
  black: { m: 'чёрный', f: 'чёрная', n: 'чёрное' },
}
