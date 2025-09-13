"use client";
import { initSodium } from "@/lib/sodium";

export async function encryptCaseContent(
  content: string,
  anonPublicKey: Uint8Array<ArrayBufferLike>,
  orgPublicKey: Uint8Array<ArrayBufferLike>,
  aesKey: Uint8Array<ArrayBufferLike>
): Promise<{
  encryptedContent: string;
  forAnonUser: string;
  forAdmin: string;
} | null> {
  try {
    const sodium = await initSodium();

    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const encryptedContentUint8 = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      content,
      null,
      null,
      nonce,
      aesKey
    );

    const aesKeyForSender = sodium.crypto_box_seal(aesKey, anonPublicKey);

    const aesKeyForReceiver = sodium.crypto_box_seal(aesKey, orgPublicKey);

    const encryptedContentB64 = sodium.to_base64(encryptedContentUint8);
    const nonceB64 = sodium.to_base64(nonce);
    const aesKeyForSenderB64 = sodium.to_base64(aesKeyForSender);
    const aesKeyForReceiverB64 = sodium.to_base64(aesKeyForReceiver);

    return {
      encryptedContent: `${encryptedContentB64}:${nonceB64}`,
      forAnonUser: aesKeyForSenderB64,
      forAdmin: aesKeyForReceiverB64,
    };
  } catch (error) {
    console.error("Failed to encrypt case content:", error);
    return null;
  }
}

export async function decryptCaseContent(
  encryptedContent: string,
  encryptedAesKey: string,
  PrivateKey: string,
  PublicKey: string
): Promise<string | null> {
  try {
    const sodium = await initSodium();

    const [encryptedContentB64, nonceB64] = encryptedContent.split(":");
    const encryptedContentUint8 = sodium.from_base64(encryptedContentB64);
    const nonce = sodium.from_base64(nonceB64);

    const PrivateKeyUint8 = sodium.from_base64(PrivateKey);
    const PublicKeyUint8 = sodium.from_base64(PublicKey);
    const encryptedAesKeyUint8 = sodium.from_base64(encryptedAesKey);

    const aesKey = sodium.crypto_box_seal_open(
      encryptedAesKeyUint8,
      PublicKeyUint8,
      PrivateKeyUint8
    );

    const decryptedContent = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encryptedContentUint8,
      null,
      nonce,
      aesKey
    );

    return sodium.to_string(decryptedContent);
  } catch (error) {
    console.error("Failed to decrypt case content for anon user:", error);
    return null;
  }
}

export function validateEncryptedCaseData(content: string): boolean {
  return content.includes(":") && content.split(":").length === 2;
}

export async function generateAnonKeyPair(): Promise<{
  publicKey: Uint8Array;
  privateKey: Uint8Array;
} | null> {
  try {
    const sodium = await initSodium();
    const keyPair = sodium.crypto_box_keypair();

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
    };
  } catch (error) {
    console.error("Failed to generate anonymous keypair:", error);
    return null;
  }
}

export async function getAesKey(
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
