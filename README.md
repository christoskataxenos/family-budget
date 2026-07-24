# Family Budget & Finance Tracker

A lightweight, self-hosted family budget and finance management application designed for minimal memory and CPU resource utilization.

---

## Features

- **Transaction Management**: Record and track income, expenses, investments, and savings.
- **Expense Categorization**:
  - Groceries
  - Housing & Rent
  - Loans & Installments
  - Insurance
  - Utilities
  - Entertainment & Dining
  - Transport & Fuel
  - Health & Medical
  - Education & Family
  - Taxes & Fees
  - Personal Care & Shopping
  - Other Expense
- **Budget Limits**: Define monthly spending thresholds per expense category with visual overspend indicators.
- **Role-Based Access Control**: Separate administrative access (protected by a 4-digit PIN) from general family member accounts.
- **Authentication & Security**: Passlib bcrypt password and PIN hashing with JSON Web Tokens (JWT).
- **Data Export**: Export transaction data to CSV, XLSX (Excel), and JSON formats.
- **Analytics & Dashboards**: Interactive financial metrics and distribution charts powered by Recharts.

---

## Tech Stack

- **Backend**: Python 3.14+, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, SQLite.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide.
- **Deployment**: Docker, Docker Compose, Caddy Reverse Proxy.

---

## Getting Started

### Local Development (Windows 11)

#### 1. Backend API (Port 8050)

Execute the following commands in PowerShell within the `backend` directory:

```powershell
cd backend
.\setup_win11.ps1
.\run_win11.ps1
```

- Swagger API Documentation: http://localhost:8050/docs
- Health Check: http://localhost:8050/health

#### 2. Frontend Dashboard (Port 3000)

Execute the following commands in a separate PowerShell window within the `frontend` directory:

```powershell
cd frontend
.\run_frontend_win11.ps1
```

- Web Dashboard: http://localhost:3000

---

## Docker Deployment

To launch the complete application stack (Backend, Frontend, and Caddy Proxy) using Docker Compose:

```bash
cp .env.example .env
docker-compose up --build -d
```

- Caddy Reverse Proxy: http://localhost:8080
- API Documentation: http://localhost:8050/docs
