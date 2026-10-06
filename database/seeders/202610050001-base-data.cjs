const { randomUUID } = require("crypto");

module.exports = {
  name: "202610050001-base-data",

  async up({ queryInterface, transaction }) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "monedas",
      [
        { id: randomUUID(), codigo: "BOB", nombre: "Boliviano", simbolo: "Bs", decimales: 2, activo: true, created_at: now, updated_at: now },
        { id: randomUUID(), codigo: "USD", nombre: "Dólar estadounidense", simbolo: "$", decimales: 2, activo: true, created_at: now, updated_at: now },
      ],
      { transaction }
    );

    await queryInterface.bulkInsert(
      "tipos_cuenta",
      ["Banco", "Efectivo", "Billetera", "Ahorro", "Inversión", "Otro"].map((nombre) => ({
        id: randomUUID(), nombre, icono: null, activo: true, created_at: now, updated_at: now,
      })),
      { transaction }
    );

    await queryInterface.bulkInsert(
      "categorias",
      [
        ["INGRESO", "Salario"], ["INGRESO", "Freelance"], ["INGRESO", "Otros ingresos"],
        ["GASTO", "Alimentación"], ["GASTO", "Transporte"], ["GASTO", "Vivienda"],
        ["GASTO", "Servicios"], ["GASTO", "Salud"], ["GASTO", "Educación"], ["GASTO", "Entretenimiento"],
      ].map(([tipo, nombre]) => ({
        id: randomUUID(), usuario_id: null, categoria_padre_id: null, tipo, nombre, icono: null, color: null,
        activo: true, created_at: now, updated_at: now,
      })),
      { transaction }
    );
  },

  async down({ queryInterface, transaction }) {
    await queryInterface.bulkDelete("categorias", { usuario_id: null }, { transaction });
    await queryInterface.bulkDelete("tipos_cuenta", { nombre: ["Banco", "Efectivo", "Billetera", "Ahorro", "Inversión", "Otro"] }, { transaction });
    await queryInterface.bulkDelete("monedas", { codigo: ["BOB", "USD"] }, { transaction });
  },
};
