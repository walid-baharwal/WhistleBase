"use client";
import { initSodium } from "@/lib/sodium";
export async function decryptPrivateKeyFromPassword(
  password: string,
  encryptedBase64: string,
  saltBase64: string,
  nonceBase64: string
): Promise<Uint8Array> {
  const sodium = await initSodium();

  const encrypted = sodium.from_base64(encryptedBase64);
  const salt = sodium.from_base64(saltBase64);
  const nonce = sodium.from_base64(nonceBase64);

  const key = sodium.crypto_pwhash(
    32,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  const decrypted = sodium.crypto_secretbox_open_easy(encrypted, nonce, key);

  if (!decrypted) throw new Error("Failed to decrypt admin private key");

  return decrypted;
}
