import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { getRandomBytes } from "expo-crypto";
import { pbkdf2 } from "react-native-quick-crypto";

const ITERATIONS = 100_000;

const derive = (pw: string, salt: Uint8Array, c: number) =>
  new Promise<Uint8Array>((resolve, reject) =>
    pbkdf2(pw, salt, c, 32, "sha256", (err, dk) =>
      err || !dk ? reject(err) : resolve(new Uint8Array(dk)),
    ),
  );

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
