# 🎨 Finanzas App — Frontend

## Stack
- **React 18** + Vite
- **Framer Motion** — animaciones y transiciones
- **Recharts** — gráficas financieras
- **React Router v6** — navegación
- **Axios** — llamadas a la API con interceptores JWT
- **React Hot Toast** — notificaciones

## Setup

```bash
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y hace proxy a `http://localhost:3000` (backend).

Si tu backend corre en otro puerto, edita `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:TU_PUERTO',
    changeOrigin: true
  }
}
```

## Estructura

```
src/
├── components/
│   ├── layout/       # Sidebar, AppLayout, PageHeader
│   └── ui/           # Button, Modal, Badge, DataTable, StatCard, etc.
├── context/          # AuthContext (JWT + user state)
├── pages/            # Dashboard, Ingresos, Gastos, Deudas, Tarjetas,
│                     # Pagos, Amortizacion, Reportes, Perfil, Login, Register
├── services/         # api.js — todos los servicios REST
└── utils/            # helpers.js — formatMoney, formatDate, constantes
```

## Funcionalidades

| Página | Descripción |
|--------|-------------|
| Login / Register | Autenticación JWT con aurora animada |
| Dashboard | Resumen con gráfica de área, pie chart y próximas cuotas |
| Ingresos | CRUD completo con paginación |
| Gastos | CRUD con filtros por categoría y recurrencia |
| Deudas | CRUD con filtro por estado, muestra saldo pendiente |
| Tarjetas | Vista de cards con barra de uso de cupo animada |
| Pagos | Registro de pagos a deudas o tarjetas con selección dinámica |
| Amortización | Selección de deuda, generación automática de tabla, edición de estado |
| Reportes | 6 gráficas: KPIs, barras, pie, línea de flujo de caja, próximas cuotas |
| Perfil | Edición de nombre, moneda, salario y cambio de contraseña |
