export const days = ['понедельник','вторник','среда','четверг','пятница','суббота','воскресенье']
export const numbers = ['один','два','три','четыре','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцать','двадцать']
export const colors = [['красный','🔴'],['жёлтый','🟡'],['зелёный','🟢'],['синий','🔵'],['оранжевый','🟠'],['фиолетовый','🟣'],['белый','⚪'],['чёрный','⚫']]
export const riddles = [
  ['Зимой белый, летом серый. Кто это?','заяц',['волк','кот']],
  ['Кто говорит «мяу»?','кошка',['собака','корова']],
  ['Кто говорит «гав»?','собака',['кошка','утка']],
  ['Без рук, без ног, а рисует на окне. Что это?','мороз',['дождь','ветер']],
  ['Круглое, красное, растёт на дереве. Что это?','яблоко',['огурец','арбуз']],
  ['У него четыре колеса. Он едет по дороге. Что это?','машина',['лодка','самолёт']],
  ['У него есть крылья. Он летает в небе. Что это?','самолёт',['поезд','автобус']],
  ['Он холодный и сладкий. Что это?','мороженое',['суп','хлеб']],
  ['У неё длинные уши, она любит морковку. Кто это?','заяц',['лиса','медведь']],
  ['Он светит днём и греет. Что это?','солнце',['луна','дождь']],
  ['Что мы открываем, когда идёт дождь?','зонт',['книгу','мяч']],
  ['Что мы надеваем на ноги?','обувь',['шапку','шарф']],
  ['Что нужно, чтобы писать в тетради?','ручка',['ложка','чашка']],
  ['Где дети читают книги?','в библиотеке',['на кухне','в ванной']],
  ['Кто даёт молоко?','корова',['петух','рыба']],
  ['Какой фрукт жёлтый и длинный?','банан',['яблоко','слива']],
  ['Что показывает время?','часы',['зонт','книга']],
  ['Что растёт на клумбе?','цветок',['камень','стул']],
  ['Кто плавает в пруду и говорит «кря»?','утка',['кошка','лошадь']],
  ['Чем мы рисуем на бумаге?','карандаш',['ложкой','шарфом']],
]
export const topics = { days:'📅 Дни недели', numbers:'🔢 Числа 1–20', colors:'🎨 Цвета', riddles:'🧩 Лёгкие загадки' }
export function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
export function makeBank() {
  const bank = []
  for (let i = 0; i < 7; i++) {
    const after = (i + 1) % 7
    const before = (i + 6) % 7
    bank.push({cat:'days', visual:'📅', text:`Какой день после «${days[i]}»?`, answer:days[after], options:shuffle([days[after],...shuffle(days.filter((_, j) => j !== after)).slice(0, 2)])})
    bank.push({cat:'days', visual:'📅', text:`Какой день перед «${days[i]}»?`, answer:days[before], options:shuffle([days[before],...shuffle(days.filter((_, j) => j !== before)).slice(0, 2)])})
  }
  bank.push({cat:'days',visual:'📅',text:'Сколько дней в неделе?',answer:'7',options:shuffle(['5','7','10'])})
  bank.push({cat:'days',visual:'📅',text:'Какой день идёт первым в неделе?',answer:'понедельник',options:shuffle(['понедельник','пятница','воскресенье'])})
  bank.push({cat:'days',visual:'📅',text:'Сколько выходных дней в неделе?',answer:'2',options:shuffle(['1','2','3'])})
  bank.push({cat:'days',visual:'📅',text:'Какие дни обычно называют выходными?',answer:'суббота и воскресенье',options:shuffle(['суббота и воскресенье','понедельник и вторник','четверг и пятница'])})
  bank.push({cat:'days',visual:'📅',text:'Какой день между понедельником и средой?',answer:'вторник',options:shuffle(['вторник','четверг','суббота'])})
  bank.push({cat:'days',visual:'📅',text:'Какой день между пятницей и воскресеньем?',answer:'суббота',options:shuffle(['суббота','среда','понедельник'])})
  for (let i = 0; i < 20; i++) {
    const other = shuffle(Array.from({length:20}, (_, j) => j + 1).filter(n => n !== i + 1)).slice(0, 2)
    bank.push({cat:'numbers',visual:'🔢',text:`Какое число: «${numbers[i]}»?`,answer:String(i + 1),options:shuffle([String(i + 1),...other.map(String)])})
    bank.push({cat:'numbers',visual:'🔢',text:`Как прочитать число ${i + 1}?`,answer:numbers[i],options:shuffle([numbers[i],...shuffle(numbers.filter((_, j) => j !== i)).slice(0, 2)])})
  }
  for (const [name, emoji] of colors) {
    bank.push({cat:'colors',visual:emoji,text:'Какого цвета этот круг?',answer:name,options:shuffle([name,...shuffle(colors.filter(c => c[0] !== name)).slice(0, 2).map(c => c[0])])})
    bank.push({cat:'colors',visual:'🎨',text:`Найди цвет «${name}».`,answer:emoji,options:shuffle([emoji,...shuffle(colors.filter(c => c[0] !== name)).slice(0, 2).map(c => c[1])])})
  }
  for (const [text, answer, wrong] of [
    ['Какого цвета спелый банан?','жёлтый',['синий','фиолетовый']],
    ['Какого цвета трава летом?','зелёный',['чёрный','оранжевый']],
    ['Какого цвета снег?','белый',['красный','зелёный']],
    ['Какого цвета спелый помидор?','красный',['синий','белый']],
  ]) bank.push({cat:'colors',visual:'🎨',text,answer,options:shuffle([answer,...wrong])})
  for (const [text, answer, wrong] of riddles) bank.push({cat:'riddles',visual:'❓',text,answer,options:shuffle([answer,...wrong])})
  return bank
}
