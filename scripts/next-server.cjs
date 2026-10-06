const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const command = process.argv[2];

if (!['dev', 'start'].includes(command)) {
  throw new Error("Usa: node scripts/next-server.cjs <dev|start>");
}

function readPort(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return undefined;

  const line = fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .find((value) => /^\s*PORT\s*=/.test(value));

  if (!line) return undefined;
  const value = line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "");
  return value || undefined;
}

function configuredPort() {
  const value = process.env.PORT || readPort(".env.local") || readPort(".env") || "3000";
  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535.");
  }

  return String(port);
}

const port = configuredPort();
const nextBinary = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

console.log(`Iniciando Next.js en el puerto ${port}.`);

const child = spawn(process.execPath, [nextBinary, command, "--port", port], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: port },
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error("No se pudo iniciar Next.js:", error.message);
  process.exitCode = 1;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
