"use client";
import { initSodium } from "@/lib/sodium";

export async function encryptPrivateKeyWithPassword(password: string, privateKey: Uint8Array) {
  const sodium = await initSodium();

  const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const key = sodium.crypto_pwhash(
    32,
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  const encrypted = sodium.crypto_secretbox_easy(privateKey, nonce, key);

  return {
    encryptedPrivateKey: sodium.to_base64(encrypted),
    salt: sodium.to_base64(salt),
    nonce: sodium.to_base64(nonce),
  };
}
