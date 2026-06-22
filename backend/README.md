# 📊 API Finanzas Personales — v2.0

## Setup

```bash
npm install
cp .env.example .env
# Edita .env con tus credenciales

npm run db:generate   # Genera el cliente Prisma
npm run db:migrate    # Crea las tablas en PostgreSQL
npm run dev           # Inicia en desarrollo
```

---

## 🔐 Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

### Endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registrar usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| GET | `/api/auth/profile` | ✅ | Ver perfil |
| PATCH | `/api/auth/profile` | ✅ | Actualizar perfil / cambiar contraseña |

**Register body:**
```json
{ "nombre": "Ana", "email": "ana@mail.com", "password": "min6chars" }
```

**PATCH profile body (todos opcionales):**
```json
{
  "nombre": "Ana García",
  "moneda": "USD",
  "salarioMensual": 3000,
  "alertasActivas": true,
  "passwordActual": "antigua",
  "passwordNueva": "nueva123"
}
```
Monedas válidas: `USD | EUR | COP | MXN | ARS | CLP | PEN | BRL`

---

## 💰 Ingresos `/api/ingresos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear ingreso |
| GET | `/` | Listar (con paginación y filtros) |
| GET | `/:id` | Obtener por ID |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

**Filtros GET:** `?tipo=salario&fechaDesde=2025-01-01&fechaHasta=2025-12-31&page=1&limit=20`

**Body:**
```json
{ "tipo": "Salario", "monto": 3000, "fecha": "2025-06-01", "descripcion": "Sueldo junio" }
```

---

## 💸 Gastos `/api/gastos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear gasto |
| GET | `/` | Listar (con filtros) |
| GET | `/:id` | Obtener por ID |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar |

**Filtros GET:** `?categoria=Alimentación&subcategoria=Restaurantes&esRecurrente=true&fechaDesde=&fechaHasta=`

**Body:**
```json
{
  "categoria": "Alimentación",
  "subcategoria": "Supermercado",
  "monto": 250,
  "fecha": "2025-06-05",
  "esRecurrente": false,
  "descripcion": "Compra semanal"
}
```

---

## 🏦 Deudas `/api/deudas`

Tipos válidos: `CREDITO | HIPOTECA | VEHICULO | PERSONAL | TARJETA | OTRO`
Estados válidos: `ACTIVA | PAGADA | EN_MORA | REFINANCIADA`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear deuda |
| GET | `/` | Listar — filtros: `?estado=ACTIVA&tipo=PERSONAL` |
| GET | `/:id` | Detalle con últimos pagos y cuotas |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar (cascade: pagos y amortizaciones) |

**Body:**
```json
{
  "entidad": "Banco XYZ",
  "tipo": "PERSONAL",
  "montoOriginal": 10000,
  "saldoActual": 8500,
  "tasaInteres": 18.5,
  "cuotaMensual": 350,
  "fechaInicio": "2024-01-01",
  "fechaFin": "2026-12-01",
  "descripcion": "Crédito de consumo"
}
```

---

## 💳 Tarjetas `/api/tarjetas`

Franquicias: `VISA | MASTERCARD | AMEX | DINERS | DISCOVER | OTRA`
Estados: `ACTIVA | BLOQUEADA | CANCELADA`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Crear tarjeta |
| GET | `/` | Listar — filtro: `?estado=ACTIVA` |
| GET | `/:id` | Detalle con últimos pagos |
| PUT | `/:id` | Actualizar |
| DELETE | `/:id` | Eliminar (cascade: pagos) |

Respuesta incluye `disponible` (cupoTotal − saldoUsado) y `porcentajeUso`.

---

## 💳 Pagos `/api/pagos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/` | Registrar pago (actualiza saldo automáticamente) |
| GET | `/` | Listar — filtros: `?tipo=DEUDA&fechaDesde=&fechaHasta=` |
| GET | `/:id` | Obtener por ID |

**Body pago de deuda:**
```json
{ "tipo": "DEUDA", "monto": 500, "fechaPago": "2025-06-10", "deudaId": 1 }
```

**Body pago de tarjeta:**
```json
{ "tipo": "TARJETA", "monto": 300, "fechaPago": "2025-06-10", "tarjetaId": 2 }
```

---

## 📅 Amortización `/api/amortizacion`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/generar/:deudaId` | **Genera tabla automáticamente** desde datos de la deuda |
| POST | `/` | Crear cuota manual |
| GET | `/deuda/:deudaId` | Listar cuotas de una deuda — filtro: `?estado=PENDIENTE` |
| GET | `/cuota/:id` | Obtener cuota por ID |
| PUT | `/:id` | Actualizar cuota |
| DELETE | `/:id` | Eliminar cuota |

> `POST /generar/:deudaId` requiere que la deuda tenga `tasaInteres`, `cuotaMensual` y `fechaInicio`.

---

## 📊 Reportes `/api/reportes`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/resumen` | Resumen financiero completo |
| GET | `/gastos-categoria` | Gastos agrupados con `%` — filtros de fecha |
| GET | `/ingresos-vs-gastos` | Comparativa mensual — `?meses=6` |
| GET | `/deudas` | Resumen de deudas con % pagado |
| GET | `/proximos-pagos` | Cuotas y tarjetas próximas — `?dias=30` |
| GET | `/flujo-caja` | Proyección de pagos por mes — `?meses=3` |

---

## 📦 Respuesta paginada

Todos los listados devuelven:
```json
{
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## ❌ Respuesta de error

```json
{ "message": "Descripción del error" }
```
Validaciones (422):
```json
{
  "message": "Error de validación",
  "errors": [{ "field": "monto", "message": "El monto debe ser mayor a 0" }]
}
```
