# MiPlata

Aplicación de finanzas personales construida con Next.js App Router, JavaScript,
PostgreSQL y Sequelize. La interfaz es responsive y puede instalarse como PWA.

## Desarrollo

1. Copia `.env.example` a `.env.local` y define `DATABASE_URL`, `JWT_SECRET` y
   `PORT` (por ejemplo, `3010`). Los comandos `dev` y `start` leen ese valor y
   lo pasan explícitamente a Next.js.
2. Instala dependencias: `npm install`.
3. Crea el esquema y catálogos: `npm run db:setup`.
4. Inicia el sitio: `npm run dev`.

Comprobaciones: `npm run lint`, `npm run db:verify` y `npm run build`.

## Datos y despliegue

Las migraciones viven en `database/migrations` y los datos iniciales en
`database/seeders`; los runners permiten ejecutarlos repetidamente. No uses
`sequelize.sync({ force: true })`. En producción configura secretos fuera del
repositorio, ejecuta migraciones antes de iniciar y sirve siempre mediante HTTPS.
Consulta `docs/DEPLOYMENT.md` para el procedimiento completo.
