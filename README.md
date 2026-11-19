# Skyline Web

Frontend en Angular de **Skyline**. Consume la API del backend de la Entrega 2.

**Nicho:** reserva de vuelos. Las aerolíneas (vendedores) publican sus aviones, tramos y servicios extra. Los clientes (compradores) buscan vuelos, reservan, eligen asiento, maletas y servicios extra, y pagan.

**Integrantes:**
- Laura Duarte
- Joab Suárez

**Repositorios:**
- Frontend: https://github.com/LauraDuarte720/skyline-web
- Backend: https://github.com/Joab-SC/skyline

**Tecnologías:** Angular 22 (componentes standalone y signals), Bootstrap 5.3, Font Awesome 7 y RxJS. El backend usa Spring Boot con Java 21, JWT y H2.

## Cómo ejecutar

### 1. Backend

Requisito: Java 21. No hay que instalar Gradle ni una base de datos, porque el proyecto trae el wrapper de Gradle y usa H2 en memoria. Al arrancar, H2 se llena con `data.sql`.

```bash
git clone https://github.com/Joab-SC/skyline.git
cd skyline
./gradlew bootRun        # en Windows: gradlew.bat bootRun
```

El backend queda en `http://localhost:8080`, y Swagger en `http://localhost:8080/swagger-ui.html`.
Por defecto acepta peticiones de `http://localhost:4200` (CORS). Para otro origen, se define la variable `CORS_ALLOWED_ORIGINS`.

### 2. Frontend

Requisitos: Node.js 22 o superior y npm.

```bash
git clone https://github.com/LauraDuarte720/skyline-web.git
cd skyline-web
npm install
npm start                # equivale a ng serve
```

Luego se abre `http://localhost:4200`.

La dirección de la API **no está escrita en los componentes ni en los servicios**. Sale de `src/environments/`:
- `ng serve` (desarrollo) usa `environment.development.ts`.
- `ng build` (producción) usa `environment.ts`.

Para trabajar con el backend local, el archivo que se esté usando debe tener `apiUrl: 'http://localhost:8080/api'`.

## Usuarios de prueba

Los crea el backend al arrancar. Las contraseñas son solo para desarrollo.

| Correo | Contraseña | Rol | Aerolínea |
|---|---|---|---|
| admin@skyline.com | admin123 | ADMIN (administrador de la plataforma) | — |
| airline1@skyline.com | airline123 | AIRLINE_ADMIN (administrador de aerolínea) | Avianca |
| airline2@skyline.com | airline123 | AIRLINE_ADMIN (administrador de aerolínea) | Wingo |
| seller1@skyline.com | seller123 | AIRLINE_SELLER (vendedor de aerolínea) | Avianca |
| customer1@skyline.com | customer123 | CUSTOMER (comprador) | — |

También se puede crear un comprador nuevo desde **Registrarse**.

El flujo de reserva también funciona sin sesión (como invitado). Si se reserva con la sesión de un CUSTOMER, la reserva queda ligada a esa cuenta y aparece en **Mis reservas**.

**Para probar la búsqueda:** los datos de prueba tienen vuelos de Bogotá (BOG) a Medellín (MDE) el 1 de diciembre de 2026.

## Pantallas

### Públicas

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/` | Inicio | Destinos destacados y aerolíneas con sus servicios extra. Todo sale del backend. |
| `/login` | Iniciar sesión | Formulario reactivo con validaciones. Guarda el token JWT. Solo se puede abrir sin sesión (`guestGuard`). |
| `/register` | Registrarse | Crea una cuenta de comprador. Solo se puede abrir sin sesión (`guestGuard`). |
| `/catalogue` | Buscar vuelos | Busca vuelos por origen, destino, fecha y pasajeros, de solo ida o de ida y vuelta, y los muestra en tarjetas. |

### Flujo de reserva

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/book` | Resumen de vuelos | Confirma los vuelos elegidos y crea la reserva. |
| `/passengers` | Pasajeros | Datos de los pasajeros y del titular. |
| `/seat-selector` | Asientos | Mapa de asientos de cada tramo. |
| `/luggage` | Equipaje | Maletas por pasajero. |
| `/extra-services` | Servicios extra | Catálogo **paginado** (Anterior / Siguiente, "Página X de Y") con **búsqueda por texto** mientras se escribe (debounce). Los servicios eliminados (soft delete) no aparecen. |
| `/payment` | Pago | Formulario de pago simulado. |
| `/confirmation` | Confirmación | Resumen de la reserva pagada. |

Las páginas del flujo tienen `leaveBookingGuard`. Si alguien sale sin terminar, se le pregunta, y si confirma, la reserva se cancela.

### Comprador (CUSTOMER)

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/my-bookings` | Mis reservas | Reservas del cliente con la sesión iniciada. |

### Aerolínea (AIRLINE_ADMIN y AIRLINE_SELLER)

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/airline` | Mi aerolínea | Panel con las opciones de la aerolínea. |
| `/airline/aircrafts` | Aviones | Lista y creación de aviones. |
| `/airline/legs` | Tramos | Lista paginada y creación de tramos. |
| `/airline/extra-services` | Servicios extra | Lista paginada con búsqueda, creación y eliminación. |
| `/airline/sellers` | Vendedores | Lista y registro de vendedores. **Solo AIRLINE_ADMIN.** |

### Administrador (ADMIN)

| Ruta | Pantalla | Qué hace |
|---|---|---|
| `/admin` | Administración | Panel del administrador. |
| `/admin/airlines` | Aerolíneas | Lista y creación de aerolíneas. |
| `/admin/airline-admins` | Administradores de aerolínea | Registro de administradores de cada aerolínea. |

Las rutas por rol usan `roleGuard`. Sin sesión, mandan al login. Con otro rol, mandan al inicio con un aviso. El menú solo muestra las opciones del rol de quien inició sesión.

Los guards son una comodidad para el usuario. La seguridad real la pone el backend, que revisa el token y el rol en cada petición.

## Cómo está organizado

```
src/app/
├── components/    pantallas y componentes (header, footer, notificaciones, tarjeta de vuelo...)
├── flights/       interfaces que reflejan los DTOs del backend
├── services/      un servicio por grupo de endpoints (AuthService, BookingService, FlightService...)
├── guards/        authGuard / guestGuard, roleGuard y leaveBookingGuard
├── interceptor/   agrega "Authorization: Bearer <token>" y maneja el 401 (sesión vencida)
└── validators/    validadores propios de formularios
```
