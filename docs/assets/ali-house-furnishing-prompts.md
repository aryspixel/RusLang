# Ali house furnishing artwork

Created October 23, 2026 with the built-in image generation tool. The edit target/style reference is `src/games/ali-house/assets/house-v2.png`, preserved unchanged. Game sources are `assets/house-empty.png` and individual transparent `assets/furniture/*.png`, relative to `src/games/ali-house/`. Existing bedroom/decorative WebP cutouts are reused from `src/games/furnish-room/assets/items/` without modification.

## Empty house final prompt

Use case: precise-object-edit.
Asset type: empty background for a touch-screen furnishing game.
Edit target: supplied cutaway house illustration. Keep EXACTLY the same 1536x1024 framing, house architecture, room boundaries, proportions, roof, camera, floors, background sky and garden. Same warm realistic illustrated shading.
Empty EVERY indoor room completely, including the garage: remove all furniture, beds, cabinets, shelves, desks, chairs, wardrobes, kitchen counters, sinks, appliances, cooker, kitchen extractor, bathtubs, toilets, washing machines, shower fittings and glass partitions, curtains, towels, artwork, lights/lamps, plants, toys, cookware, books, rugs, shoes, toaster, watering can, vehicle, bicycle and storage. Fill removed areas with natural clean walls and uninterrupted floors. ALL rooms must be genuinely bare empty shells. Keep the central staircase, exterior front door, structural walls, windows, ceiling/roof beams and garage opening as architecture. Do not merge rooms or change wall/floor locations. The upper floor is bedroom left and children's room right; middle floor bathroom left, staircase center, living room right; lower floor kitchen left, entry center, bathroom right, garage far right.
No characters, furniture, icons, arrows, UI, letters, numbers, captions, outlines or watermark. Absolutely NO furnishings baked into the empty rooms. Output one clean 3:2 illustration.

## Furniture cutout final prompts

Each object is a separate built-in image generation call with transparency enabled. All prompts share this template; substitute the subject below:

Use case: precise-object-edit. Asset type: isolated furniture cutout for the supplied house furnishing game. Use the supplied image ONLY as a style reference; output SUBJECT. One object only, centered and fully visible with a tight transparent margin. Match the warm, softly shaded realistic educational illustration of the cutaway house; clean identifiable shapes, mostly frontal camera, no exaggerated top-down or isometric angle. GENUINELY TRANSPARENT background, preserve alpha. No room, floor, walls, cast floor shadow, sticker border, labels, words, digits, people, accompanying objects, or watermark. The object is the only nontransparent content.

- `sofa.png`: one comfortable cream two-seat sofa with two blue cushions, front-facing, complete legs visible.
- `fridge.png`: one closed tall white refrigerator with freezer door, front-facing with a very narrow visible right side.
- `cooker.png`: one freestanding white kitchen cooker: oven below and four simple burners above, no cookware, front-facing.
- `kitchen-sink.png`: one freestanding cream kitchen sink cabinet with a single silver faucet and integrated sink, front-facing.
- `bath.png`: one freestanding white bathtub with four short legs, long side facing the viewer, tub opening visible, no faucet, no separate objects.
- `toilet.png`: one white ceramic toilet with closed lid, cistern attached, nearly front-facing with a slight right-side view.
- `washer.png`: one white front-loading washing machine with a round dark glass door, front-facing.
