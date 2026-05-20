# LapSight 🏁

> **See every lap.**

Plataforma de **análisis de telemetría y estadística** para equipos de motorsport.
Importa datos de las herramientas que ya usas (AiM, MoTeC, RaceChrono, iRacing,
MyLaps, VBox, RaceLogic, Race Technology) y los analiza de forma cruzada entre
sesiones, pilotos y circuitos con tests estadísticos formales.

## ✨ Lo que hace bien

### Análisis de telemetría (core)
- **Importadores multi-fuente**: AiM, MoTeC, RaceChrono, iRacing, MyLaps, VBox /
  Circuit Tools, Race Technology DL2/DL3, Apex Pro, Harry's LapTimer y CSV genérico
- **Métricas por sesión**: mejor vuelta, vuelta teórica, gap por sector,
  degradación lineal (R²), outliers automáticos
- **Consistencia formal**: coeficiente de variación, IQR, hot-lap window,
  pace-windows (1/2/5% del best), sector más variable, consistency score 0-100
- **Detección de stints**: clustering automático por compound o por pace (KMeans 1D)
- **Comparativa multi-piloto / multi-sesión**: hasta 4 sesiones lado a lado
- **Anomalías**: Isolation Forest sobre tiempos por vuelta
- **Track maps reales**: 38 circuitos con coordenadas GPS reales (F1 + MotoGP +
  variantes) y sectores coloreados por rendimiento
- **Insights automáticos**: explicaciones en lenguaje natural sobre cada sesión
- **Reports PDF**: descarga de informe completo por sesión

### Contexto operativo (necesario para el análisis)
- Equipos, pilotos, vehículos y eventos (CRUDs ligeros)
- Calendario de eventos
- Galería de circuitos con récords personales, notas técnicas y comparador
- Autenticación JWT con roles

## Categorías de vehículos soportadas

### Coches
- **Fórmula**: F1, F2, F3, F4, Formula Ford
- **GT/Resistencia**: GT3, GT4, LMP, Prototype
- **Turismos**: TCR, WTCC, Supercars
- **Rally**: WRC, R5, Historic Rally
- **Monoplazas**: IndyCar, Formula E
- **Drift/Autocross**: Drift Pro, Time Attack

### Motos
- **Circuito**: MotoGP, Moto2, Moto3, Superbike, Supersport
- **Endurance**: EWC, Bol d'Or, 24h
- **Motocross**: MXGP, MX2, EMX
- **Enduro**: EnduroGP, ISDE
- **Trial**: TrialGP, Trial2
- **Velocidad**: Naked, Sport, Classic

## 🛠️ Tecnologías

### Backend
- **Java 17** con **Spring Boot 3.2**
- **Spring Security** para autenticación y autorización
- **Spring Data JPA** para persistencia
- **PostgreSQL** como base de datos
- **Flyway** para migraciones de base de datos
- **Maven** para gestión de dependencias

### Frontend
- **React 18** con **TypeScript**
- **Material-UI (MUI)** para componentes de interfaz
- **Zustand** para gestión de estado
- **React Router** para navegación
- **Axios** para comunicación con API
- **date-fns** para manejo de fechas

### DevOps
- **Docker** y **Docker Compose** para containerización
- **GitHub Actions** para CI/CD
- **Nginx** para servir el frontend en producción
- **Integraciones**: Apple Calendar, Google Calendar

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Java 17+ (para desarrollo local)
- Node.js 18+ (para desarrollo local)
- Maven 3.8+ (para desarrollo local)

### Instalación con Docker

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd lapsight
   ```

2. **Ejecutar con Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Adminer (DB Admin): http://localhost:8081

### Desarrollo Local

#### Backend

1. **Configurar base de datos PostgreSQL**
   ```bash
   docker run --name lapsight-postgres \
     -e POSTGRES_DB=lapsight_db \
     -e POSTGRES_USER=lapsight_user \
     -e POSTGRES_PASSWORD=lapsight_pass \
     -p 5432:5432 -d postgres:15
   ```

2. **Ejecutar backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

#### Frontend

1. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

2. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   ```

## 📁 Estructura del Proyecto

```
lapsight/
├── backend/                    # Aplicación Spring Boot
│   ├── src/main/java/
│   │   └── com/lapsight/
│   │       ├── config/         # Configuraciones
│   │       ├── controller/     # Controladores REST
│   │       ├── entity/         # Entidades JPA
│   │       ├── enums/          # Enumeraciones
│   │       ├── repository/     # Repositorios
│   │       ├── service/        # Servicios de negocio
│   │       └── dto/            # Data Transfer Objects
│   ├── src/main/resources/
│   │   ├── db/migration/       # Scripts Flyway
│   │   └── application*.yml    # Configuraciones
│   └── Dockerfile
├── frontend/                   # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas principales
│   │   ├── store/              # Estado global (Zustand)
│   │   ├── types/              # Tipos TypeScript
│   │   └── utils/              # Utilidades
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml          # Orquestación de servicios
├── .github/workflows/          # CI/CD con GitHub Actions
└── README.md
```

## 🔧 Configuración

### Variables de Entorno

#### Backend
```env
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/lapsight_db
SPRING_DATASOURCE_USERNAME=lapsight_user
SPRING_DATASOURCE_PASSWORD=lapsight_pass
JWT_SECRET=your-jwt-secret-key
```

#### Frontend
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development
```

## 🗃️ Base de Datos

### Esquema Principal

- **teams**: Información de equipos
- **users**: Usuarios del sistema
- **vehicles**: Vehículos del equipo
- **events**: Eventos y carreras
- **maintenance_records**: Registros de mantenimiento
- **event_participants**: Relación muchos a muchos entre eventos y usuarios
- **event_vehicles**: Relación muchos a muchos entre eventos y vehículos

### Migraciones

Las migraciones se ejecutan automáticamente con Flyway al iniciar la aplicación.

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

- **Roles disponibles**: ADMIN, TEAM_MANAGER, MECHANIC, DRIVER, VIEWER
- **Endpoints protegidos**: Mayoría de endpoints requieren autenticación
- **Autorización**: Basada en roles para diferentes funcionalidades

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Equipos
- `GET /api/teams` - Listar equipos
- `POST /api/teams` - Crear equipo
- `GET /api/teams/{id}` - Obtener equipo
- `PUT /api/teams/{id}` - Actualizar equipo

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/{id}` - Obtener usuario
- `PUT /api/users/{id}` - Actualizar usuario

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `POST /api/vehicles` - Crear vehículo
- `GET /api/vehicles/{id}` - Obtener vehículo
- `PUT /api/vehicles/{id}` - Actualizar vehículo

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `GET /api/events/{id}` - Obtener evento
- `PUT /api/events/{id}` - Actualizar evento

## 🧪 Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm test
```

### Cobertura
```bash
# Backend
mvn test jacoco:report

# Frontend
npm test -- --coverage
```

## 🚀 Despliegue

### Producción con Docker

1. **Construir imágenes**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Desplegar**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### CI/CD

El proyecto incluye GitHub Actions para:
- Ejecutar tests automáticamente
- Construir y publicar imágenes Docker
- Escaneo de seguridad con Trivy
- Despliegue automático a staging/producción

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [TuGitHub](https://github.com/tuusuario)

## 🙏 Agradecimientos

- Spring Boot community
- React community
- Material-UI team
- Todos los contribuidores del proyecto

---

**¿Necesitas ayuda?** Abre un [issue](https://github.com/jorgeoliver7/LapSight/issues) o contacta al equipo de desarrollo.

## Instalación rápida

```bash
# Clonar y arrancar con Docker
git clone <repo>
cd lapsight
docker-compose up -d

# La app estará en http://localhost:3000
# API en http://localhost:8080
```

## Roadmap

El foco de la app es el **análisis de telemetría**. Los siguientes puntos están
priorizados sobre el resto:

### Hecho
- Importadores AiM, MoTeC, RaceChrono, iRacing, MyLaps, VBox, Race Technology,
  Apex Pro, Harry's LapTimer
- Stint detection por compound y por pace (KMeans 1D)
- Degradación lineal + polinómica con R²
- Anomalías por Isolation Forest
- Insights automáticos por sesión
- Consistencia (CV, IQR, hot-lap window, pace-windows, sector más variable)
- Comparativa multi-sesión hasta 4 vías
- Track maps GPS reales (38 circuitos + variantes)
- Galería de circuitos con récords personales y notas técnicas
- Reports PDF por sesión

### Próximos pasos prioritarios
- **Predicción de tiempos** condicionada por circuito + condiciones + compound
- **Degradación por stint individual** (no sólo lineal global)
- **Comparativa de compounds** (delta esperado Soft vs Medium en condiciones similares)
- **Heatmap de telemetría posicional** (cuando los importadores tengan GPS denso)
- **Más importadores nativos**: AiM SmartyCam .xrk, MoTeC .ld

### Fuera de scope (postergado indefinidamente)
Estas funcionalidades aparecieron en versiones tempranas del roadmap pero no
encajan con el foco actual. Cualquier equipo las cubre mejor con herramientas
generalistas (Excel, Notion, Airtable):

- ~~Inventario de piezas con QR~~
- ~~Viajes y logística~~
- ~~Sponsors y contratos~~
- ~~Finanzas / presupuestos detallados~~ (sólo budget agregado por evento)

Si necesitas alguna de estas, hay productos especializados que las hacen mejor.

## Licencia

MIT License