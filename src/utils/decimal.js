function toScaled(value, scale = 2) {
  const normalized = String(value ?? "0").trim();
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return 0n;
  const negative = normalized.startsWith("-");
  const [whole, fraction = ""] = normalized.replace("-", "").split(".");
  const decimals = `${fraction}${"0".repeat(scale)}`.slice(0, scale);
  const scaled = BigInt(whole) * (10n ** BigInt(scale)) + BigInt(decimals || 0);
  return negative ? -scaled : scaled;
}

function fromScaled(value, scale = 2) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const divisor = 10n ** BigInt(scale);
  const whole = absolute / divisor;
  const fraction = String(absolute % divisor).padStart(scale, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

export function sumarDinero(values) {
  return fromScaled(values.reduce((total, value) => total + toScaled(value), 0n));
}

export function restarDinero(left, right) {
  return fromScaled(toScaled(left) - toScaled(right));
}

export function convertirDinero(monto, tasa) {
  const product = toScaled(monto, 2) * toScaled(tasa, 8);
  const divisor = 10n ** 8n;
  const rounded = product >= 0n ? (product + divisor / 2n) / divisor : (product - divisor / 2n) / divisor;
  return fromScaled(rounded);
}
