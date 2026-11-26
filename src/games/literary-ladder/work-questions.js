import original from './data.json'
import passports from './work-passports.json'

const fields = [
  ['genre', 'К какому жанру относится произведение «{title}»?'],
  ['hero', 'Какой герой или образ связан с произведением «{title}»?'],
  ['plot', 'Какое событие происходит в произведении «{title}»?'],
  ['theme', 'Какая тема раскрывается в произведении «{title}»?'],
]

const allPassports = Object.entries(passports).flatMap(([author, works]) => works.map(work => ({ ...work, author })))

function choicesFor(work, field, offset) {
  const others = [
    ...allPassports.filter(item => item.author === work.author && item.title !== work.title),
    ...allPassports.filter(item => item.author !== work.author),
  ]
  const unique = [...new Set(others.map(item => item[field]))].filter(value => value !== work[field])
  const distractors = unique.slice(offset % Math.max(1, unique.length))
    .concat(unique.slice(0, offset % Math.max(1, unique.length)))
    .slice(0, 3)
  const options = [work[field], ...distractors]
  const shift = offset % options.length
  return [...options.slice(shift), ...options.slice(0, shift)]
}

export const workQuestions = Object.fromEntries(Object.entries(original.data).map(([author, works]) => [
  author,
  works.map((entry, index) => {
    const [title, prompt, options, correct, explanation, level] = entry
    const work = { ...passports[author][index], author }
    return [
      { title, prompt, options, correct, explanation, level },
      ...fields.map(([field, template], fieldIndex) => {
        const answer = work[field]
        const choices = choicesFor(work, field, index + fieldIndex + Object.keys(passports).indexOf(author))
        return {
          title,
          prompt: template.replace('{title}', title),
          options: choices,
          correct: choices.indexOf(answer),
          explanation: `Верный ответ: ${answer}`,
          level: field === 'genre' ? 1 : field === 'hero' ? 2 : 3,
        }
      }),
    ]
  }),
]))
