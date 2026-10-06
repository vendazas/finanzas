const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const { getDatabaseUrl } = require("./database-utils.cjs");

const projectRoot = path.resolve(__dirname, "..");
const seedersDir = path.join(projectRoot, "database", "seeders");

async function run() {
  const sequelize = new Sequelize(getDatabaseUrl(projectRoot), { dialect: "postgres", logging: false });
  const queryInterface = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS schema_seeders (
        name VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const [applied] = await sequelize.query("SELECT name FROM schema_seeders;");
    const completed = new Set(applied.map((seeder) => seeder.name));
    const seeders = fs.readdirSync(seedersDir).filter((file) => file.endsWith(".cjs")).sort();

    for (const filename of seeders) {
      const seeder = require(path.join(seedersDir, filename));
      if (completed.has(seeder.name)) {
        continue;
      }

      await sequelize.transaction(async (transaction) => {
        await seeder.up({ queryInterface, transaction });
        await queryInterface.bulkInsert("schema_seeders", [{ name: seeder.name }], { transaction });
      });
      console.log(`Seeder aplicado: ${seeder.name}`);
    }
  } finally {
    await sequelize.close();
  }
}

run().catch((error) => {
  console.error(`Error de seeding: ${error.message}`);
  process.exitCode = 1;
});
