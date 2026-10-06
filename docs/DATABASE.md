# Base de datos

## Tablas y relaciones

`usuarios` es propietario de cuentas, categorías, tipos de cambio,
transferencias, movimientos y los módulos financieros posteriores. Cada cuenta
pertenece a un tipo y una moneda. Las categorías pueden ser globales o de un
usuario y tener padre. Un movimiento pertenece a cuenta, usuario y, de forma
opcional, categoría; una transferencia une cuenta origen, cuenta destino y dos
movimientos relacionados.

Presupuestos y recurrentes se relacionan con usuario, cuenta/categoría y moneda.
Tarjetas, deudas, metas, aportes, activos y valoraciones preservan sus relaciones
mediante claves foráneas `RESTRICT`.

## Integridad y saldos

Los importes usan `NUMERIC`/`DECIMAL`; nunca `FLOAT`. El saldo se calcula desde
movimientos y saldo inicial, no desde un saldo actual mutable. Hay índices para
usuario/fecha, cuenta/fecha, categorías, transferencias, reportes y pagos.

Las transferencias se crean en una transacción: transferencia, salida y entrada.
Un fallo deshace las tres filas. Los listados filtran por `usuario_id`, usan SQL
parametrizado y paginación.

## Auditoría y retención

Movimientos y transferencias usan `deleted_at`; no se borran físicamente.
`auditoria_financiera` es append-only y almacena usuario, entidad, identificador,
acción, datos JSONB antes/después y fecha. Está indexada por usuario, entidad,
identificador y fecha para trazabilidad.

## Migraciones y seeders

Ejecuta `npm run db:migrate`, `npm run db:seed` y `npm run db:verify`. Los
runners registran su estado y son idempotentes. Los seeders incluyen BOB, USD,
tipos de cuenta y categorías base. No se debe usar `sync({ force: true })`.
