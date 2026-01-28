# Setup and Run Script for Backend & Tests

# Color output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

Write-Info "=================================="
Write-Info "S2O Backend Setup & Test Script"
Write-Info "=================================="

# Get backend directory
$backendDir = "d:\project\project-cong-nghe-phan-mem\src\backend"

# Check if directory exists
if (!(Test-Path $backendDir)) {
    Write-Error "❌ Backend directory not found: $backendDir"
    exit 1
}

cd $backendDir
Write-Success "✅ Changed to backend directory"

# 1. Check Python
Write-Info "`n[1/6] Checking Python installation..."
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "✅ Python found: $pythonVersion"
} else {
    Write-Error "❌ Python not found. Install Python 3.9+ first!"
    exit 1
}

# 2. Create virtual environment if not exists
Write-Info "`n[2/6] Setting up virtual environment..."
if (!(Test-Path "venv")) {
    Write-Warning "Creating new virtual environment..."
    python -m venv venv
    Write-Success "✅ Virtual environment created"
} else {
    Write-Success "✅ Virtual environment already exists"
}

# 3. Activate virtual environment
Write-Info "`n[3/6] Activating virtual environment..."
.\venv\Scripts\Activate.ps1
Write-Success "✅ Virtual environment activated"

# 4. Install dependencies
Write-Info "`n[4/6] Installing dependencies..."
pip install -q -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Success "✅ Dependencies installed"
} else {
    Write-Error "❌ Failed to install dependencies"
    exit 1
}

# 5. Create .env if not exists
Write-Info "`n[5/6] Checking .env file..."
if (!(Test-Path ".env")) {
    Write-Warning "Creating .env from .env.example..."
    Copy-Item ".env.example" -Destination ".env"
    Write-Success "✅ .env created"
    Write-Warning "⚠️ IMPORTANT: Update .env with your actual settings!"
    Write-Warning "   - DATABASE_URL with correct PostgreSQL connection"
    Write-Warning "   - SECRET_KEY with a strong random key"
    Write-Warning "   - API_KEY settings if using external services"
} else {
    Write-Success "✅ .env file exists"
}

# 6. Summary
Write-Success "`n✅ Setup complete!"

Write-Info "`n=================================="
Write-Info "Next Steps:"
Write-Info "=================================="
Write-Info "1. Update .env file with your settings"
Write-Info "2. Start PostgreSQL (if not running)"
Write-Info "3. Run: alembic upgrade head (for migrations)"
Write-Info "4. Run backend: uvicorn app.main:app --reload"
Write-Info "5. Run tests: pytest tests/ -v"
Write-Info ""
Write-Info "Quick Commands:"
Write-Info "  Backend:      uvicorn app.main:app --reload --port 8000"
Write-Info "  All Tests:    pytest tests/ -v"
Write-Info "  Guest Order:  pytest tests/unit/service/guest_order_api.py -v"
Write-Info "  Menu Service: pytest tests/unit/service/menu_service.py -v"
Write-Info "  Multitenancy: pytest tests/unit/service/multitenancy.py -v"
Write-Info ""
Write-Info "Database Migrations:"
Write-Info "  Upgrade:      alembic upgrade head"
Write-Info "  Downgrade:    alembic downgrade -1"
Write-Info "  Current:      alembic current"
Write-Info ""
Write-Info "Swagger UI: http://localhost:8000/docs"
Write-Info "Health Check: curl http://localhost:8000/health"
Write-Info "=================================="
