# Reglas financieras

Todos los importes se almacenan como `NUMERIC`/`DECIMAL`, nunca como `FLOAT`.
El saldo de una cuenta se reconstruye: saldo inicial + ingresos + transferencias
de entrada + ajustes positivos − gastos − transferencias de salida − ajustes
negativos. Las filas anuladas no participan en los cálculos.

Un ingreso o gasto pertenece a una cuenta y categoría. Una transferencia crea,
en una única transacción, una transferencia, una salida y una entrada. Entre
monedas distintas exige tipo de cambio; los totales se muestran separados por
moneda y solo se convierten cuando existe una cotización válida.

Un consumo de tarjeta registra gasto y deuda; su pago desde una cuenta reduce la
deuda y no crea otro gasto. Deudas admiten pagos parciales e historial.
Presupuestos calculan gastado desde movimientos, no lo duplican. Aportes a metas
se relacionan con cuentas sin crear dinero. Patrimonio suma cuentas, activos y
cuentas por cobrar, y resta tarjetas y deudas.

Las operaciones financieras no se borran físicamente. La anulación aplica soft
delete y registra motivo; transferencias deben anularse como conjunto. Creación,
modificación y anulación relevantes se registran en `auditoria_financiera` con
usuario, entidad, instantánea anterior/nueva y fecha.
