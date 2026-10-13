/**
 * Portaldot V3.0 Safe Precision Math Engine
 * Explicit BigInt arithmetic for 14-decimal native POT, 6-decimal pUSD, and 18-decimal ERC20.
 * Eliminates the 10,000x decimal mismatch trap.
 */

export const POT_DECIMALS = 14;
export const PUSD_DECIMALS = 6;
export const ERC20_DECIMALS = 18;

const POT_BASE = 10n ** 14n;
const PUSD_BASE = 10n ** 6n;
const ERC20_BASE = 10n ** 18n;

/**
 * Convert human POT string (e.g. "1.5") to 14-decimal BigInt base units.
 */
export function parsePot(humanAmount: string): bigint {
  const clean = humanAmount.trim();
  if (!clean || clean === '0' || clean === '.') return 0n;

  const parts = clean.split('.');
  if (parts.length > 2) throw new Error('Invalid numeric input: multiple decimal points');

  const wholePart = parts[0] === '' ? '0' : parts[0];
  const wholeBigInt = BigInt(wholePart) * POT_BASE;

  if (parts.length === 1) {
    return wholeBigInt;
  }

  let fracPart = parts[1];
  if (fracPart.length > POT_DECIMALS) {
    fracPart = fracPart.slice(0, POT_DECIMALS); // clamp to 14 decimals
  }
  const paddedFrac = fracPart.padEnd(POT_DECIMALS, '0');
  const fracBigInt = BigInt(paddedFrac);

  return wholeBigInt + fracBigInt;
}

/**
 * Format 14-decimal BigInt base units to human POT string.
 */
export function formatPot(baseUnits: bigint, maxFractionDigits: number = 6): string {
  if (baseUnits === 0n) return '0.00';

  const isNegative = baseUnits < 0n;
  const absValue = isNegative ? -baseUnits : baseUnits;

  const whole = absValue / POT_BASE;
  const remainder = absValue % POT_BASE;

  if (remainder === 0n) {
    return `${isNegative ? '-' : ''}${whole.toString()}.00`;
  }

  const remainderStr = remainder.toString().padStart(POT_DECIMALS, '0');
  let trimmedFrac = remainderStr.slice(0, maxFractionDigits);
  // remove trailing zeros but keep at least 2 decimal places
  trimmedFrac = trimmedFrac.replace(/0+$/, '');
  if (trimmedFrac.length < 2) {
    trimmedFrac = remainderStr.slice(0, 2);
  }

  return `${isNegative ? '-' : ''}${whole.toString()}.${trimmedFrac}`;
}

/**
 * Calculate the skew factor when using standard 18-decimal parseEther vs 14-decimal parsePot.
 */
export function calculateDecimalSkew(humanAmount: string): {
  standard18Base: bigint;
  portaldot14Base: bigint;
  skewRatio: number;
  excessBaseUnits: bigint;
} {
  const pot14 = parsePot(humanAmount);
  // 18 decimals is 10,000x greater (10^18 / 10^14 = 10^4 = 10,000)
  const standard18 = pot14 * 10000n;
  const excess = standard18 - pot14;

  return {
    standard18Base: standard18,
    portaldot14Base: pot14,
    skewRatio: 10000,
    excessBaseUnits: excess,
  };
}

/**
 * Format 6-decimal pUSD
 */
export function formatPUsd(baseUnits: bigint): string {
  const whole = baseUnits / PUSD_BASE;
  const remainder = baseUnits % PUSD_BASE;
  const remStr = remainder.toString().padStart(PUSD_DECIMALS, '0').slice(0, 2);
  return `${whole.toString()}.${remStr}`;
}

/**
 * Format arbitrary BigInt with custom decimals
 */
export function formatUnitsCustom(value: bigint, decimals: number, precision: number = 4): string {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const rem = value % base;
  if (rem === 0n) return `${whole.toString()}.00`;
  const remStr = rem.toString().padStart(decimals, '0').slice(0, precision);
  return `${whole.toString()}.${remStr}`;
}
