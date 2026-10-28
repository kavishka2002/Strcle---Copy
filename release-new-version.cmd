@echo off
setlocal
cd /d "%~dp0"

echo Building the LittlePaper release installer...
echo Close the LittlePaper desktop app first if the build reports locked files.
call npm run desktop:release
if errorlevel 1 (
    echo.
    echo Release build failed.
    pause
    exit /b 1
)

echo.
echo Release installer build completed. Check the release folder for the installer.
pause
exit /b 0
