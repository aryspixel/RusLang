# Отдельные предметы комнаты

## Мебель под перспективу комнаты (`*-room-v2`)

15 октября встроенным ImageGen созданы четыре новых PNG; референс для стиля и перспективы — `../room.png`, не цель редактирования. Для игры подготовлены WebP quality 85 с исходной прозрачностью. Старые варианты сохранены.

Общий промпт: один отдельный предмет мебели на прозрачном фоне, стиль и перспектива предоставленной комнаты, тёплое дерево, чёткие тёмные контуры, мягкое иллюстративное затенение, вертикальные линии вертикальны, перспектива интерьера с одной точкой схода вместо изометрического вида сверху. Весь объект виден, плотное кадрирование с небольшим полем, без комнаты, пола, внешних теней, свечения, надписей и водяных знаков.

- `wardrobe-room-v2`: высокий узкий двухдверный шкаф (около 200×95 см), отношение ширины к высоте около 0,48, почти фронтальный вид, узкая правая боковина, верхняя поверхность не видна. Нужная ориентация уже в рисунке.
- `table-room-v2`: стол около 120×75×55 см у дальней стены, ящики справа, открытое место для ног слева, почти фронтальный вид, узкая видимая столешница, без вещей.
- `bed-room-v2`: односпальная кровать вдоль левой стены у окна, изголовье сзади слева, изножье впереди справа, синее покрывало и белая подушка, перспектива по линиям пола комнаты.
- `chair-room-v2`: деревянный стул с синими сиденьем и спинкой, высота около 90 см, почти фронтальный вид с небольшим поворотом влево, вертикальные ножки.

15 октября добавлены `rug`, `shelf`, `plant`, `clock` (PNG-исходники и WebP для игры). Встроенный ImageGen; общий стиль — чёткая учебная иллюстрация с тёмными контурами, прозрачным фоном, без свечения и внешних теней. Отдельные промпты: один овальный кремово-голубой ковёр; одна пустая деревянная настенная полка с двумя кронштейнами; одно зелёное комнатное растение в терракотовом горшке; одни круглые настенные часы с голубой рамкой, делениями без цифр и стрелками на три часа. Без сцены, других объектов, надписей и водяных знаков. WebP quality 85, исходные разрешение и прозрачность сохранены.

Для игры используются WebP-версии с теми же именами: исходное разрешение и прозрачность сохранены, качество сжатия 85. PNG оставлены как исходники и не импортируются игрой. Конвертация выполнена Pillow без изменения содержания иллюстраций для уменьшения объёма загрузки.

Созданы 14 октября 2026 года встроенным ImageGen по просьбе владельца заменить смешанные фрагменты общего листа. Каждый PNG — один объект с прозрачным фоном. Исходный `../objects.png` сохранён как архив исходных иллюстраций.

Общий промпт: "Single isolated sprite for a children's Russian vocabulary room game. ONE object only on a genuinely transparent background. Crisp polished friendly textbook cartoon, bold clean dark outlines, simple readable shapes, warm colors and honey wood where relevant, very light soft shading, three-quarter view from slightly above. Entire subject fully visible, tight frame with tiny transparent margins. No scene, no room, no accompanying objects, no people, no floor, no floor shadows, no sticker cut lines, no text, no watermark. Individual cutout PNG, not a sheet or collage."

Темы отдельных генераций:

- `bed.png`: single wooden child's bed with blue mattress cover, simple integral white pillow; headboard upper left, foot toward lower right.
- `table.png`: empty wooden writing desk with four clearly separated legs, small drawers at right, open space underneath, bare tabletop.
- `wardrobe.png`: closed wooden wardrobe with two doors and two handles.
- `chair.png`: chair with blue upholstered seat and backrest and four wooden legs.
- `box.png`: empty open cardboard box, opening visible, no contents.
- `book.png`: closed red book lying flat, white page edges visible, no letters or symbols.
- `ball.png`: round black and white soccer ball.
- `cat.png`: cute gray and white cat sitting upright, entire tail and paws visible.
- `bear.png`: seated brown plush teddy bear, simple red bow, complete paws visible.
- `lamp.png`: standalone small table lamp with cream lampshade and wooden pedestal base, no table or nightstand.

Файлы подключены статическими относительными импортами Vite в `data.js`. Используется исходный alpha-канал генерации; цветовое смешивание с фоном не применяется. Браузерные проверки и сборка не запускались согласно предпочтению владельца.
