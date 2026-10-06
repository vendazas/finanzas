# API

Todas las rutas devuelven JSON: éxito con `{ "success": true, "data": ... }`
y error con `{ "success": false, "message": "...", "errors": [] }`.

## Autenticación

`POST /api/auth/register`, `POST /api/auth/login` crean una sesión HTTP-only;
`POST /api/auth/logout` la elimina. Perfil y cambio de contraseña viven bajo
`/api/auth`. Las operaciones de escritura verifican sesión y pertenencia de los
recursos en el servidor.

## Finanzas

`/api/cuentas`, `/api/movimientos`, `/api/transferencias`, `/api/presupuestos`,
`/api/tarjetas`, `/api/deudas`, `/api/metas`, `/api/patrimonio` y `/api/reportes`
son rutas privadas. El listado de movimientos acepta paginación y filtros de
fecha, cuenta, categoría, tipo, moneda y texto. `POST
/api/movimientos/:id/anular` realiza una anulación lógica auditada.

Las peticiones mutables comprueban `Origin` cuando el navegador lo envía. No se
deben enviar contraseñas hash ni secretos en respuestas o registros.
