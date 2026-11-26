import source from './data.json'

// Several titles occur in more than one author's bibliography, or are too broad
// to identify a single writer without extra context.
const ambiguousTitles = new Set(['Лирика', 'Русалка', 'Кавказский пленник'])
const distractors = {
  'А. С. Пушкин': ['М. Ю. Лермонтов', 'Н. В. Гоголь', 'И. С. Тургенев'],
  'М. Ю. Лермонтов': ['А. С. Пушкин', 'И. С. Тургенев', 'Н. В. Гоголь'],
  'Н. В. Гоголь': ['А. П. Чехов', 'М. М. Зощенко', 'Ф. М. Достоевский'],
  'И. С. Тургенев': ['Л. Н. Толстой', 'А. П. Чехов', 'А. И. Куприн'],
  'Л. Н. Толстой': ['И. С. Тургенев', 'Ф. М. Достоевский', 'А. П. Чехов'],
  'А. П. Чехов': ['Н. В. Гоголь', 'М. М. Зощенко', 'И. С. Тургенев'],
  'Ф. М. Достоевский': ['Л. Н. Толстой', 'И. С. Тургенев', 'Н. В. Гоголь'],
  'А. И. Куприн': ['А. П. Чехов', 'И. С. Тургенев', 'Л. Н. Толстой'],
  'С. А. Есенин': ['А. А. Ахматова', 'А. С. Пушкин', 'М. Ю. Лермонтов'],
  'А. А. Ахматова': ['С. А. Есенин', 'А. С. Пушкин', 'М. Ю. Лермонтов'],
  'М. М. Зощенко': ['А. П. Чехов', 'Н. В. Гоголь', 'А. И. Куприн'],
  'Ч. Айтматов': ['Л. Н. Толстой', 'И. С. Тургенев', 'А. И. Куприн'],
}

export const authorQuestions = Object.entries(source.data).flatMap(([author, works]) =>
  works.filter(([title]) => !ambiguousTitles.has(title)).map(([title], index) => {
    const options = [author, ...distractors[author]]
    const shift = (index + Object.keys(source.data).indexOf(author)) % options.length
    return {
      id: `${author}|${title}`,
      title,
      author,
      options: [...options.slice(shift), ...options.slice(0, shift)],
      explanation: `Автор произведения «${title}» — ${author}.`,
    }
  }),
)
