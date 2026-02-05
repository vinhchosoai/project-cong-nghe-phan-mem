@echo off
setlocal enabledelayedexpansion

echo ==================================
echo S2O Platform - Setup Script
echo ==================================
echo.

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo. 
    echo Created .env file. Please configure with your API keys.
)

echo.
echo Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker not found. Please install Docker.
    pause
    exit /b 1
)
echo Docker found

echo.
echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker Compose not found. Please install Docker Compose.
    pause
    exit /b 1
)
echo Docker Compose found

echo.
echo Starting services...
docker-compose up -d

echo.
echo Waiting for services to be healthy...
timeout /t 5 /nobreak

echo.
echo Service Status:
docker-compose ps

echo.
echo ==================================
echo Setup Complete!
echo ==================================
echo.
echo API Documentation: http://localhost:8000/docs
echo Frontend Web: http://localhost:3000 (run 'npm run dev' in src/frontend_web)
echo Mobile App: (run 'npm start' in src/frontend_app)
echo.
echo Next steps:
echo 1. Configure .env with your Google API key
echo 2. Run 'docker-compose logs -f' to see logs
echo 3. Visit http://localhost:8000/docs for API testing
echo.

pause
