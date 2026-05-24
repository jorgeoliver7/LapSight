# LapSight 🏁

> **See every lap.** Pit wall analytics y gestión 360 para equipos de motorsport.

### 🌍 Demo en vivo · **[lapsight.onrender.com](https://lapsight.onrender.com)**

[![Live](https://img.shields.io/badge/demo-live-3ec5d1?style=flat-square)](https://lapsight.onrender.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-9ca3ad?style=flat-square)](LICENSE)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6db33f?style=flat-square&logo=spring)
![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)

[English](README.md) · [Español](README.es.md)

Plataforma de análisis de telemetría — importa datos de las herramientas que ya usas
(AiM, MoTeC, RaceChrono, iRacing, MyLaps, VBox…), compara pilotos vuelta a vuelta
con tests estadísticos formales, y gestiona equipos, vehículos y calendario desde
una sola pantalla.

Proyecto de portfolio — diseño propio (sistema **Apex / Pit Wall × Cyan**), stack
fullstack (Spring Boot · FastAPI · React + TS), y deploy listo para producción.

<br/>

## 🚀 Pruébala

[**→ Abrir el demo en vivo**](https://lapsight.onrender.com)

| Ruta | Qué hace |
|---|---|
| Click **"→ Probar demo"** en la landing | Login automático al equipo seed estilo F1 (Alonso, Sainz, 30+ sesiones) |
| Click **"Crear cuenta"** | Regístrate con email + password y te creas tu propio equipo aislado |
| Toggle de idioma | EN/ES arriba a la derecha en cada pantalla |

> El deploy corre en Render free tier — el backend y el servicio de analytics
> duermen tras 15 min sin tráfico, así que **la primera petición tras ese rato
> tarda ~30-60s** mientras se despiertan. Después responde instantáneo. El
> frontend es estático así que la landing siempre carga rápido.

<br/>

## ✨ Capacidades

| Pilar | Qué hace |
|---|---|
| **Analytics avanzado** | Distribuciones, tests estadísticos, consistencia por piloto, comparativa multi-sesión, insights en lenguaje natural |
| **Telemetría real** | Importadores AiM, MoTeC, RaceChrono, iRacing, MyLaps, VBox, Race Technology, Apex Pro, Harry's LapTimer, CSV genérico |
| **Circuitos GPS** | 38 trazados con coordenadas GPS reales (OpenStreetMap), mini-mapas, sectores coloreados, comparador |
| **Operativo 360** | Equipos · pilotos (con licencia FIA) · vehículos (horas/km/mantenimiento) · eventos con presupuesto · calendario |
| **Reports** | Export PDF por sesión |

<br/>

## 🛠️ Stack

```
backend/             Spring Boot 3.2 + Java 17 + JPA + Flyway + JWT
python/              FastAPI · pandas · numpy · scipy · sklearn · Plotly
frontend/            React 18 + TS + Vite + MUI + Zustand + react-big-calendar
docker/postgres/     init.sql
docker-compose.yml   Dev local (4 servicios)
docker-compose.prod.yml  Deploy (VPS / Swarm)
```

Design system **Apex** propio (`frontend/src/components/apex/`,
`frontend/src/theme/tokens.ts`): `borderRadius: 0`, surface stepping en lugar
de sombras, IBM Plex Mono con tabular-nums para numéricos, cyan como acento.

<br/>

## ⚡ Arranque local (5 minutos)

Requisitos: **Docker Desktop** + **Node 20** + **npm**.

```bash
# 1) Stack backend (postgres + python-analytics + Spring boot)
docker compose up -d postgres python-analytics backend

# 2) Frontend con hot-reload
cd frontend
npm install
npm run dev
```

- Frontend → http://localhost:3000
- Backend → http://localhost:8082 (mapeado al 8080 del contenedor)
- Adminer (opcional) → `docker compose --profile dev up adminer` → http://localhost:8081

Credenciales seed para dev local (sobrescribibles via `.env`):
- email: `admin@local.dev`
- password: `please-change-me`

Son defaults desechables para conveniencia local. En cualquier deploy real debes
configurar `APP_SEED_ADMIN_EMAIL` y `APP_SEED_ADMIN_PASSWORD` con valores que tú controles.

### Alternativas

- **Backend con `mvn spring-boot:run`** → puerto 8080. Pon
  `VITE_API_PROXY_TARGET=http://localhost:8080` en `frontend/.env.local`.
- **Todo en Docker** → `docker compose up -d` (sin servicios específicos).
  Frontend Nginx sirve en `:3000`, sin HMR.

### Si el login da "Error de autenticación"

| Síntoma | Diagnóstico |
|---|---|
| Sin detalle | Backend no arrancado o proxy a puerto incorrecto. `netstat -ano \| findstr :8082` |
| 404 con `Server: Apache` | XAMPP/WAMP en :8080 está secuestrando el proxy. Apaga Apache o usa el proxy 8082. |
| Flyway errors al arrancar | Volumen Postgres desincronizado. `docker compose down -v && docker compose up -d` |

<br/>

## ☁️ Deploy en producción

### Opción A — VPS con `docker-compose.prod.yml` (recomendada)

```bash
# En tu VPS (DigitalOcean, Hetzner, etc.)
git clone https://github.com/<TU_USUARIO>/lapsight.git
cd lapsight

# Copia y rellena el .env (NO commitees este archivo)
cp backend/.env.example .env
nano .env  # genera JWT_SECRET con `openssl rand -base64 48`

# Arranca
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

# Logs
docker compose -f docker-compose.prod.yml logs -f backend
```

Pon delante un reverse proxy con TLS (Caddy es lo más simple):

```caddyfile
lapsight.tudominio.com {
    reverse_proxy localhost:3000
}
```

### Opción B — PaaS (Railway, Fly.io, Render)

Cada servicio se despliega por separado usando su propio Dockerfile.

**Railway** (más sencillo):

1. Crea un proyecto, conecta tu repo de GitHub
2. Añade los servicios:
   - **postgres** (servicio gestionado de Railway, gratis)
   - **python-analytics** → Root: `python/`
   - **backend** → Root: `backend/`
   - **frontend** → Root: `frontend/`, build arg `VITE_API_URL=https://api.tudominio.com/api`
3. Variables de entorno para `backend` (ver `backend/.env.example`):
   ```
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>   # Railway te da host/port
   SPRING_DATASOURCE_USERNAME=...
   SPRING_DATASOURCE_PASSWORD=...
   JWT_SECRET=<openssl rand -base64 48>
   APP_CORS_ALLOWED_ORIGINS=https://<tu-frontend>.railway.app
   PYTHON_ANALYTICS_URL=http://python-analytics.railway.internal:8000
   APP_SEED_DEMO_DATA=true   # si quieres que el botón demo funcione
   APP_SEED_ADMIN_EMAIL=<email-admin-demo>
   APP_SEED_ADMIN_PASSWORD=<algo-seguro>
   ```
4. El backend expone `PORT` automático en Railway — ya configurado en `application-prod.yml`.

**Fly.io** es similar: cada servicio con su `fly.toml`.

<br/>

## 🛡️ Seguridad

- JWT HS384 con secret de 48 bytes (configurable vía `JWT_SECRET`)
- Rate limiting en `/auth/login` y `/auth/register` (10 req/min/IP por defecto,
  ajustable con `APP_RATE_LIMIT_AUTH_MAX` y `APP_RATE_LIMIT_AUTH_WINDOW_SEC`)
- CORS configurable por dominio (`APP_CORS_ALLOWED_ORIGINS`)
- Self-register crea un equipo aislado por usuario — no hay acceso cruzado
- Contraseñas BCrypt cost 10
- Endpoints de actuator restringidos a `health,info` en perfil prod

**Lo que NO incluye** (es un portfolio, no un SaaS):
- Reset de contraseña por email
- Verificación de email
- 2FA
- CSRF (innecesario con JWT bearer)
- Política de privacidad / cookie consent (añadir antes de exponer públicamente con UE)

<br/>

## 🏗️ Arquitectura

```
                          ┌─────────────┐
                          │   Browser   │
                          └──────┬──────┘
                                 │ HTTPS
                          ┌──────▼──────┐
                          │   Nginx     │  (estáticos + /api proxy)
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

Comunicación interna en red Docker (`lapsight-network`).
El microservicio Python no se expone fuera — solo el backend lo consume.

<br/>

## 📂 Estructura

```
backend/
  src/main/java/com/lapsight/
    config/             # DataInitializer, DemoSeedService
    controller/         # REST endpoints
    dto/                # Request/Response objects
    model/              # JPA entities
    repository/         # Spring Data
    security/           # JWT + rate limit + Security config
    service/            # Lógica de negocio
  src/main/resources/
    application.yml, application-docker.yml, application-prod.yml
    db/migration/       # Flyway V1__ V2__ V3__ V4__

python/
  app/
    main.py             # FastAPI app
    analytics/          # core estadístico
    visualizations/     # Plotly

frontend/
  src/
    pages/              # Landing, Auth, Dashboard, Analytics, Circuits, ...
    components/apex/    # Design system primitives
    api/                # Axios clients
    store/              # Zustand
    theme/              # tokens.ts + muiTheme.ts
```

<br/>

## 📝 Decisiones de diseño notables

- **Sistema de diseño propio (Apex)**: tokens en `frontend/src/theme/tokens.ts`,
  override de MUI en `muiTheme.ts`, primitives en `components/apex/`. Reglas duras:
  `borderRadius: 0` (excepto círculos), sin box-shadows, surface stepping (`bg →
  surface → surface2 → surface3`), tabular-nums obligatorio en numéricos.
- **Microservicio Python aparte**: pandas/sklearn no son ergonómicos en Java
  y el ecosistema científico vive en Python. Spring Boot lo consume vía REST.
- **JWT stateless en lugar de sesiones**: simplifica el deploy multi-instancia
  y elimina sticky sessions.
- **Vite + proxy en dev**: HMR sin tener que reconstruir el contenedor.
- **Self-register con team aislado**: cada usuario crea su propio team al
  registrarse y es MANAGER de él — no hay datos compartidos entre cuentas
  reales (excepto en el equipo demo si está activado).

<br/>

## 📜 Licencia

[MIT](LICENSE) — siéntete libre de forkear y usarlo para lo que quieras.

<br/>

## 🙋 Autor

Hecho como proyecto de portfolio. Si lo despliegas o lo usas como base, me encantaría saberlo.
