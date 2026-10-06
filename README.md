# MiPlata

MiPlata es una aplicación web de finanzas personales. Centraliza cuentas,
movimientos, planificación, deudas, tarjetas, metas y patrimonio sin mezclar
monedas. Es responsive y se puede instalar como PWA.

## Tecnologías

- Next.js 16 con App Router y Route Handlers.
- React 19 y JavaScript; no utiliza TypeScript.
- Tailwind CSS para la interfaz responsive.
- PostgreSQL como base de datos.
- Sequelize ORM con `pg`.
- PWA: manifiesto, iconos y service worker.

La arquitectura de las operaciones es:

```text
UI → Route Handler → Service → Repository → Sequelize → PostgreSQL
```

Los servicios contienen reglas financieras; los repositorios concentran las
consultas parametrizadas. Los importes usan `NUMERIC`/`DECIMAL`, nunca `FLOAT`.

## Requisitos

- Node.js 20 o superior.
- npm.
- PostgreSQL en ejecución.
- Una base de datos vacía para MiPlata.

## Configuración y arranque

1. Instala dependencias:

   ```powershell
   npm install
   ```

2. Copia `.env.example` como `.env.local` y configura los valores:

   ```env
   DATABASE_URL=postgres://usuario:contraseña@localhost:5432/MiPlata
   JWT_SECRET=usa_un_secreto_largo_y_aleatorio
   NEXT_PUBLIC_APP_NAME=MiPlata
   PORT=3011
   ```

   `PORT` es leído por `npm run dev` y `npm run start`. Elige un puerto libre.

3. Crea o actualiza la estructura y carga catálogos iniciales:

   ```powershell
   npm run db:setup
   ```

   Si la base ya existe, usa `npm run db:migrate` y, solo si faltan catálogos,
   `npm run db:seed`.

4. Inicia en desarrollo:

   ```powershell
   npm run dev
   ```

5. Para producción:

   ```powershell
   npm run build
   npm run start
   ```

## Comandos disponibles

| Comando | Propósito |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo desarrollo usando `PORT`. |
| `npm run build` | Genera el build de producción. |
| `npm run start` | Sirve el build de producción. Requiere ejecutar build antes. |
| `npm run lint` | Ejecuta ESLint. |
| `npm test` | Ejecuta pruebas de precisión decimal. |
| `npm run db:migrate` | Aplica migraciones incrementales. |
| `npm run db:seed` | Inserta BOB, USD, tipos de cuenta y categorías base. |
| `npm run db:verify` | Comprueba tablas y catálogos de PostgreSQL. |

No uses `sequelize.sync({ force: true })` ni modifiques migraciones ya aplicadas.
Las nuevas modificaciones del esquema deben ser migraciones incrementales en
`database/migrations`.

## Módulos

### Autenticación

Registro, inicio/cierre de sesión, perfil y cambio de contraseña. Las cookies
son HTTP-only y las rutas privadas se protegen en servidor.

### Dashboard

Muestra saldo por moneda, cuentas, ingresos, gastos, ahorro, presupuestos y
movimientos recientes. No suma BOB y USD directamente.

### Cuentas

Administra cuentas de banco, efectivo, billetera, ahorro, inversión u otro tipo.
El saldo se reconstruye desde saldo inicial y movimientos; no depende de un
campo mutable de saldo actual.

### Movimientos y transferencias

Registra ingresos, gastos, ajustes y transferencias. Una transferencia crea una
salida y una entrada dentro de una transacción PostgreSQL. Las anulaciones son
lógicas y auditadas.

### Presupuestos y recurrentes

Los presupuestos se crean por categoría y moneda, con periodicidad mensual o
semanal (lunes a domingo). El gasto se calcula desde movimientos reales; el
progreso informa normal, advertencia o peligro. Los recurrentes generan
movimientos de forma idempotente.

### Tarjetas de crédito

Registra tarjetas sin almacenar su número completo, consumos, cuotas y pagos.
El consumo aumenta la deuda de tarjeta sin descontar una cuenta. El pago reduce
la cuenta origen y la deuda, sin duplicar el gasto.

### Deudas

Gestiona `YO_DEBO` y `ME_DEBEN`, pagos parciales, estados e historial. Un pago
crea gasto o ingreso según el tipo y actualiza la deuda en una transacción.

### Metas de ahorro

Define objetivos y aportes desde cuentas. Un aporte reserva dinero ya existente:
incrementa el progreso de la meta, pero no crea un gasto ni aumenta patrimonio.

### Calendario financiero

En escritorio se presenta como calendario mensual en cuadrícula; en móvil como
agenda diaria. Muestra eventos y totales reales de ingresos y gastos por día.

### Patrimonio

Consolida saldos de cuentas, activos, cuentas por cobrar, deudas y tarjetas por
moneda. Los activos conservan valoraciones históricas. Las metas no se vuelven a
sumar, porque ya forman parte de las cuentas.

### Reportes y configuración

Reportes agrega indicadores y consultas por período, cuenta, categoría y moneda.
Configuración concentra preferencias de la aplicación.

## Seguridad y datos

- Nunca subas `.env.local`, secretos ni datos financieros personales.
- Cada operación obtiene el usuario desde la sesión; no acepta `usuario_id` del
  frontend como fuente de autoridad.
- Las consultas se filtran por propietario y usan parámetros SQL.
- Las operaciones financieras relevantes usan auditoría, restricciones,
  claves foráneas y transacciones.

## Documentación adicional

- [Arquitectura](docs/ARCHITECTURE.md)
- [Base de datos](docs/DATABASE.md)
- [Reglas financieras](docs/FINANCIAL_RULES.md)
- [API](docs/API.md)
- [Despliegue](docs/DEPLOYMENT.md)
