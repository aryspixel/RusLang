# RusLang

Каталог тренажёров по русскому языку для сенсорной панели 75″. Исходные HTML-файлы описаны в [плане переноса](docs/MIGRATION.md). В каталоге доступны 12 игр, включая переносы из папок 01–03.

Перед работой прочитайте [AGENTS.md](AGENTS.md), [UX-правила](docs/UX.md), [правила тем](docs/THEMES.md) и [навигацию](docs/NAVIGATION.md).

## Локальный запуск

Для обычного Windows-терминала можно использовать npm:

```powershell
cd C:\development\RusLang
npm install
npm run dev
```

Сборка: `npm run build`. Для просмотра собранного сайта: `npm run preview`.

Не устанавливайте npm поверх `node_modules`, созданного pnpm: это может вызвать `EUNSUPPORTEDPROTOCOL` для `link:`. При смене менеджера сначала переименуйте старую папку `node_modules` в резервную, затем установите зависимости заново. Для npm сохранён `package-lock.json`; для pnpm — `pnpm-lock.yaml`. При обновлении зависимостей синхронизируйте оба файла.

Альтернативный запуск через pnpm (используется в GitHub Actions):

```sh
pnpm install
pnpm dev
```

Сборка для статического хостинга: `pnpm build`. Выход — `dist/`. В `vite.config.js` используется относительная база для GitHub Pages. Каждый push в `main` запускает `.github/workflows/pages.yml` и публикует сборку на [GitHub Pages](https://aryspixel.github.io/RusLang/).
