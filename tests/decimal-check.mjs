import assert from "node:assert/strict";
import { convertirDinero, restarDinero, sumarDinero } from "../src/utils/decimal.js";

assert.equal(sumarDinero(["0.10", "0.20", "1.00"]), "1.30");
assert.equal(restarDinero("100.00", "33.33"), "66.67");
assert.equal(convertirDinero("100.00", "6.96000000"), "696.00");

console.log("Pruebas de precisión decimal superadas.");
