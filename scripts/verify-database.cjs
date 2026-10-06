const { Sequelize } = require("sequelize");
const path = require("path");
const { getDatabaseUrl } = require("./database-utils.cjs");

const projectRoot = path.resolve(__dirname, "..");
const sequelize = new Sequelize(getDatabaseUrl(projectRoot), {
  dialect: "postgres",
  logging: false,
});

async function verify() {
  try {
    const [tables] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    const [monedas] = await sequelize.query(
      "SELECT codigo, nombre, simbolo FROM monedas ORDER BY codigo"
    );
    const [tiposCuenta] = await sequelize.query(
      "SELECT nombre FROM tipos_cuenta ORDER BY nombre"
    );

    console.log(JSON.stringify({
      tables: tables.map((table) => table.tablename),
      monedas,
      tiposCuenta: tiposCuenta.map((tipo) => tipo.nombre),
    }, null, 2));
  } finally {
    await sequelize.close();
  }
}

verify().catch((error) => {
  console.error(`Error de verificación: ${error.message}`);
  process.exitCode = 1;
});
