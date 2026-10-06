const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const { getDatabaseUrl } = require("./database-utils.cjs");

const projectRoot = path.resolve(__dirname, "..");
const migrationsDir = path.join(projectRoot, "database", "migrations");

async function run() {
  const sequelize = new Sequelize(getDatabaseUrl(projectRoot), { dialect: "postgres", logging: false });
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const [applied] = await sequelize.query("SELECT name FROM schema_migrations;");
    const completed = new Set(applied.map((migration) => migration.name));
    const migrations = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".cjs")).sort();

    for (const filename of migrations) {
      const migration = require(path.join(migrationsDir, filename));
      if (completed.has(migration.name)) {
        continue;
      }

      await sequelize.transaction(async (transaction) => {
        await migration.up({ queryInterface, transaction });
        await queryInterface.bulkInsert("schema_migrations", [{ name: migration.name }], { transaction });
      });
      console.log(`Migración aplicada: ${migration.name}`);
    }
  } finally {
    await sequelize.close();
  }
}

run().catch((error) => {
  console.error(`Error de migración: ${error.message}`);
  process.exitCode = 1;
});
