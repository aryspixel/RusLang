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
// Ceiling heights describe the slopes in the two upstairs rooms.
export const rooms = [
  { id: 'bedroom', label: 'Спальня', phrase: 'в спальне', x: 23, y: 8, width: 30.5, height: 28.8, ceilingLeft: 25.5, ceilingRight: 8 },
  { id: 'children', label: 'Детская', phrase: 'в детской', x: 55.5, y: 8, width: 27, height: 28.8, ceilingLeft: 8, ceilingRight: 25.5 },
  { id: 'bath-left', label: 'Ванная слева', phrase: 'в ванной слева', x: 17.5, y: 41, width: 22, height: 19 },
  { id: 'living', label: 'Гостиная', phrase: 'в гостиной', x: 58.5, y: 41, width: 24, height: 19 },
  { id: 'kitchen', label: 'Кухня', phrase: 'на кухне', x: 14, y: 63.5, width: 30.5, height: 23 },
  { id: 'hall', label: 'Прихожая', phrase: 'в прихожей', x: 46.5, y: 64.5, width: 14, height: 22 },
  { id: 'bath-right', label: 'Ванная справа', phrase: 'в ванной справа', x: 62.8, y: 63.5, width: 17.5, height: 23 },
  { id: 'garage', label: 'Гараж', phrase: 'в гараже', x: 83, y: 70, width: 16.7, height: 16.8 },
]

// ViewBox framing removes unused margins without changing source assets.
// Derive the second dimension from that framing and the scene's 3:2 aspect ratio:
// a container must never reduce an object a second time through object-fit.
const item = (data, imageSize, crop, size) => {
  const ratio = crop[2] / crop[3]
  const width = size.width ?? size.height * ratio / 1.5
  const height = size.height ?? size.width * 1.5 / ratio
  return { ...data, imageSize, crop, width, height }
}
export const furniture = [
  item({ id: 'bed-adult', label: 'Кровать для спальни', noun: 'Кровать', verb: 'стоит', image: bed }, [1536, 1024], [130, 20, 1340, 980], { width: 18 }),
  item({ id: 'bed-child', label: 'Кровать для детской', noun: 'Кровать', verb: 'стоит', image: bed }, [1536, 1024], [130, 20, 1340, 980], { width: 15 }),
  item({ id: 'wardrobe', label: 'Шкаф', noun: 'Шкаф', verb: 'стоит', image: wardrobe }, [897, 1754], [20, 20, 850, 1710], { height: 18 }),
  item({ id: 'desk', label: 'Письменный стол', noun: 'Письменный стол', verb: 'стоит', image: desk }, [1536, 1024], [20, 85, 1495, 850], { width: 12 }),
  item({ id: 'chair', label: 'Стул', noun: 'Стул', verb: 'стоит', image: chair }, [1024, 1536], [30, 20, 960, 1480], { height: 10 }),
  item({ id: 'sofa', label: 'Диван', noun: 'Диван', verb: 'стоит', image: sofa }, [1536, 1024], [20, 170, 1495, 720], { width: 18 }),
  item({ id: 'fridge', label: 'Холодильник', noun: 'Холодильник', verb: 'стоит', image: fridge }, [1024, 1536], [185, 50, 650, 1445], { height: 17.5 }),
  item({ id: 'cooker', label: 'Плита', noun: 'Плита', verb: 'стоит', image: cooker }, [1149, 1369], [155, 110, 840, 1165], { height: 10.5 }),
  item({ id: 'sink', label: 'Тумба с раковиной', noun: 'Тумба с раковиной', verb: 'стоит', image: sink }, [1536, 1024], [205, 20, 1130, 960], { width: 10 }),
  item({ id: 'bath', label: 'Ванна', noun: 'Ванна', verb: 'стоит', image: bath }, [1536, 1024], [30, 225, 1470, 580], { width: 14 }),
  item({ id: 'toilet', label: 'Унитаз', noun: 'Унитаз', verb: 'стоит', image: toilet }, [1228, 1281], [270, 40, 745, 1190], { height: 10.3 }),
  item({ id: 'washer', label: 'Стиральная машина', noun: 'Стиральная машина', verb: 'стоит', image: washer }, [1199, 1312], [165, 130, 865, 1090], { height: 10.3 }),
  item({ id: 'plant', label: 'Цветок', noun: 'Цветок', verb: 'стоит', image: plant }, [1199, 1312], [0, 0, 1199, 1312], { height: 9 }),
  item({ id: 'rug', label: 'Ковёр', noun: 'Ковёр', verb: 'лежит', image: rug, layer: 2 }, [1774, 887], [20, 115, 1735, 700], { width: 17 }),
  item({ id: 'shelf', label: 'Полка', noun: 'Полка', verb: 'висит', image: shelf, wall: true }, [2172, 724], [0, 0, 2172, 724], { width: 9 }),
  item({ id: 'clock', label: 'Часы', noun: 'Часы', verb: 'висят', image: clock, wall: true }, [1254, 1254], [0, 0, 1254, 1254], { height: 5 }),
  item({ id: 'box', label: 'Коробка', noun: 'Коробка', verb: 'стоит', image: box }, [1536, 1024], [45, 10, 1450, 1010], { width: 6 }),
]

export const speechSupports = [
  'Какая мебель стоит в каждой комнате?',
  'Почему ты выбрал для неё это место?',
  'Что стоит рядом? Что висит на стене? Что лежит на полу?',
  'Удобно ли пользоваться всеми вещами? Что хочется переставить?',
]
