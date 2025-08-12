# Racing Team Management System 🏁

Sistema integral de gestión para equipos de racing (automóviles y motocicletas) que permite administrar vehículos, miembros del equipo, eventos, mantenimiento y más.

## ✨ Características Principales

- **Gestión de Equipos**: Administración completa de equipos de racing
- **Gestión de Vehículos**: Control de inventario y estado de vehículos
- **Gestión de Usuarios**: Manejo de miembros del equipo con roles específicos
- **Calendario de Eventos**: Planificación y seguimiento de carreras y eventos
- **Mantenimiento**: Registro y seguimiento de mantenimiento preventivo y correctivo
- **Dashboard**: Visualización de métricas y estadísticas importantes
- **Autenticación**: Sistema seguro de login con roles de usuario
- **Responsive Design**: Interfaz adaptable a dispositivos móviles
- **Inventario de piezas**: Control con QR, vida útil, ubicaciones
- **Viajes y logística**: Itinerarios, alojamientos, gastos
- **Sponsors**: Contratos, entregables, evidencias
- **Finanzas básicas**: Presupuestos, gastos, exportación

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
   cd racing-team-management
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
   docker run --name postgres-racing \
     -e POSTGRES_DB=racing_team \
     -e POSTGRES_USER=racing_user \
     -e POSTGRES_PASSWORD=racing_password \
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
racing-team-management/
├── backend/                    # Aplicación Spring Boot
│   ├── src/main/java/
│   │   └── com/racingteam/
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
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/racing_team
SPRING_DATASOURCE_USERNAME=racing_user
SPRING_DATASOURCE_PASSWORD=racing_password
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

**¿Necesitas ayuda?** Abre un [issue](https://github.com/tuusuario/racing-team-management/issues) o contacta al equipo de desarrollo.

## Instalación rápida

```bash
# Clonar y arrancar con Docker
git clone <repo>
cd racing-team-management
docker-compose up -d

# La app estará en http://localhost:3000
# API en http://localhost:8080
```

## Roadmap MVP (4-6 semanas)

1. **Semana 1**: Auth, equipos, calendario básico
2. **Semana 2**: Personas, inventario, QR
3. **Semana 3**: Vehículos, mantenimientos
4. **Semana 4**: Viajes, gastos, exportación
5. **Semana 5-6**: Sponsors, integración calendarios

## Licencia

MIT License