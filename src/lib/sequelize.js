import { Sequelize } from "sequelize";

const globalForSequelize = globalThis;

function createSequelizeClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  return new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
  });
}

export const sequelize = globalForSequelize.sequelize ?? createSequelizeClient();

if (process.env.NODE_ENV !== "production") {
  globalForSequelize.sequelize = sequelize;
}
