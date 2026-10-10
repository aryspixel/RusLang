@echo off
setlocal
set "PYTHONUTF8=1"
set "TTS_PYTHON=%~dp0.local\silero\.venv\Scripts\python.exe"
if not exist "%TTS_PYTHON%" (
  echo Silero is not installed. Run tools\silero\setup.ps1 first.
  exit /b 1
)
"%TTS_PYTHON%" "%~dp0tools\silero\tts.py" %*
exit /b %errorlevel%
