export const days = [
 { id: 0, ru: 'Понедельник', kz: 'Дүйсенбі' }, { id: 1, ru: 'Вторник', kz: 'Сейсенбі' },
 { id: 2, ru: 'Среда', kz: 'Сәрсенбі' }, { id: 3, ru: 'Четверг', kz: 'Бейсенбі' },
 { id: 4, ru: 'Пятница', kz: 'Жұма' }, { id: 5, ru: 'Суббота', kz: 'Сенбі' }, { id: 6, ru: 'Воскресенье', kz: 'Жексенбі' },
]
export const zones = [{ id: 'y', ru: '🌙 Вчера', kz: 'Кеше', offset: -1 }, { id: 't', ru: '☀️ Сегодня', kz: 'Бүгін', offset: 0 }, { id: 'n', ru: '🌅 Завтра', kz: 'Ертең', offset: 1 }]
export const rules = { rounds: 10, correctRoundScore: 1 }
export const text = {
 title: 'Вчера — Сегодня — Завтра', titleKz: 'Кеше — Бүгін — Ертең',
 instruction: 'Выбери день, затем нажми нужное окошко.', instructionKz: 'Күнді таңда, содан кейін тиісті ұяшықты бас.',
 choose: 'Сначала выбери день. / Алдымен күнді таңда.', incomplete: 'Заполни три окошка. / Үш ұяшықты толтыр.',
 wrong: 'Есть ошибка. Подумай ещё раз. / Қате бар. Тағы ойлан.',
 check: '✓ Проверить / Тексеру', reset: '↻ Сбросить / Қайта бастау', next: 'Следующее / Келесі →',
 finish: '🏆 Игра окончена!', finishKz: 'Ойын аяқталды!', soundOn: '🔊 Звук включён', soundOff: '🔇 Включить звук',
}
export const expectedDays = current => zones.map(zone => (current + zone.offset + 7) % 7)
export const explanation = current => {
 const [y,t,n] = expectedDays(current)
 return { ru: `Вчера — ${days[y].ru}, сегодня — ${days[t].ru}, завтра — ${days[n].ru}.`, kz: `Кеше — ${days[y].kz}, бүгін — ${days[t].kz}, ертең — ${days[n].kz}.` }
}
