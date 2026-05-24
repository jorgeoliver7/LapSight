# LapSight 🏁

> **See every lap.** Pit wall analytics and 360° management for motorsport teams.

[English](README.md) · [Español](README.es.md)

Telemetry analysis platform — import data from the tools you already use (AiM,
MoTeC, RaceChrono, iRacing, MyLaps, VBox…), compare drivers lap by lap with
formal statistical tests, and manage teams, vehicles and calendar from a single
screen.

Portfolio project — custom design system (**Apex / Pit Wall × Cyan**), full
stack (Spring Boot · FastAPI · React + TS), production-ready deployment, and
self-register flow so anyone can try it with their own team.

<br/>

## 🚀 Demo

| Account | Access |
|---|---|
| **Try as guest** | Click "→ Try the demo" on the landing — automatic login |
| **Create your own account** | "Create account" → each sign-up generates an isolated team |
| **Manual (demo admin)** | `admin@lapsight.app` / `admin123` |

> If deployed publicly with `APP_SEED_DEMO_DATA=true`, the "Try the demo"
> button signs you in to a fictional F1 team with realistic sessions.

<br/>

## ✨ Capabilities

| Pillar | What it does |
|---|---|
| **Advanced analytics** | Lap distributions, statistical tests, per-driver consistency, multi-session comparison, automatic insights in natural language |
| **Real telemetry** | Importers for AiM, MoTeC, RaceChrono, iRacing, MyLaps, VBox, Race Technology, Apex Pro, Harry's LapTimer, generic CSV |
| **Real GPS circuits** | 38 layouts with GPS coordinates from OpenStreetMap, mini-maps, sector colouring, circuit comparator |
| **360° operations** | Teams · drivers (with FIA license) · vehicles (hours/km/maintenance) · events with budget vs actual · calendar |
| **Reports** | PDF export per session |

<br/>

## 🛠️ Stack

```
backend/             Spring Boot 3.2 + Java 17 + JPA + Flyway + JWT
python/              FastAPI · pandas · numpy · scipy · sklearn · Plotly
frontend/            React 18 + TS + Vite + MUI + Zustand + react-big-calendar
docker/postgres/     init.sql
docker-compose.yml   Local dev (4 services)
docker-compose.prod.yml   Production deploy (VPS / Swarm)
```

Custom **Apex** design system (`frontend/src/components/apex/`,
`frontend/src/theme/tokens.ts`): `borderRadius: 0`, surface stepping instead of
shadows, IBM Plex Mono with tabular-nums for numerics, cyan as the accent.

Internationalisation via `react-i18next` — English by default, Spanish toggle
in the header. Locale files at `frontend/src/i18n/locales/`.

<br/>

## ⚡ Local quickstart (5 minutes)

Requirements: **Docker Desktop** + **Node 20** + **npm**.

```bash
# 1) Backend stack (postgres + python-analytics + Spring Boot)
docker compose up -d postgres python-analytics backend

# 2) Frontend with hot-reload
cd frontend
npm install
npm run dev
```

- Frontend → http://localhost:3000
- Backend → http://localhost:8082 (mapped to the container's 8080)
- Adminer (optional) → `docker compose --profile dev up adminer` → http://localhost:8081

Seed credentials: `admin@lapsight.app / admin123`.

### Alternatives

- **Backend with `mvn spring-boot:run`** → port 8080. Set
  `VITE_API_PROXY_TARGET=http://localhost:8080` in `frontend/.env.local`.
- **Everything in Docker** → `docker compose up -d` (no service args). The
  frontend Nginx serves on `:3000`, no HMR.

### Login troubleshooting

| Symptom | Diagnosis |
|---|---|
| No error detail | Backend not running or proxy on wrong port. `netstat -ano \| findstr :8082` |
| 404 with `Server: Apache` | XAMPP/WAMP listening on :8080 is hijacking the proxy. Stop Apache or stick to the default 8082 proxy target. |
| Flyway errors on startup | Postgres volume out of sync. `docker compose down -v && docker compose up -d` |

<br/>

## ☁️ Production deployment

### Option A — VPS with `docker-compose.prod.yml` (recommended)

```bash
# On your VPS (DigitalOcean, Hetzner, etc.)
git clone https://github.com/jorgeoliver7/LapSight.git
cd LapSight

# Copy and fill the .env (DO NOT commit this file)
cp backend/.env.example .env
nano .env  # generate JWT_SECRET with `openssl rand -base64 48`

# Start
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Logs
docker compose -f docker-compose.prod.yml logs -f backend
```

Put a reverse proxy with TLS in front of it (Caddy is the simplest):

```caddyfile
lapsight.yourdomain.com {
    reverse_proxy localhost:3000
}
```

### Option B — PaaS (Railway, Fly.io, Render)

Each service deploys independently using its own Dockerfile.

**Railway** (most straightforward):

1. Create a project, connect your GitHub repo
2. Add the services:
   - **postgres** (Railway managed service, free tier available)
   - **python-analytics** → Root: `python/`
   - **backend** → Root: `backend/`
   - **frontend** → Root: `frontend/`, build arg `VITE_API_URL=https://api.yourdomain.com/api`
3. Environment variables for `backend` (see `backend/.env.example`):
   ```
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>   # Railway gives you host/port
   SPRING_DATASOURCE_USERNAME=...
   SPRING_DATASOURCE_PASSWORD=...
   JWT_SECRET=<openssl rand -base64 48>
   APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>.railway.app
   PYTHON_ANALYTICS_URL=http://python-analytics.railway.internal:8000
   APP_SEED_DEMO_DATA=true   # if you want the demo account to have data
   APP_SEED_ADMIN_PASSWORD=<something-secure>
   ```
4. The backend reads Railway's auto-injected `PORT` — already wired in `application-prod.yml`.

**Fly.io** works similarly: one `fly.toml` per service.

<br/>

## 🛡️ Security

- JWT HS384 with 48-byte secret (configurable via `JWT_SECRET`)
- Rate limiting on `/auth/login` and `/auth/register` (10 req/min/IP by default,
  tunable via `APP_RATE_LIMIT_AUTH_MAX` and `APP_RATE_LIMIT_AUTH_WINDOW_SEC`)
- CORS configurable per domain (`APP_CORS_ALLOWED_ORIGINS`)
- Self-register creates an isolated team per user — no cross-account access
- BCrypt cost-10 password hashing
- Actuator endpoints restricted to `health,info` in prod profile

**What's NOT included** (it's a portfolio, not a SaaS):
- Email-based password reset
- Email verification
- 2FA
- CSRF (not needed with JWT bearer tokens)
- Privacy policy / cookie consent (add before exposing publicly in the EU)

<br/>

## 🏗️ Architecture

```
                          ┌─────────────┐
                          │   Browser   │
                          └──────┬──────┘
                                 │ HTTPS
                          ┌──────▼──────┐
                          │   Nginx     │  (static files + /api proxy)
                          │   :3000     │
                          └──────┬──────┘
                                 │ /api/*
                          ┌──────▼──────┐
                          │ Spring Boot │  (JWT auth · JPA · Flyway)
                          │   :8080     │
                          └──┬──────────┘
                             │       │
                ┌────────────▼┐    ┌─▼───────────────┐
                │  Postgres   │    │ FastAPI         │
                │             │    │ (pandas, sklearn)│
                └─────────────┘    └─────────────────┘
```

Internal communication on Docker network (`lapsight-network`).
The Python microservice is never exposed externally — only the backend consumes it.

<br/>

## 📂 Project structure

```
backend/
  src/main/java/com/lapsight/
    config/             # DataInitializer, DemoSeedService
    controller/         # REST endpoints
    dto/                # Request/Response objects
    model/              # JPA entities
    repository/         # Spring Data
    security/           # JWT + rate limit + Security config
    service/            # Business logic
  src/main/resources/
    application.yml, application-docker.yml, application-prod.yml
    db/migration/       # Flyway V1__ V2__ V3__ V4__

python/
  app/
    main.py             # FastAPI app
    analytics/          # statistical core
    visualizations/     # Plotly

frontend/
  src/
    pages/              # Landing, Auth, Dashboard, Analytics, Circuits, …
    components/apex/    # Design system primitives
    api/                # Axios clients
    store/              # Zustand
    theme/              # tokens.ts + muiTheme.ts
    i18n/               # locales/en.json + locales/es.json + index.ts
```

<br/>

## 📝 Notable design decisions

- **Custom design system (Apex)**: tokens in `frontend/src/theme/tokens.ts`, MUI
  override in `muiTheme.ts`, primitives in `components/apex/`. Hard rules:
  `borderRadius: 0` (except circles), no box-shadows, surface stepping
  (`bg → surface → surface2 → surface3`), tabular-nums mandatory on numerics.
- **Separate Python microservice**: pandas/sklearn aren't ergonomic in Java and
  the scientific ecosystem lives in Python. Spring Boot consumes it over REST.
- **JWT stateless over sessions**: simplifies multi-instance deployment and
  eliminates the need for sticky sessions.
- **Vite + proxy in dev**: HMR without rebuilding the container.
- **Self-register with isolated team**: each user creates their own team on
  sign-up and is its MANAGER — no real data is shared between accounts
  (except the demo team if `APP_SEED_DEMO_DATA=true`).
- **i18n with English default**: the UI ships in English with a Spanish toggle
  in the header. Locale strings live in `frontend/src/i18n/locales/`.

<br/>

## 📜 License

[MIT](LICENSE) — feel free to fork and use for whatever you want.
