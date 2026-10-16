# RusLang

A catalog of Russian-language trainers for a 75″ touch panel. Legacy HTML files are listed in the [migration plan](docs/MIGRATION.md). The catalog includes 14 games, covering migrations from folders 01–03 and agreed new scenarios.

Before working, read [AGENTS.md](AGENTS.md), [UX rules](docs/UX.md), [theme rules](docs/THEMES.md), and [navigation](docs/NAVIGATION.md).

For a new listening lesson, use the project skill
[$listening-lesson](.agents/skills/listening-lesson/SKILL.md): topic → scenario and
visual-support options → feedback → agreed lines and exercises → audio through
`$openrouter-voice` → acceptance → trainer implementation if requested.
Save the current lesson's decisions in `docs/lessons/<slug>.md`.

## Local development

Local Russian speech: [Silero TTS](docs/LOCAL_TTS.md). Command: `.\tts.bat --text "Привет!" --output .local\silero\output\hello.wav`.

Expressive Seed Audio/OpenRouter narration, reference voices, and educational sound scenes: [setup and commands](docs/OPENROUTER_AUDIO.md), [project skill](.agents/skills/openrouter-voice/SKILL.md). Configure the key only on the working machine; games use generated audio without browser API calls.

For an ordinary Windows terminal, npm is supported:

```powershell
cd C:\development\RusLang
npm install
npm run dev
```

Build: `npm run build`. Preview the build: `npm run preview`.

Do not install npm packages over pnpm-created `node_modules`: `link:` dependencies may cause `EUNSUPPORTEDPROTOCOL`. When switching managers, first rename the old `node_modules` as a backup, then reinstall. npm uses `package-lock.json`; pnpm uses `pnpm-lock.yaml`. Keep both lockfiles in sync when updating dependencies.

Alternatively, use pnpm (also used by GitHub Actions):

```sh
pnpm install
pnpm dev
```

Static build: `pnpm build`, output: `dist/`. `vite.config.js` uses a relative base for GitHub Pages. Every push to `main` triggers `.github/workflows/pages.yml` and publishes to [GitHub Pages](https://aryspixel.github.io/RusLang/).
