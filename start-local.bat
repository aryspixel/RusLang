@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title RusLang - local server

where node >nul 2>nul
if errorlevel 1 (
    echo Не найден Node.js. Установите Node.js LTS и запустите этот файл снова.
    pause
    exit /b 1
)

set "PACKAGE_MANAGER=npm"
where pnpm >nul 2>nul
if not errorlevel 1 set "PACKAGE_MANAGER=pnpm"
where %PACKAGE_MANAGER% >nul 2>nul
if errorlevel 1 (
    echo Не найден npm или pnpm. Переустановите Node.js LTS.
    pause
    exit /b 1
)

if not exist "node_modules\vite\bin\vite.js" (
    echo Установка зависимостей. Для первого запуска нужен интернет.
    if "%PACKAGE_MANAGER%"=="pnpm" (
        call pnpm install --frozen-lockfile
    ) else (
        call npm ci
    )
    if errorlevel 1 goto :error
)

echo Запуск RusLang. Браузер откроется автоматически.
echo Для остановки сервера нажмите Ctrl+C или закройте это окно.
if "%PACKAGE_MANAGER%"=="pnpm" (
    call pnpm run dev --host 127.0.0.1 --open
) else (
    call npm run dev -- --host 127.0.0.1 --open
)
if errorlevel 1 goto :error
exit /b 0

:error
echo Не удалось запустить сервер. Подробности указаны выше.
pause
exit /b 1
