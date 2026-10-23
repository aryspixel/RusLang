import bed from '../furnish-room/assets/items/bed-room-v2.webp'
import wardrobe from '../furnish-room/assets/items/wardrobe-room-v2.webp'
import desk from '../furnish-room/assets/items/table-room-v2.webp'
import chair from '../furnish-room/assets/items/chair-room-v2.webp'
import plant from '../furnish-room/assets/items/plant.webp'
import rug from '../furnish-room/assets/items/rug.webp'
import shelf from '../furnish-room/assets/items/shelf.webp'
import clock from '../furnish-room/assets/items/clock.webp'
import box from '../furnish-room/assets/items/box.webp'
import sofa from './assets/furniture/sofa.png'
import fridge from './assets/furniture/fridge.png'
import cooker from './assets/furniture/cooker.png'
import sink from './assets/furniture/kitchen-sink.png'
import bath from './assets/furniture/bath.png'
import toilet from './assets/furniture/toilet.png'
import washer from './assets/furniture/washer.png'

// Positions and sizes are percentages of the complete 3:2 house illustration.
// Room rectangles exclude structural walls, staircase, roof and garden.
export const rooms = [
  { id: 'bedroom', label: 'Спальня', phrase: 'в спальне', x: 23, y: 22.5, width: 30.5, height: 14.3 },
  { id: 'children', label: 'Детская', phrase: 'в детской', x: 55.5, y: 23, width: 27, height: 13.8 },
  { id: 'bath-left', label: 'Ванная слева', phrase: 'в ванной слева', x: 17.5, y: 41, width: 22, height: 19 },
  { id: 'living', label: 'Гостиная', phrase: 'в гостиной', x: 58.5, y: 41, width: 24, height: 19 },
  { id: 'kitchen', label: 'Кухня', phrase: 'на кухне', x: 14, y: 63.5, width: 30.5, height: 23 },
  { id: 'hall', label: 'Прихожая', phrase: 'в прихожей', x: 46.5, y: 64.5, width: 14, height: 22 },
  { id: 'bath-right', label: 'Ванная справа', phrase: 'в ванной справа', x: 62.8, y: 63.5, width: 17.5, height: 23 },
  { id: 'garage', label: 'Гараж', phrase: 'в гараже', x: 83, y: 70, width: 16.7, height: 16.8 },
]

export const furniture = [
  { id: 'bed-adult', label: 'Кровать для спальни', noun: 'Кровать', verb: 'стоит', image: bed, width: 15, height: 10 },
  { id: 'bed-child', label: 'Кровать для детской', noun: 'Кровать', verb: 'стоит', image: bed, width: 12, height: 8 },
  { id: 'wardrobe', label: 'Шкаф', noun: 'Шкаф', verb: 'стоит', image: wardrobe, width: 6, height: 12 },
  { id: 'desk', label: 'Письменный стол', noun: 'Письменный стол', verb: 'стоит', image: desk, width: 9, height: 7 },
  { id: 'chair', label: 'Стул', noun: 'Стул', verb: 'стоит', image: chair, width: 4.5, height: 7 },
  { id: 'sofa', label: 'Диван', noun: 'Диван', verb: 'стоит', image: sofa, width: 13, height: 8 },
  { id: 'fridge', label: 'Холодильник', noun: 'Холодильник', verb: 'стоит', image: fridge, width: 5.5, height: 12 },
  { id: 'cooker', label: 'Плита', noun: 'Плита', verb: 'стоит', image: cooker, width: 5.5, height: 8 },
  { id: 'sink', label: 'Тумба с раковиной', noun: 'Тумба с раковиной', verb: 'стоит', image: sink, width: 6, height: 7.5 },
  { id: 'bath', label: 'Ванна', noun: 'Ванна', verb: 'стоит', image: bath, width: 11, height: 6.5 },
  { id: 'toilet', label: 'Унитаз', noun: 'Унитаз', verb: 'стоит', image: toilet, width: 4.5, height: 8 },
  { id: 'washer', label: 'Стиральная машина', noun: 'Стиральная машина', verb: 'стоит', image: washer, width: 5.5, height: 8 },
  { id: 'plant', label: 'Цветок', noun: 'Цветок', verb: 'стоит', image: plant, width: 4.5, height: 7 },
  { id: 'rug', label: 'Ковёр', noun: 'Ковёр', verb: 'лежит', image: rug, width: 12, height: 4, layer: 2 },
  { id: 'shelf', label: 'Полка', noun: 'Полка', verb: 'висит', image: shelf, width: 7, height: 3, wall: true },
  { id: 'clock', label: 'Часы', noun: 'Часы', verb: 'висят', image: clock, width: 3, height: 4.5, wall: true },
  { id: 'box', label: 'Коробка', noun: 'Коробка', verb: 'стоит', image: box, width: 4.5, height: 4 },
]

export const speechSupports = [
  'Какая мебель стоит в каждой комнате?',
  'Почему ты выбрал для неё это место?',
  'Что стоит рядом? Что висит на стене? Что лежит на полу?',
  'Удобно ли пользоваться всеми вещами? Что хочется переставить?',
]
