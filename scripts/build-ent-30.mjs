import { mkdirSync, writeFileSync } from 'node:fs'
import DATA from '../src/games/russian-ent-practice/data.js'

// Six reviewed items from each of the five existing topic banks.
const picks = [
  [1, 2, 3, 4, 5, 6],
  [0, 1, 2, 3, 5, 6],
  [0, 1, 2, 3, 4, 5],
  [0, 1, 2, 3, 5, 7],
  [0, 1, 2, 3, 4, 5],
]
const questions = picks.flatMap((indices, section) => {
  const bank = DATA.questions.filter(question => question.section === section)
  return indices.map((index, position) => {
    const question = bank[index]
    const choices = question.choices.map(choice => choice.text)
    const shift = (section + position + 1) % choices.length
    return {
      section: DATA.sections[section],
      prompt: question.prompt,
      choices: [...choices.slice(shift), ...choices.slice(0, shift)],
      correct: (choices.length - shift) % choices.length,
      explanation: question.explanation,
    }
  })
})
const payload = JSON.stringify(questions).replaceAll('<', '\\u003c')
const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Русский язык · проверочный тест · 30 вопросов</title>
  <style>
    :root { font-family: system-ui, sans-serif; color: #17263e; background: #eef3f8; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; }
    main { max-width: 1100px; margin: auto; }
    h1 { font-size: clamp(30px, 3vw, 44px); margin: 0 0 16px; }
    h2 { font-size: clamp(24px, 2.4vw, 32px); }
    p, li { font-size: 21px; line-height: 1.45; }
    .card { background: white; border: 1px solid #cfdae7; border-radius: 18px; padding: clamp(20px, 3vw, 36px); box-shadow: 0 8px 28px #1c355013; }
    .meta { color: #3c5672; font-size: 19px; }
    .choices { display: grid; gap: 14px; margin: 24px 0; }
    button { font: inherit; font-size: 21px; min-height: 60px; border-radius: 12px; border: 2px solid #9aafc5; padding: 14px 20px; background: white; color: inherit; cursor: pointer; text-align: left; }
    button:hover { border-color: #2b5f9e; }
    button:focus-visible { outline: 4px solid #ee9e24; outline-offset: 3px; }
    button[aria-pressed="true"] { border-color: #165ea8; background: #e4f1ff; font-weight: 700; }
    button.primary { background: #165ea8; color: white; border-color: #165ea8; text-align: center; font-weight: 700; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    .actions { display: flex; flex-wrap: wrap; gap: 14px; justify-content: space-between; }
    .actions button { min-width: 170px; text-align: center; }
    .review { border-top: 1px solid #cad6e4; padding: 20px 0; }
    .review p { margin: 8px 0; }
    .right { color: #145a32; font-weight: 700; }
    .wrong { color: #a32a25; font-weight: 700; }
    .hidden { display: none; }
    @media (max-width: 600px) { body { padding: 12px; } .actions button { flex: 1; } }
  </style>
</head>
<body>
<main>
  <h1>Русский язык · проверочный тест</h1>
  <div class="card" id="app"></div>
</main>
<script>
const questions = ${payload};
const answers = Array(questions.length).fill(null);
let current = 0;
let finished = false;
const app = document.getElementById('app');
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function render() {
  app.replaceChildren();
  if (finished) return renderResult();
  const question = questions[current];
  app.append(element('p', 'Задание ' + (current + 1) + ' из 30 · ' + question.section, 'meta'));
  app.append(element('h2', question.prompt));
  const choices = element('div', undefined, 'choices');
  question.choices.forEach((choice, index) => {
    const button = element('button', String.fromCharCode(65 + index) + '. ' + choice);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(answers[current] === index));
    button.onclick = () => { answers[current] = index; render(); };
    choices.append(button);
  });
  app.append(choices);
  const actions = element('div', undefined, 'actions');
  if (current > 0) {
    const back = element('button', 'Назад');
    back.onclick = () => { current--; render(); };
    actions.append(back);
  }
  const next = element('button', current === 29 ? 'Завершить тест' : 'Дальше', 'primary');
  next.disabled = answers[current] === null;
  next.onclick = () => {
    if (current === 29) { finished = true; render(); }
    else { current++; render(); }
    window.scrollTo(0, 0);
  };
  actions.append(next);
  app.append(actions);
}
function renderResult() {
  const score = answers.reduce((sum, answer, index) => sum + Number(answer === questions[index].correct), 0);
  app.append(element('h2', 'Результат: ' + score + ' из 30'));
  app.append(element('p', 'Правильные ответы и объяснения по всем заданиям:'));
  questions.forEach((question, index) => {
    const block = element('section', undefined, 'review');
    block.append(element('p', (index + 1) + '. ' + question.prompt));
    const correct = answers[index] === question.correct;
    block.append(element('p', correct ? 'Верно' : 'Неверно. Ваш ответ: ' + question.choices[answers[index]], correct ? 'right' : 'wrong'));
    block.append(element('p', 'Правильный ответ: ' + question.choices[question.correct]));
    block.append(element('p', question.explanation));
    app.append(block);
  });
  const restart = element('button', 'Пройти ещё раз', 'primary');
  restart.onclick = () => { answers.fill(null); current = 0; finished = false; render(); window.scrollTo(0, 0); };
  app.append(restart);
}
render();
</script>
</body>
</html>`
mkdirSync(new URL('../public/', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/russian-ent-30.html', import.meta.url), html)
