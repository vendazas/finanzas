const fs = require("fs");
const path = require("path");

function loadLocalEnvironment(projectRoot) {
  const envPath = path.join(projectRoot, ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function getDatabaseUrl(projectRoot) {
  loadLocalEnvironment(projectRoot);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está configurada. Defínela en .env.local o en el entorno.");
  }

  return process.env.DATABASE_URL;
}

module.exports = { getDatabaseUrl };
