"use client";

import { initSodium } from "@/lib/sodium";

export async function encryptMessageFromAnonymous(
  message: string,
  aesKey: Uint8Array
): Promise<string | null> {
  try {
    const sodium = await initSodium();

    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    const encryptedMessageUint8 = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      message,
      null,
      null,
      nonce,
      aesKey
    );

    const encryptedMessageB64 = sodium.to_base64(encryptedMessageUint8);
    const nonceB64 = sodium.to_base64(nonce);

    return `${encryptedMessageB64}:${nonceB64}`;
  } catch (error) {
    console.error("Failed to encrypt message:", error);
    return null;
  }
}

export async function decryptMessage(
  encryptedMessage: string,
  aesKey: Uint8Array
): Promise<string | null> {
  try {
    const sodium = await initSodium();

    const [encryptedMessageB64, nonceB64] = encryptedMessage.split(":");
    const encryptedMessageUint8 = sodium.from_base64(encryptedMessageB64);
    const nonce = sodium.from_base64(nonceB64);

    const decryptedMessage = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encryptedMessageUint8,
      null,
      nonce,
      aesKey
    );

    return sodium.to_string(decryptedMessage);
  } catch (error) {
    console.error("Failed to decrypt message:", error);
    return null;
  }
}

