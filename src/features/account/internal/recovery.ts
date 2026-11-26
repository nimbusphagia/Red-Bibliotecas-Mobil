import { getRandomBytes } from "expo-crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRecoveryCode(): string {
  const chars = Array.from(getRandomBytes(12), (b) => ALPHABET[b % 32]);
  return chars.join("").match(/.{4}/g)!.join("-");
}

export const normalizeRecoveryCode = (code: string) =>
  code.toUpperCase().replace(/[^A-Z0-9]/g, "");
