<div align="center">

# 🚖 Rozi (روزی) — Multi-Platform Captain Earnings & Fuel Intelligence Platform

**An all-in-one financial intelligence and expense management platform for ride-hailing and delivery captains across Pakistan.**

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph_AI-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraphjs/)
[![Groq](https://img.shields.io/badge/Groq_LPU-F55036?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

### 📌 GitHub Repository Tagline & Topics
> **About Tagline:**
> *AI-powered financial tracker & voice assistant for ride-hailing/delivery captains in Pakistan (Careem, Bykea, Yango, Foodpanda, InDrive) built with React 19, Node.js, MySQL, LangGraph & Docker.*
> 
> **Topics:** `react`, `nodejs`, `express`, `mysql`, `langgraph`, `groq-llm`, `speech-to-text`, `docker-compose`, `fcm`, `cloudinary`, `fintech`, `gig-economy`

---

</div>

## 📖 Executive Summary & Problem Solved

Gig economy drivers and delivery captains frequently juggle **3 to 5 apps simultaneously** (e.g., *Careem, Bykea, Yango, Foodpanda, InDrive*). Because each app operates in its own silo, captains face significant financial blind spots:

- ❌ No unified view of daily/weekly gross earnings across apps.
- ❌ Fuel, maintenance, and vehicle expenses go unrecorded, masking **true net profit**.
- ❌ Lack of mileage analytics leaves drivers unaware of their actual cost per kilometer.
- ❌ No quick hands-free way to query financial performance while driving on the road.

**Rozi** solves this by unifying cross-platform earnings, fuel expenses, and real-time mileage analytics into a unified dashboard, backed by a **voice-enabled, tool-calling AI Financial Assistant**.

---

## 🌟 Key Features

### 1. 🤖 AI Financial Assistant (Voice & Text + LangGraph)
- **Tool-Calling Agent**: Powered by **LangGraph** and **Groq LPU** (`openai/gpt-oss-120b`) to fetch deterministic SQL numbers directly from the driver's database records.
- **🎤 Hands-Free Voice Input (Speech-to-Text)**: Uses native browser Web Speech API for road-safe voice queries.
- **🚗 Quick Captain Emojis**: One-tap emoji bar (🚗, 🛵, ⛽, 💰, 📈, 🛠️) tailored for quick context entry.
- **Multi-Tenant Security via Closures**: `userId` is captured in server-side closures — the LLM can never access or leak other captains' records.
- **Natural Date Normalization**: Automatically translates relative terms (*"yesterday"*, *"last week"*, *"this month"*) into strict ISO SQL bounds.

### 2. 💰 Multi-Platform Earnings Tracker
- Single-entry and batch tracking for **Careem, Bykea, Yango, Foodpanda, InDrive**, and custom platforms.
- Records gross amount, trip counts, hours worked, and platform fees.
- Instant per-platform comparative breakdown.

### 3. ⛽ Fuel Logs & Mileage Expense Engine
- Detailed fuel fill-up logs (amount, liters, odometer readings, fuel station, fuel type).
- Calculates consumption rates (**PKR/km** and **km/L**).
- Computes **True Net Profit** ($Gross\ Earnings - Fuel\ Spend$).

### 4. 📊 Analytics, Charts & Export
- Interactive visual dashboards built with **Recharts** and **Framer Motion**.
- Trends across daily, weekly, and monthly periods.
- Export financial reports to **PDF** and **CSV** for record-keeping.

### 5. 🔐 Security & Identity Management
- **JWT Authentication** + **Google OAuth 2.0** integration.
- Refresh token rotation & secure password hashing with `bcryptjs`.
- **Cloudinary Avatar Uploads** with automatic image optimization & old file deletion.
- **Firebase Cloud Messaging (FCM)** for automated weekly earnings notifications.

### 6. 🎧 Dedicated Captain Help & Support Center
- Direct email ticketing with one-tap copy & pre-filled mail client launch.
- Interactive FAQ accordion covering calculations, fuel efficiency, and voice assistance.
- Extensible roadmap cards for upcoming WhatsApp captain community and helpline channels.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Frontend (React 19 + Vite)               │
│    Tailwind CSS v4 • Framer Motion • Web Speech API    │
└───────────────────────────┬────────────────────────────┘
                            │ (Axios REST + JWT)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Backend (Node.js + Express)                │
│    Auth Middleware • Controllers • Parameterized SQL   │
└──────────────┬────────────────────────────┬────────────┘
               │                            │
               ▼                            ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     LangGraph + Groq LPU     │ │     MySQL 8.0 DB      │
│  StateGraph • MemorySaver    │ │  Earnings, Fuel Logs, │
│  Zod Schema DB Tool Calling  │ │  Users, Conversations │
└──────────────────────────────┘ └───────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons, Web Speech API |
| **Backend** | Node.js, Express.js, `mysql2/promise`, `bcryptjs`, `jsonwebtoken`, Multer |
| **AI & LLM** | LangGraph (`@langchain/langgraph`), Groq (`@langchain/groq`), Zod |
| **Database** | MySQL 8.0 (Relational schema with foreign keys and cascade deletions) |
| **DevOps & Cloud** | Docker, Docker Compose, Cloudinary SDK, Firebase Cloud Messaging (FCM) |

---

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the repository
```bash
git clone https://github.com/iamumerfarooq43-lab/Rozi-.git
cd Rozi-
```

### 2. Configure Environment Variables
Create `.env` in the root and `backend/.env` with your credentials:

```env
# Database Configuration
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rozi_db
DB_PORT=3306

# Security & Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
GROQ_API_KEY=your_groq_api_key

# Cloudinary (Optional for avatars)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Launch with Docker Compose
```bash
docker compose up --build -d
```

- **Frontend**: Accessible at `http://localhost:5173`
- **Backend API**: Accessible at `http://localhost:5000/api`
- **MySQL Database**: Running on port `3307` (mapped to `3306`)

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new captain account | ❌ |
| `POST` | `/api/auth/login` | User login & JWT generation | ❌ |
| `POST` | `/api/auth/google` | Google OAuth 2.0 verification | ❌ |
| `POST` | `/api/assistant/chat` | Send message to AI Assistant | ✅ |
| `GET` | `/api/assistant/conversations` | Get past assistant chat sessions | ✅ |
| `GET` | `/api/earnings` | Fetch user earnings entries | ✅ |
| `POST` | `/api/earnings` | Create new earnings record | ✅ |
| `GET` | `/api/fuel-logs` | Fetch fuel expense logs | ✅ |
| `POST` | `/api/fuel-logs` | Record new fuel entry | ✅ |
| `GET` | `/api/analytics/summary` | Fetch consolidated net profit stats | ✅ |

---

## 📄 License & Attribution

Developed with ❤️ for the hardworking ride-hailing and delivery captains of Pakistan.
Distributed under the **MIT License**.
