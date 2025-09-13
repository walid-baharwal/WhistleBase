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

export async function getAesKeyForMessages(
  encryptedAesKey: string,
  anonPrivateKey: string,
  anonPublicKey: string
): Promise<Uint8Array | null> {
  try {
    const sodium = await initSodium();
    
    const anonPrivateKeyUint8 = sodium.from_base64(anonPrivateKey);
    const anonPublicKeyUint8 = sodium.from_base64(anonPublicKey);
    const encryptedAesKeyUint8 = sodium.from_base64(encryptedAesKey);
    
    const aesKey = sodium.crypto_box_seal_open(
      encryptedAesKeyUint8,
      anonPublicKeyUint8,
      anonPrivateKeyUint8
    );
    
    return aesKey;
  } catch (error) {
    console.error("Failed to get AES key for messages:", error);
    return null;
  }
}
