import bedImage from './assets/items/bed-room-v2.webp'
import tableImage from './assets/items/table-room-v2.webp'
import wardrobeImage from './assets/items/wardrobe-room-v2.webp'
import chairImage from './assets/items/chair-room-v2.webp'
import boxImage from './assets/items/box.webp'
import bookImage from './assets/items/book.webp'
import ballImage from './assets/items/ball.webp'
import catImage from './assets/items/cat.webp'
import bearImage from './assets/items/bear.webp'
import lampImage from './assets/items/lamp.webp'
import rugImage from './assets/items/rug.webp'
import shelfImage from './assets/items/shelf.webp'
import plantImage from './assets/items/plant.webp'
import clockImage from './assets/items/clock.webp'

// x/y — центр по горизонтали и нижний край изображения, в процентах комнаты.
// parent связывает положение вещи с мебелью, на которой она находится.
const place = (id, label, x, y, width, description, layer = 2, parent = null) => ({ id, label, x, y, width, description, layer, parent })
export const objects = [
  { id: 'bed', label: 'Кровать', image: bedImage, places: [
    place('window', 'Около окна', 23, 94, 32, 'Кровать стоит около окна.', 3),
    place('middle', 'Посреди комнаты', 49, 98, 32, 'Кровать стоит посреди комнаты.', 3),
    place('door', 'Около двери', 76, 96, 31, 'Кровать стоит около двери.', 3),
  ] },
  { id: 'table', label: 'Стол', image: tableImage, places: [
    place('wall', 'У дальней стены', 48, 80, 27, 'Стол стоит у дальней стены.', 4),
    place('window', 'Около окна', 22, 86, 28, 'Стол стоит около окна.', 4),
    place('middle', 'Посреди комнаты', 52, 97, 30, 'Стол стоит посреди комнаты.', 4),
  ] },
  { id: 'wardrobe', label: 'Шкаф', image: wardrobeImage, places: [
    place('door', 'Около двери', 73, 79, 22, 'Шкаф стоит около двери.'),
    place('window', 'Около окна', 24, 86, 22, 'Шкаф стоит около окна.'),
    place('middle', 'Посреди комнаты', 52, 97, 24, 'Шкаф стоит посреди комнаты.', 4),
  ] },
  { id: 'chair', label: 'Стул', image: chairImage, places: [
    place('table', 'Рядом со столом', 56, 89, 10, 'Стул стоит рядом со столом.', 5, 'table'),
    place('door', 'Около двери', 87, 94, 11, 'Стул стоит около двери.', 5),
    place('bed', 'Около кровати', 38, 95, 11, 'Стул стоит около кровати.', 5, 'bed'),
  ] },
  { id: 'box', label: 'Коробка', image: boxImage, places: [
    place('wardrobe', 'Около шкафа', 82, 95, 13, 'Коробка стоит около шкафа.', 6, 'wardrobe'),
    place('table', 'Под столом', 43, 79, 10, 'Коробка стоит под столом.', 3, 'table'),
    place('bed', 'Около кровати', 39, 97, 15, 'Коробка стоит около кровати.', 6, 'bed'),
  ] },
  { id: 'shelf', label: 'Полка', image: shelfImage, places: [
    place('wall', 'На дальней стене', 45, 33, 20, 'Полка висит на дальней стене.'),
    place('table', 'Над столом', 48, 43, 20, 'Полка висит над столом.', 2, 'table'),
    place('wardrobe', 'Над шкафом', 73, 12, 18, 'Полка висит над шкафом.', 2, 'wardrobe'),
  ] },
  { id: 'rug', label: 'Ковёр', image: rugImage, places: [
    place('middle', 'Посреди комнаты', 53, 98, 32, 'Ковёр лежит посреди комнаты.', 0),
    place('bed', 'Около кровати', 29, 99, 29, 'Ковёр лежит около кровати.', 0, 'bed'),
    place('door', 'Около двери', 79, 98, 24, 'Ковёр лежит около двери.', 0),
  ] },
  { id: 'book', label: 'Книга', image: bookImage, places: [
    place('table', 'На столе', 44, 56, 7, 'Книга лежит на столе.', 7, 'table'),
    place('bed', 'На кровати', 21, 79, 7, 'Книга лежит на кровати.', 7, 'bed'),
    place('shelf', 'На полке', 49, 28, 6, 'Книга лежит на полке.', 7, 'shelf'),
  ] },
  { id: 'ball', label: 'Мяч', image: ballImage, places: [
    place('table', 'Под столом', 43, 78, 7, 'Мяч лежит под столом.', 3, 'table'),
    place('bed', 'На кровати', 21, 80, 7, 'Мяч лежит на кровати.', 7, 'bed'),
    place('chair', 'Около стула', 63, 92, 7, 'Мяч лежит около стула.', 7, 'chair'),
  ] },
  { id: 'cat', label: 'Кот', image: catImage, places: [
    place('box', 'В коробке', 82, 89, 8, 'Кот сидит в коробке.', 7, 'box'),
    place('bed', 'На кровати', 20, 79, 8, 'Кот сидит на кровати.', 7, 'bed'),
    place('table', 'Под столом', 44, 79, 8, 'Кот сидит под столом.', 3, 'table'),
  ] },
  { id: 'bear', label: 'Медведь', image: bearImage, places: [
    place('bed', 'На кровати', 23, 79, 9, 'Медведь сидит на кровати.', 7, 'bed'),
    place('table', 'На столе', 49, 57, 8, 'Медведь сидит на столе.', 7, 'table'),
    place('chair', 'Около стула', 63, 93, 9, 'Медведь сидит около стула.', 7, 'chair'),
  ] },
  { id: 'lamp', label: 'Лампа', image: lampImage, places: [
    place('table', 'На столе', 54, 57, 6, 'Лампа стоит на столе.', 7, 'table'),
    place('bed', 'Около кровати', 38, 93, 7, 'Лампа стоит около кровати.', 7, 'bed'),
    place('shelf', 'На полке', 51, 28, 5, 'Лампа стоит на полке.', 7, 'shelf'),
  ] },
  { id: 'plant', label: 'Цветок', image: plantImage, places: [
    place('shelf', 'На полке', 42, 28, 6, 'Цветок стоит на полке.', 7, 'shelf'),
    place('table', 'На столе', 49, 57, 6, 'Цветок стоит на столе.', 7, 'table'),
    place('window', 'Около окна', 12, 84, 8, 'Цветок стоит около окна.', 6),
  ] },
  { id: 'clock', label: 'Часы', image: clockImage, places: [
    place('wall', 'На дальней стене', 58, 32, 5, 'Часы висят на дальней стене.'),
    place('table', 'Над столом', 48, 41, 5, 'Часы висят над столом.', 2, 'table'),
    place('wardrobe', 'Над шкафом', 73, 15, 5, 'Часы висят над шкафом.', 2, 'wardrobe'),
  ] },
]

export const furnishing = [
  { object: 'bed', target: 'window', prompt: 'Поставь кровать около окна.', explanation: '«Около» означает рядом, близко к окну.' },
  { object: 'table', target: 'wall', prompt: 'Поставь стол у дальней стены.', explanation: 'Дальняя стена находится прямо перед нами, между окном и дверью. Ножки стола стоят на полу.' },
  { object: 'wardrobe', target: 'door', prompt: 'Поставь шкаф около двери.', explanation: 'Дверь справа. Шкаф стоит слева от двери, у стены, на полу.' },
  { object: 'chair', target: 'table', prompt: 'Поставь стул рядом со столом.', explanation: '«Рядом со столом» означает близко к столу.' },
  { object: 'box', target: 'wardrobe', prompt: 'Поставь коробку около шкафа.', explanation: 'Коробка находится рядом со шкафом, на полу.' },
  { object: 'shelf', target: 'wall', prompt: 'Повесь полку на дальнюю стену.', explanation: 'Полка прикреплена к стене. Она находится выше мебели.' },
  { object: 'rug', target: 'middle', prompt: 'Положи ковёр посреди комнаты.', explanation: 'Ковёр лежит на полу в середине комнаты.' },
]
export const belongings = [
  { object: 'book', target: 'table', prompt: 'Положи книгу на стол.', explanation: 'Книга лежит на поверхности: на столе.' },
  { object: 'ball', target: 'table', prompt: 'Положи мяч под стол.', explanation: 'Мяч находится внизу, ниже столешницы: под столом.' },
  { object: 'cat', target: 'box', prompt: 'Посади кота в коробку.', explanation: 'Кот сидит внутри: в коробке.' },
  { object: 'bear', target: 'bed', prompt: 'Посади медведя на кровать.', explanation: 'Медведь сидит сверху, на кровати.' },
  { object: 'lamp', target: 'table', prompt: 'Поставь лампу на стол.', explanation: 'Лампа стоит на поверхности: на столе.' },
  { object: 'plant', target: 'shelf', prompt: 'Поставь цветок на полку.', explanation: 'Горшок с цветком стоит на поверхности полки.' },
  { object: 'clock', target: 'wall', prompt: 'Повесь часы на дальнюю стену.', explanation: 'Часы прикреплены к стене, как полка. Говорим: «Часы висят».' },
]
const sentence = (object, prompt, words, distractor, explanation) => ({ object, prompt, words, pool: [words[1], distractor, words[0], words[2]], explanation })
export const sentences = [
  sentence('ball', 'Где лежит мяч?', ['Мяч', 'лежит', 'под столом'], 'на столе', '«Под» показывает расположение ниже стола.'),
  sentence('book', 'Где лежит книга?', ['Книга', 'лежит', 'на столе'], 'под столом', '«На» показывает расположение на поверхности стола.'),
  sentence('cat', 'Где сидит кот?', ['Кот', 'сидит', 'в коробке'], 'на кровати', '«В» показывает расположение внутри коробки.'),
  sentence('bear', 'Где сидит медведь?', ['Медведь', 'сидит', 'на кровати'], 'под кроватью', 'Медведь сидит сверху, на кровати.'),
  sentence('chair', 'Где стоит стул?', ['Стул', 'стоит', 'рядом со столом'], 'около двери', 'Перед словом «столом» говорим «рядом со столом».'),
  sentence('bed', 'Где стоит кровать?', ['Кровать', 'стоит', 'около окна'], 'около двери', 'Кровать находится рядом с окном: около окна.'),
  sentence('table', 'Где стоит стол?', ['Стол', 'стоит', 'у дальней стены'], 'посреди комнаты', 'Стол стоит на полу, близко к дальней стене.'),
  sentence('wardrobe', 'Где стоит шкаф?', ['Шкаф', 'стоит', 'около двери'], 'около окна', 'Шкаф стоит у стены рядом с дверью.'),
  sentence('box', 'Где стоит коробка?', ['Коробка', 'стоит', 'около шкафа'], 'под столом', 'Коробка находится на полу, близко к шкафу.'),
  sentence('lamp', 'Где стоит лампа?', ['Лампа', 'стоит', 'на столе'], 'в коробке', 'Основание лампы стоит на столешнице.'),
  sentence('shelf', 'Где висит полка?', ['Полка', 'висит', 'на дальней стене'], 'на двери', 'Полку крепят к стене. Говорим: «Полка висит».'),
  sentence('rug', 'Где лежит ковёр?', ['Ковёр', 'лежит', 'посреди комнаты'], 'на кровати', 'Ковёр находится на полу в середине комнаты.'),
  sentence('plant', 'Где стоит цветок?', ['Цветок', 'стоит', 'на полке'], 'под столом', 'Горшок с цветком стоит сверху, на полке.'),
  sentence('clock', 'Где висят часы?', ['Часы', 'висят', 'на дальней стене'], 'на двери', 'Со словом «часы» используем форму «висят».'),
  sentence('table', 'Что находится под столом?', ['Под столом', 'лежит', 'мяч'], 'книга', 'Под столом лежит мяч, а книга находится на столе.'),
  sentence('bed', 'Кто сидит на кровати?', ['На кровати', 'сидит', 'медведь'], 'кот', 'Медведь сидит на кровати, а кот — в коробке.'),
  sentence('box', 'Кто сидит в коробке?', ['В коробке', 'сидит', 'кот'], 'медведь', 'Внутри коробки сидит кот.'),
  sentence('shelf', 'Что стоит на полке?', ['На полке', 'стоит', 'цветок'], 'лампа', 'На полке стоит цветок, а лампа — на столе.'),
]
export const tabs = [
  { id: 'furnishing', label: '1 · Обставь комнату' },
  { id: 'belongings', label: '2 · Разложи вещи' },
  { id: 'sentences', label: '3 · Где находится?' },
  { id: 'free', label: '4 · Моя комната' },
]
export const speechSupports = ['В моей комнате есть…', 'Около окна стоит…', 'У дальней стены стоит…', 'Около двери стоит…', 'На столе лежит…', 'Под столом лежит…', 'В коробке сидит…', 'Рядом со столом стоит…', 'На стене висит…', 'На полке стоит…', 'Посреди комнаты лежит…']
