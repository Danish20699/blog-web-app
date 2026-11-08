# ⚡ DEVSPACE — Modern Full-Stack Developer Platform

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**DEVSPACE** is a high-performance, containerized blogging and community platform built for developers. Engineered as a 3-tier distributed system using **FastAPI**, **PostgreSQL 16**, **React 18 (Vite + TypeScript)**, and orchestrated with **Docker Compose**.

---

## 🏛️ Architecture Overview

```
                      [ Client Browser ]
                              │
          ┌───────────────────┴───────────────────┐
          │ Port 3000                             │ Port 8000
          ▼                                       ▼
 ┌──────────────────┐                    ┌──────────────────┐
 │  blog_frontend   │   REST API (JSON)  │   blog_backend   │
 │  (React + Nginx) │───────────────────►│  (FastAPI ASGI)  │
 └──────────────────┘                    └────────┬─────────┘
          │                                       │
          │     blog_net (Docker Bridge)          │ Port 5432
          └───────────────────────────────────────┼─────────┐
                                                  ▼         ▼
                                         ┌──────────────────┐
                                         │  blog_postgres   │
                                         │  (PostgreSQL 16) │
                                         │  [postgres_data] │
                                         └──────────────────┘
```

---

## ✨ Features

- **🔐 Stateless JWT Authentication**: Passlib password hashing with **Bcrypt** ($2b$ with 12 rounds) and signed HMAC-SHA256 (`HS256`) access tokens.
- **🛡️ Zero-Trust Ownership Guards**: Only authors can delete their own articles (`403 Forbidden` authorization check).
- **📝 Full CRUD Lifecycle**: Publish articles, dynamic reading time calculation, detail view with live engagement metrics.
- **💬 Community Discussion**: Instant threaded commenting system tied to authenticated user IDs.
- **▲ Interactive Reactions**: Toggleable endorsements (likes) with instant optimistic UI updates.
- **🔍 Real-Time Live Search**: Instant client-side filtering by keyword, title, or content.
- **🐳 Multi-Stage Containerization**:
  - Frontend compiled with Node 20 builder and served via Alpine Nginx with SPA routing fallback (`try_files $uri /index.html`).
  - Backend automated startup with Docker Compose healthcheck (`pg_isready`).
  - Persistent PostgreSQL database storage across container lifecycles.

---

## 📁 Repository Structure

```text
blog-web-app/
├── backend/
│   ├── routes/              # Modular API endpoints (auth, users, blogs)
│   ├── db.py                # Database engine & connection session generator
│   ├── main.py              # FastAPI app instance with CORS middleware
│   ├── models.py            # SQLModel entities & Pydantic request/response schemas
│   ├── security.py          # Password hashing & JWT token verification
│   ├── requirements.txt     # Backend dependencies (fastapi, psycopg, sqlmodel, etc.)
│   └── Dockerfile           # Python 3.11-slim containerization
├── db/
│   └── init.sql             # PostgreSQL schema DDL with cascading foreign keys
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API client with Bearer auth injection
│   │   ├── components/      # UI components (Navbar, BlogCard, Composer, AuthModal)
│   │   ├── context/         # Global AuthContext (localStorage JWT persistence)
│   │   ├── pages/           # Home feed and PostDetail reader view
│   │   └── types/           # TypeScript data contracts matching SQLModel
│   ├── nginx.conf           # SPA fallback configuration
│   └── Dockerfile           # Multi-stage production container (Node 20 -> Nginx)
├── .dockerignore
├── .env.example             # Documented environment variable template
├── .gitignore               # Ignores .venv, node_modules, .env, and *.db
└── docker-compose.yml       # Orchestrates db, backend, and frontend
```

---

## 🚀 Quick Start (Docker Compose)

### 1. Clone the repository
```bash
git clone https://github.com/Danish20699/blog-web-app.git
cd blog-web-app
```

### 2. Configure environment variables
Create a `.env` file from the example:
```bash
cp .env.example .env
```

### 3. Launch the full stack
```bash
docker compose up --build
```

---

## 🌐 Endpoints & Services

| Service | URL | Description |
|---|---|---|
| **Frontend Web App** | [http://localhost:3000](http://localhost:3000) | React SPA UI |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for testing endpoints |
| **Alternative API Docs** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | ReDoc specifications |
| **PostgreSQL Database** | `localhost:5432` | Database engine (`blog_db`) |

---

## 🛠️ API Reference

### Authentication & Users
- `POST /user` — Register a new developer account.
- `POST /login` — Authenticate via OAuth2 form-data and retrieve JWT access token.
- `GET /user/me` — Fetch authenticated user profile (`Authorization: Bearer <token>`).
- `GET /user/{user_id}` — Public user profile lookup.
- `POST /user/{target_user_id}/follow` — Follow or unfollow another author.

### Blogs & Interactions
- `GET /blogs` — List all published articles with dynamic like & comment counts.
- `GET /blog/{blog_id}` — Retrieve full article details.
- `POST /blog` — Publish a new article (Author ID auto-bound from JWT).
- `DELETE /blog/{blog_id}` — Delete article (Author ownership verification required).
- `POST /blog/{blog_id}/like` — Toggle like/unlike on an article.
- `GET /blog/{blog_id}/comments` — Retrieve all comments for an article.
- `POST /blog/{blog_id}/comment` — Post a comment on an article.

---

## 📜 License
Distributed under the MIT License.
