import { objects } from './data.js'

const byId = new Map(objects.map(item => [item.id, item]))

function resolve(item, location, map) {
  if (!location.parent) return { ...item, ...location, layer: item.stackLayer ?? location.layer }
  const parent = byId.get(location.parent)
  const parentPlace = parent.places.find(place => place.id === map[parent.id])
  if (!parentPlace) return { ...item, ...location, available: false }
  const actual = resolve(parent, parentPlace, map)
  if (actual.available === false) return { ...item, ...location, available: false }
  const reference = parent.places[0]
  const scale = actual.width / reference.width
  const width = location.width * scale
  return {
    ...item,
    ...location,
    x: Math.max(width / 2, Math.min(100 - width / 2, actual.x + (location.x - reference.x) * scale)),
    y: Math.min(98, actual.y + (location.y - reference.y) * scale),
    width,
    // Вещи сохраняют порядок относительно своей мебели, оставаясь в её слое глубины.
    // Например, книга на столе тоже должна скрываться за кроватью на переднем плане.
    layer: item.id === 'rug' ? 0 : actual.layer + (location.layer - reference.layer) / 100,
  }
}

export function roomObjects(map) {
  return objects.flatMap(item => {
    const location = item.places.find(place => place.id === map[item.id])
    if (!location) return []
    const resolved = resolve(item, location, map)
    return resolved.available === false ? [] : [{ ...resolved, id: item.id }]
  })
}

export function roomPlaces(item, map) {
  return (item?.places || []).map(location => {
    const resolved = resolve(item, location, map)
    return {
      ...resolved,
      id: location.id,
      label: resolved.available === false
        ? `${location.label} · сначала размести предмет «${byId.get(location.parent).label}»`
        : location.label,
    }
  })
}
