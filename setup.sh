#!/bin/bash

echo "=================================="
echo "S2O Platform - Setup Script"
echo "=================================="

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env created. Please configure with your API keys."
fi

echo ""
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "✗ Docker not found. Please install Docker."
    exit 1
fi
echo "✓ Docker found"

echo ""
echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "✗ Docker Compose not found. Please install Docker Compose."
    exit 1
fi
echo "✓ Docker Compose found"

echo ""
echo "Starting services..."
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 5

echo ""
echo "Service Status:"
docker-compose ps

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo "Frontend Web: http://localhost:3000 (run 'npm run dev' in src/frontend_web)"
echo "Mobile App: (run 'npm start' in src/frontend_app)"
echo ""
echo "Next steps:"
echo "1. Configure .env with your Google API key"
echo "2. Run docker-compose logs -f to see logs"
echo "3. Visit http://localhost:8000/docs for API testing"
echo ""
