# Programa de Finanzas Personal

Sistema personal de gestión financiera desarrollado con arquitectura moderna para controlar ingresos, gastos, deudas, tarjetas de crédito, amortización, pagos mensuales, reportes financieros y recordatorios automáticos.

## Objetivo del proyecto

Construir una aplicación segura para administración financiera personal que permita:

- Registro e inicio de sesión seguro
- Gestión de usuarios autenticados
- Registro de ingresos
- Registro de gastos
- Control de deudas bancarias
- Gestión de tarjetas de crédito
- Tabla de amortización automática
- Registro de pagos mensuales
- Reportes financieros
- Recordatorios automáticos por correo electrónico

---

# Arquitectura del proyecto

## Backend

Tecnologías utilizadas:

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt
- Docker
- Helmet
- CORS
- Morgan
- dotenv

---

# Estado actual del proyecto

## Sprint 1 completado

Actualmente el proyecto cuenta con:

### Infraestructura

- Docker Desktop configurado
- Contenedor PostgreSQL 16 funcionando
- Base de datos creada:

```txt
finanzas_db
```

- Usuario PostgreSQL:

```txt
finanzas_user
```

- Puerto:

```txt
5432
```

- Gestión visual mediante DBeaver

---

### Backend funcional

Backend Express configurado con:

- Express
- Helmet
- CORS
- Morgan
- dotenv
- PostgreSQL connection pool
- Prisma ORM

---

### Seguridad implementada

Autenticación JWT completa:

- Registro de usuarios
- Inicio de sesión
- Middleware de autenticación
- Protección de rutas privadas

Protección de contraseñas:

- bcrypt hashing

---

### Endpoints disponibles

#### Health Check

```http
GET /health
```

Respuesta:

```json
{
  "message": "Backend finanzas funcionando"
}
```

---

#### Registro

```http
POST /api/auth/register
```

Body:

```json
{
  "nombre": "Jefferson",
  "email": "jeff@test.com",
  "password": "123456"
}
```

---

#### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "jeff@test.com",
  "password": "123456"
}
```

---

#### Perfil autenticado

```http
GET /api/auth/profile
```

Header:

```txt
Authorization: Bearer TOKEN
```

---

# Estructura del proyecto

```txt
programa-finanzas/
│
├── backend/
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.routes.js
│   │   │   │
│   │   │   ├── users/
│   │   │   ├── ingresos/
│   │   │   ├── gastos/
│   │   │   ├── deudas/
│   │   │   ├── tarjetas/
│   │   │   ├── amortizacion/
│   │   │   ├── pagos/
│   │   │   ├── reportes/
│   │   │   └── recordatorios/
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── password.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

# Instalación desde cero

## 1. Clonar repositorio

```bash
git clone https://github.com/jsmasapanta/Programa--finanzas.git
```

Entrar:

```bash
cd Programa--finanzas
```

---

## 2. Requisitos

Instalar:

- Node.js 20+
- Docker Desktop
- Git
- DBeaver (opcional)
- Postman o Thunder Client

---

## 3. Levantar PostgreSQL con Docker

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Verificar:

```bash
docker ps
```

Debe aparecer:

```txt
finanzas_postgres
```

Puerto:

```txt
5432
```

---

## 4. Entrar al backend

```bash
cd backend
```

---

## 5. Instalar dependencias

```bash
npm install
```

---

## 6. Configurar variables de entorno

Crear archivo:

```txt
.env
```

Contenido:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finanzas_db
DB_USER=finanzas_user
DB_PASSWORD=finanzas_pass
JWT_SECRET=finanzas_super_secret_2026
JWT_EXPIRES_IN=7d
DATABASE_URL="postgresql://finanzas_user:finanzas_pass@localhost:5432/finanzas_db"
```

---

## 7. Generar cliente Prisma

```bash
npx prisma generate
```

---

## 8. Ejecutar migraciones

```bash
npx prisma migrate dev
```

---

## 9. Levantar backend

```bash
npm run dev
```

Respuesta esperada:

```txt
PostgreSQL conectado
Servidor corriendo en puerto 4000
```

---

## 10. Verificar backend

Abrir:

```txt
http://localhost:4000/health
```

Respuesta:

```json
{
  "message": "Backend finanzas funcionando"
}
```

---

# Base de datos

Actualmente existe tabla:

## User

Campos:

- id
- nombre
- email
- password
- moneda
- salarioMensual
- alertasActivas
- createdAt
- updatedAt

---

# Seguridad implementada

## JWT

Protección mediante token Bearer.

---

## bcrypt

Contraseñas cifradas.

---

## Helmet

Protección de cabeceras HTTP.

---

## CORS

Configurado para comunicación frontend/backend.

---

# Próximas funcionalidades

## Sprint 2

- CRUD ingresos
- CRUD gastos

## Sprint 3

- deudas bancarias
- tarjetas de crédito

## Sprint 4

- pagos mensuales
- amortización automática

## Sprint 5

- dashboard financiero
- reportes

## Sprint 6

- recordatorios automáticos por correo

---

# Autor

Jefferson Masapanta

Ingeniería de Software  
ESPE