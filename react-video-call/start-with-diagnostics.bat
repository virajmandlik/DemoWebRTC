@echo off
title Enhanced React Video Call - Startup
color 0A

echo.
echo ========================================
echo   Enhanced React Video Call Application
echo ========================================
echo.
echo Starting application with enhanced camera/microphone diagnostics...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the react-video-call directory
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   IMPORTANT CAMERA/MICROPHONE NOTES
echo ========================================
echo.
echo 1. The app will open at: http://localhost:3000
echo 2. Camera/microphone requires HTTPS or localhost
echo 3. You MUST allow permissions when prompted
echo 4. If you have issues, click the diagnostic button (wrench icon)
echo.
echo TROUBLESHOOTING:
echo - Click camera icon in address bar and allow access
echo - Close other apps using camera (Zoom, Teams, etc.)
echo - Try Chrome browser for best compatibility
echo - Use the camera test page: http://localhost:3000/camera-test.html
echo.
echo ========================================
echo.

REM Start the application
echo Starting React development server...
echo.
echo The application will open automatically in your browser.
echo If it doesn't open, manually go to: http://localhost:3000
echo.
echo Camera Test Page: http://localhost:3000/camera-test.html
echo Troubleshooting Guide: See CAMERA_TROUBLESHOOTING.md
echo.
echo Press Ctrl+C to stop the server when done.
echo.

npm start

echo.
echo Application stopped.
pause