import bedImage from './assets/items/bed.png'
import tableImage from './assets/items/table.png'
import wardrobeImage from './assets/items/wardrobe.png'
import chairImage from './assets/items/chair.png'
import boxImage from './assets/items/box.png'
import bookImage from './assets/items/book.png'
import ballImage from './assets/items/ball.png'
import catImage from './assets/items/cat.png'
import bearImage from './assets/items/bear.png'
import lampImage from './assets/items/lamp.png'

// Новый сценарий по мотивам листа «Моя комната: большое повторение».
// x/y — центр по горизонтали и нижний край предмета, в процентах комнаты.
const place = (id, label, x, y, width, description, layer = 2) => ({ id, label, x, y, width, description, layer })
export const objects = [
  { id: 'bed', label: 'Кровать', image: bedImage, places: [
    place('window', 'Около окна', 25, 88, 38, 'Кровать стоит около окна.'),
    place('middle', 'Посреди комнаты', 51, 98, 38, 'Кровать стоит посреди комнаты.'),
    place('door', 'Около двери', 77, 94, 36, 'Кровать стоит около двери.'),
  ] },
  { id: 'table', label: 'Стол', image: tableImage, places: [
    place('wall', 'У дальней стены', 48, 65, 25, 'Стол стоит у дальней стены.'),
    place('window', 'Около окна', 22, 66, 25, 'Стол стоит около окна.'),
    place('middle', 'Посреди комнаты', 53, 94, 25, 'Стол стоит посреди комнаты.'),
  ] },
  { id: 'wardrobe', label: 'Шкаф', image: wardrobeImage, places: [
    place('door', 'Около двери', 73, 65, 20, 'Шкаф стоит около двери.'),
    place('window', 'Около окна', 25, 66, 20, 'Шкаф стоит около окна.'),
    place('middle', 'Посреди комнаты', 52, 94, 20, 'Шкаф стоит посреди комнаты.'),
  ] },
  { id: 'chair', label: 'Стул', image: chairImage, places: [
    place('table', 'Рядом со столом', 54, 79, 12, 'Стул стоит рядом со столом.', 4),
    place('door', 'Около двери', 89, 90, 12, 'Стул стоит около двери.', 4),
    place('bed', 'Около кровати', 39, 93, 12, 'Стул стоит около кровати.', 4),
  ] },
  { id: 'box', label: 'Коробка', image: boxImage, places: [
    place('wardrobe', 'Около шкафа', 76, 91, 16, 'Коробка стоит около шкафа.', 5),
    place('table', 'Под столом', 45, 75, 13, 'Коробка стоит под столом.', 1),
    place('bed', 'Около кровати', 40, 97, 16, 'Коробка стоит около кровати.', 5),
  ] },
  { id: 'book', label: 'Книга', image: bookImage, places: [
    place('table', 'На столе', 46, 46, 9, 'Книга лежит на столе.', 6),
    place('bed', 'На кровати', 22, 68, 9, 'Книга лежит на кровати.', 6),
    place('floor', 'На полу', 58, 96, 10, 'Книга лежит на полу.', 6),
  ] },
  { id: 'ball', label: 'Мяч', image: ballImage, places: [
    place('table', 'Под столом', 43, 72, 8, 'Мяч лежит под столом.', 1),
    place('bed', 'На кровати', 21, 69, 8, 'Мяч лежит на кровати.', 6),
    place('chair', 'Около стула', 61, 84, 8, 'Мяч лежит около стула.', 6),
  ] },
  { id: 'cat', label: 'Кот', image: catImage, places: [
    place('box', 'В коробке', 76, 83, 9, 'Кот сидит в коробке.', 6),
    place('bed', 'На кровати', 20, 68, 10, 'Кот сидит на кровати.', 6),
    place('table', 'Под столом', 46, 73, 10, 'Кот сидит под столом.', 1),
  ] },
  { id: 'bear', label: 'Медведь', image: bearImage, places: [
    place('bed', 'На кровати', 22, 70, 10, 'Медведь сидит на кровати.', 6),
    place('table', 'На столе', 51, 47, 9, 'Медведь сидит на столе.', 6),
    place('chair', 'Около стула', 62, 85, 10, 'Медведь сидит около стула.', 6),
  ] },
  { id: 'lamp', label: 'Лампа', image: lampImage, places: [
    place('table', 'На столе', 54, 47, 8, 'Лампа стоит на столе.', 6),
    place('bed', 'Около кровати', 38, 90, 10, 'Лампа стоит около кровати.', 6),
    place('wardrobe', 'Около шкафа', 63, 76, 10, 'Лампа стоит около шкафа.', 6),
  ] },
]

export const furnishing = [
  { object: 'bed', target: 'window', prompt: 'Поставь кровать около окна.', explanation: '«Около» означает рядом, близко к окну.' },
  { object: 'table', target: 'wall', prompt: 'Поставь стол у дальней стены.', explanation: 'Дальняя стена находится прямо перед нами, между окном и дверью.' },
  { object: 'wardrobe', target: 'door', prompt: 'Поставь шкаф около двери.', explanation: 'Дверь справа. Шкаф стоит рядом с ней.' },
  { object: 'chair', target: 'table', prompt: 'Поставь стул рядом со столом.', explanation: '«Рядом со столом» означает близко к столу.' },
  { object: 'box', target: 'wardrobe', prompt: 'Поставь коробку около шкафа.', explanation: 'Коробка находится рядом со шкафом, на полу.' },
]
export const belongings = [
  { object: 'book', target: 'table', prompt: 'Положи книгу на стол.', explanation: 'Книга лежит на поверхности: на столе.' },
  { object: 'ball', target: 'table', prompt: 'Положи мяч под стол.', explanation: 'Мяч находится внизу, ниже столешницы: под столом.' },
  { object: 'cat', target: 'box', prompt: 'Посади кота в коробку.', explanation: 'Кот сидит внутри: в коробке.' },
  { object: 'bear', target: 'bed', prompt: 'Посади медведя на кровать.', explanation: 'Медведь сидит сверху: на кровати.' },
  { object: 'lamp', target: 'table', prompt: 'Поставь лампу на стол.', explanation: 'Лампа стоит на поверхности: на столе.' },
]
export const sentences = [
  { object: 'ball', prompt: 'Где лежит мяч?', words: ['Мяч', 'лежит', 'под столом'], pool: ['на столе', 'под столом', 'лежит', 'Мяч'], explanation: '«Под» показывает расположение ниже стола.' },
  { object: 'book', prompt: 'Где лежит книга?', words: ['Книга', 'лежит', 'на столе'], pool: ['лежит', 'под столом', 'Книга', 'на столе'], explanation: '«На» показывает расположение на поверхности стола.' },
  { object: 'cat', prompt: 'Где сидит кот?', words: ['Кот', 'сидит', 'в коробке'], pool: ['в коробке', 'на кровати', 'Кот', 'сидит'], explanation: '«В» показывает расположение внутри коробки.' },
  { object: 'bear', prompt: 'Где сидит медведь?', words: ['Медведь', 'сидит', 'на кровати'], pool: ['сидит', 'Медведь', 'под кроватью', 'на кровати'], explanation: 'Медведь сидит сверху, на кровати.' },
  { object: 'chair', prompt: 'Где стоит стул?', words: ['Стул', 'стоит', 'рядом со столом'], pool: ['около двери', 'рядом со столом', 'стоит', 'Стул'], explanation: 'Перед словом «столом» говорим «рядом со столом».' },
  { object: 'bed', prompt: 'Где стоит кровать?', words: ['Кровать', 'стоит', 'около окна'], pool: ['около окна', 'стоит', 'около двери', 'Кровать'], explanation: 'Кровать находится рядом с окном: около окна.' },
]
export const tabs = [
  { id: 'furnishing', label: '1 · Обставь комнату' },
  { id: 'belongings', label: '2 · Разложи вещи' },
  { id: 'sentences', label: '3 · Где находится?' },
  { id: 'free', label: '4 · Моя комната' },
]
export const speechSupports = ['В моей комнате есть…', 'Около окна стоит…', 'На столе находится…', 'Под столом лежит…', 'В коробке сидит…', 'Рядом со столом стоит…']
