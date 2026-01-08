# S2O (Scan2Order) - SaaS Smart Restaurant Management Platform
 S2O (Scan2Order) is a comprehensive SaaS platform designed to revolutionize the F&B industry in Vietnam. It provides a multi-tenant architecture allowing multiple restaurants to manage operations, menus, and orders while offering customers a seamless QR ordering experience and an AI-powered personalized mobile app. 
# Key Features
## For Restaurants (SaaS Tenant)
- Multi-Tenant Architecture: Strict data isolation and configuration for each restaurant brand.
- Menu Management: Real-time updates for items, prices, and availability.
- QR Code Generation: Unique QR codes for specific tables.
- Order Management: Real-time synchronization between Guest ordering and Kitchen/Bar.
- Analytics: Revenue reports and operational insights.
## For Guests (Web App - No Install)
- Scan & Order: Instant access to the menu via QR code.
- Real-time Tracking: Monitor dish status (Preparing, Ready, Served).
- Seamless Payment: Request bill and payment support directly from the browser.
## For Customers (Mobile App)
- Discovery: Find restaurants based on location and rating.
- Table Reservation: Book tables in advance.
- AI Assistant:
- Smart Recommendations: Suggests dining options based on weather, habits, and history (Vector Search).
- Chatbot QA: Answer questions about menu, opening hours, and policies (RAG + LLM).
## For Administrators
- Platform Management: Onboard new restaurants, manage subscriptions, and monitor system health.
# Tech Stack
## Backend & Database
- Language: Python.
- Core Database: PostgreSQL (Relational data & JSONB for flexible attributes).
- Vector Database: Qdrant (For AI Embeddings & Semantic Search).
- Caching & Message Broker: Redis (Session management & Real-time WebSocket pub/sub).
- Authentication: JWT & Role-Based Access Control (RBAC).
## Frontend
- Web Client (Admin/Restaurant/Guest): Next.js (TypeScript).
- Mobile App: React Native.
- DevOps & Infrastructure
- Containerization: Docker & Docker Compose.
- CI/CD: GitHub Actions.
- Project Structure

# Project Structure
## Bash
```
S2O-Platform/
├── apps/
│   ├── web/                # Next.js for Admin, Restaurant Portal, and Guest View
│   └── mobile/             # React Native App for End-users
├── services/
│   ├── api/                # Main Backend API (Python)
│   ├── ai-engine/          # AI Service (Chatbot & Recommender - Python)
│   └── worker/             # Background tasks (Celery/Dramatiq)
├── docker/                 # Docker configurations
├── docs/                   # Documentation & UML Diagrams
└── README.md
```

# Getting Started
## Prerequisites
- Docker & Docker Compose installed.
- Node.js (v18+) & Python (v3.10+).
- PostgreSQL & Redis (if running locally without Docker).
## Installation
1. Clone the repository.
```
git clone https://github.com/your-username/S2O-Platform.git
cd S2O-Platform
```

2. **Environment Setup** Copy the example environment file and update your credentials (DB URL, API Keys).
```
cp .env.example .env
```

3. **Run with Docker Compose (Recommended)**
This will start the Database, Backend, AI Service, and Redis.
```
docker-compose up -d --build
```

4. **Run Frontend (Web)**
```
cd apps/web
npm install
npm run dev
```

5. **Run Mobile App**
```
cd apps/mobile
npm install
npm run android  # or ios
```