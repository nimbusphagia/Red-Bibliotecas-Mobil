import { pbkdf2Async } from "@noble/hashes/pbkdf2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { getRandomBytes } from "expo-crypto";

const ITERATIONS = 20_000;

const derive = (pw: string, salt: Uint8Array, c: number) =>
  pbkdf2Async(sha256, pw, salt, { c, dkLen: 32 });

export async function hashPassword(pw: string): Promise<string> {
  const salt = getRandomBytes(16);
  const dk = await derive(pw, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(dk)}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [, c, salt, hash] = stored.split("$");
  const dk = await derive(pw, hexToBytes(salt), Number(c));
  return bytesToHex(dk) === hash;
}
