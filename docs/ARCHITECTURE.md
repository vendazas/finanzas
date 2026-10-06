# Arquitectura

MiPlata usa Next.js App Router y Route Handlers, sin servidor Express separado.
Las rutas bajo `src/app/api` se limitan a autenticación, validación de entrada y
serialización de respuestas. La lógica está en `src/services`; el acceso a
Sequelize y SQL parametrizado en `src/repositories`; los modelos y asociaciones
residen en `src/models`.

```text
Route Handler → Service → Repository → Sequelize → PostgreSQL
```

`src/lib/sequelize.js` cachea el cliente en desarrollo para que el hot reload no
abra conexiones adicionales. `proxy.js` protege las pantallas privadas y los
servicios vuelven a comprobar `usuario_id`, que es la barrera de autorización
real. Los componentes compartidos están en `src/components`; las reglas y los
cálculos monetarios están en `src/utils` y `src/services`.

Las escrituras que generan varias filas, especialmente transferencias, usan una
transacción de Sequelize. Los handlers responden con `{ success, data }` o
`{ success: false, message, errors }`.
