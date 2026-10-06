# Despliegue

Configure `DATABASE_URL`, `JWT_SECRET` largo y aleatorio, `NEXT_PUBLIC_APP_NAME`
y `NODE_ENV=production` en el entorno de despliegue. Nunca versionar `.env.local`.
Use PostgreSQL administrado con copias de seguridad, TLS y una cuenta con mínimos
privilegios.

Antes de publicar ejecute:

```powershell
npm ci
npm run db:migrate
npm run db:seed
npm run lint
npm run build
```

Inicie con `npm run start` detrás de HTTPS. Las cookies de sesión pasan a ser
`Secure` en producción. El limitador actual es local al proceso; en despliegues
con múltiples instancias debe sustituirse por Redis, la pasarela o un WAF. La PWA
se instala desde el navegador con el manifiesto y service worker incluidos.
