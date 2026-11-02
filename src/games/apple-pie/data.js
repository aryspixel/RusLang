export const products = [
  { id: 'apples', label: 'яблоки', emoji: '🍎', amount: '3 шт.', correct: true },
  { id: 'eggs', label: 'яйца', emoji: '🥚', amount: '2 шт.', correct: true },
  { id: 'sugar', label: 'сахар', emoji: '🥣', amount: '150 г', correct: true },
  { id: 'flour', label: 'мука', emoji: '🌾', amount: '150 г', correct: true },
  { id: 'milk', label: 'молоко', emoji: '🥛', amount: '100 мл', correct: true },
  { id: 'butter', label: 'масло', emoji: '🧈', amount: '50 г', correct: true },
  { id: 'baking-powder', label: 'разрыхлитель', emoji: '🧂', amount: '1 ч. л.', correct: true },
  ...[['cheese','сыр','🧀'],['sausage','колбаса','🌭'],['cucumbers','огурцы','🥒'],['pasta','макароны','🍝'],['potatoes','картофель','🥔'],['ketchup','кетчуп','🍅']].map(([id,label,emoji])=>({id,label,emoji,correct:false})),
]

export const amounts = [
  { product: 'яблоки', correct: '3 шт.', options: ['3 шт.','5 шт.'] },
  { product: 'яйца', correct: '2 шт.', options: ['2 шт.','4 шт.'] },
  { product: 'сахар', correct: '150 г', options: ['150 г','300 г'] },
  { product: 'мука', correct: '150 г', options: ['150 г','300 г'] },
]

export const recipe = ['Помыть и нарезать яблоки','Разбить яйца и добавить сахар','Добавить молоко и масло','Добавить муку и разрыхлитель','Положить яблоки в форму и залить тестом','Поставить пирог в духовку','Достать готовый пирог']
export const verbs = [
  { prompt:'Мы ___ яблоки.', correct:'моем', options:['моем','моет'] },
  { prompt:'Бабушка ___ тесто.', correct:'готовит', options:['готовит','готовят'] },
  { prompt:'Бабушка и Сая ___ молоко.', correct:'добавляют', options:['добавляют','добавляет'] },
  { prompt:'Они ___ пирог в духовку.', correct:'ставят', options:['ставят','ставит'] },
]
export const sentences = [
  { parts:['Сая','моет','яблоки','на кухне'], roles:{who:'Сая', action:'моет', where:'на кухне'} },
  { parts:['Бабушка','покупает','продукты','в магазине'], roles:{who:'Бабушка', action:'покупает', where:'в магазине'} },
  { parts:['Семья','пьёт','чай','за столом'], roles:{who:'Семья', action:'пьёт', where:'за столом'} },
]
export const prepositions = [
  { prompt:'Пирог стоит ___ духовке.', correct:'в' },
  { prompt:'Яблоки лежат ___ столе.', correct:'на' },
  { prompt:'Кот сидит ___ столом.', correct:'под' },
  { prompt:'Бабушка стоит ___ духовки.', correct:'около' },
]
export const storySentences = [
  ['Сначала','Сая','моет','яблоки','на кухне'],
  ['Потом','бабушка','готовит','тесто','на кухне'],
  ['После этого','они','ставят','пирог','в духовку'],
]
