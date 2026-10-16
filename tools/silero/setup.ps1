param(
    [string]$Python = '',
    [ValidateSet('v5_6_ru', 'v5_5_ru')][string]$Model = 'v5_6_ru',
    [string]$ModelSha256 = ''
)
$ErrorActionPreference = 'Stop'
if (-not $ModelSha256 -and $Model -eq 'v5_5_ru') {
    $ModelSha256 = '50081637B602126EE06CB3BC8A744D25651D2DA149EE8864B9A379BFDD934437'
}
if ($ModelSha256 -and $ModelSha256 -notmatch '^[0-9a-fA-F]{64}$') {
    throw 'ModelSha256 must contain exactly 64 hexadecimal characters.'
}
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
$modelFile = Join-Path $modelDir "$Model.pt"
$hashFile = "$modelFile.sha256"
$expectedHash = $ModelSha256
if (-not $expectedHash -and (Test-Path -LiteralPath $hashFile)) {
    $expectedHash = (Get-Content -LiteralPath $hashFile -Raw).Trim()
    if ($expectedHash -notmatch '^[0-9a-fA-F]{64}$') {
        throw "Invalid local checksum file: $hashFile"
    }
}
# A first installation trusts the official HTTPS download and records its hash.
# Without a saved/supplied hash, fetch fresh bytes instead of trusting an orphan file.
if (-not (Test-Path -LiteralPath $modelFile) -or -not $expectedHash) {
    $partialFile = "$modelFile.part"
    Invoke-WebRequest "https://models.silero.ai/models/tts/ru/$Model.pt" -OutFile $partialFile
    $downloadHash = (Get-FileHash -LiteralPath $partialFile -Algorithm SHA256).Hash
    if ($expectedHash -and $downloadHash -ne $expectedHash) {
        throw 'Хеш загруженной модели отличается от зафиксированного. Файл .part оставлен для разбора; модель не активирована.'
    }
    if (-not $expectedHash) { $expectedHash = $downloadHash }
    Move-Item -LiteralPath $partialFile -Destination $modelFile -Force
}
if ((Get-FileHash -LiteralPath $modelFile -Algorithm SHA256).Hash -ne $expectedHash) {
    throw 'Локальная модель отличается от зафиксированной версии.'
}
Set-Content -LiteralPath $hashFile -Value $expectedHash -Encoding ascii
Write-Host "Model SHA256 saved locally: $expectedHash"
Invoke-WebRequest 'https://raw.githubusercontent.com/snakers4/silero-models/master/LICENSE' -OutFile (Join-Path $localDir 'LICENSE')
Write-Host "Silero $Model installed. Generate with: .\tts.bat --model $Model --text ... --output .local\silero\output\hello.wav"
