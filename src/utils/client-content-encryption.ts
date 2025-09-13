"use client";
import { initSodium } from "@/lib/sodium";

export async function encryptCaseContentClient(
  content: string,
  anonPublicKey: Uint8Array,
  orgPublicKey: Uint8Array
): Promise<{
  encryptedContent: string;
  forAnonUser: string;
  forAdmin: string;
} | null> {
  try {
    console.log("Starting client-side content encryption...");
    const sodium = await initSodium();

    const aesKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();

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
    console.error("Failed to encrypt case content on client:", error);
    return null;
  }
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
