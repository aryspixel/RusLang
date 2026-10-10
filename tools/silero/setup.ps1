param([string]$Python = '')
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$localDir = Join-Path $repoRoot '.local\silero'
$venvPython = Join-Path $localDir '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $venvPython)) {
    if (-not $Python) {
        $bundledPython = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
        if (Test-Path -LiteralPath $bundledPython) { $Python = $bundledPython }
        elseif (Get-Command python -ErrorAction SilentlyContinue) { $Python = 'python' }
        else { throw 'Укажите Python 3.12: .\tools\silero\setup.ps1 -Python C:\path\python.exe' }
    }
    & $Python -m venv (Join-Path $localDir '.venv')
    if ($LASTEXITCODE -ne 0) { throw 'Не удалось создать окружение Python.' }
}
& $venvPython -m ensurepip --upgrade
if ($LASTEXITCODE -ne 0) { throw 'Не удалось установить pip.' }
& $venvPython -m pip install --disable-pip-version-check --index-url https://download.pytorch.org/whl/cpu -r (Join-Path $PSScriptRoot 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Не удалось установить PyTorch.' }
$modelDir = Join-Path $localDir 'models'
New-Item -ItemType Directory -Force $modelDir | Out-Null
$modelFile = Join-Path $modelDir 'v5_5_ru.pt'
$expectedHash = '50081637B602126EE06CB3BC8A744D25651D2DA149EE8864B9A379BFDD934437'
if (-not (Test-Path -LiteralPath $modelFile)) {
    $partialFile = "$modelFile.part"
    Invoke-WebRequest 'https://models.silero.ai/models/tts/ru/v5_5_ru.pt' -OutFile $partialFile
    if ((Get-FileHash -LiteralPath $partialFile -Algorithm SHA256).Hash -ne $expectedHash) {
        throw 'Хеш загруженной модели отличается от зафиксированного. Файл .part оставлен для разбора; модель не активирована.'
    }
    Move-Item -LiteralPath $partialFile -Destination $modelFile
}
if ((Get-FileHash -LiteralPath $modelFile -Algorithm SHA256).Hash -ne $expectedHash) {
    throw 'Локальная модель отличается от зафиксированной версии.'
}
Invoke-WebRequest 'https://raw.githubusercontent.com/snakers4/silero-models/master/LICENSE' -OutFile (Join-Path $localDir 'LICENSE')
Write-Host 'Silero установлен. Генерация: .\tts.bat --text "Привет!" --output .local\silero\output\hello.wav'
