# Separate room objects

## Furniture matching room perspective (`*-room-v2`)

On October 15, built-in ImageGen created four PNGs using `../room.png` as a style/perspective reference, not an edit target. Game WebPs use quality 85 and original transparency. Earlier variants remain.

Shared prompt: one isolated furniture object on transparent background, matching the supplied room's style/perspective; warm wood, clean dark outlines, soft illustrated shading, vertical lines vertical, one-point interior perspective rather than top-down isometric. Entire object visible, tight framing with a small margin; no room, floor, external shadow, glow, text, or watermark.

- `wardrobe-room-v2`: tall narrow two-door wardrobe (about 200×95 cm), width/height about 0.48, nearly frontal, narrow right side visible, no visible top. Required orientation already in drawing.
- `table-room-v2`: desk about 120×75×55 cm at far wall, drawers right, open legroom left, nearly frontal, narrow visible tabletop, empty.
- `bed-room-v2`: single bed along left wall near window, headboard back-left, foot front-right, blue cover/white pillow, perspective follows room floor lines.
- `chair-room-v2`: wooden chair with blue seat/back, about 90 cm high, nearly frontal/slightly left-turned, vertical legs.

October 15 additions: `rug`, `shelf`, `plant`, `clock`, with PNG sources/WebP game files. Built-in ImageGen; shared clear textbook style, dark outlines, transparent background, no glow/external shadows. Individual prompts: one oval cream/light-blue rug; one empty wooden wall shelf with two brackets; one green houseplant in a terracotta pot; one round light-blue-framed wall clock, tick marks without digits, hands at three o'clock. No scene, extra objects, text, or watermark. Quality 85 WebP retains dimensions/transparency.

The game imports same-named WebP versions, preserving source dimensions/transparency at quality 85. PNGs remain sources, not game imports. Pillow conversion reduced downloads without changing illustration content.

Created October 14, 2026 with built-in ImageGen at owner request to replace mixed source-sheet fragments. Each PNG contains one transparent object. `../objects.png` remains an archive of the original illustrations.

Shared prompt: "Single isolated sprite for a children's Russian vocabulary room game. ONE object only on a genuinely transparent background. Crisp polished friendly textbook cartoon, bold clean dark outlines, simple readable shapes, warm colors and honey wood where relevant, very light soft shading, three-quarter view from slightly above. Entire subject fully visible, tight frame with tiny transparent margins. No scene, no room, no accompanying objects, no people, no floor, no floor shadows, no sticker cut lines, no text, no watermark. Individual cutout PNG, not a sheet or collage."

Individual generation subjects:

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

Files use static relative Vite imports in `data.js`. Original generated alpha is retained; no background color blending. Browser checks/build not run, per owner preference.
