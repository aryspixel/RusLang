# Отдельные предметы комнаты

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
