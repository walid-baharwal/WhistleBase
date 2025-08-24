import { initSodiumServer } from "@/lib/sodium-server";

export async function encryptCaseContent(
  content: string,
  anonPublicKey: Uint8Array<ArrayBufferLike>,
  orgPublicKey: Uint8Array<ArrayBufferLike>
): Promise<{
  encryptedContent: string;
  forSender: string;
  forReceiver: string;
} | null> {
  try {
    console.log("Starting content encryption...", {
      content,
      anonPublicKey,
      orgPublicKey,
    });
    const sodium = await initSodiumServer();

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
      forSender: aesKeyForSenderB64,
      forReceiver: aesKeyForReceiverB64,
    };
  } catch (error) {
    console.error("Failed to encrypt case content:", error);
    return null;
  }
}

export async function decryptCaseContentForSender(
  encryptedContent: string,
  encryptedAesKey: string,
  anonPrivateKey: string,
  anonPublicKey: string
): Promise<string | null> {
  try {
    const sodium = await initSodiumServer();

    const [encryptedContentB64, nonceB64] = encryptedContent.split(":");
    const encryptedContentUint8 = sodium.from_base64(encryptedContentB64);
    const nonce = sodium.from_base64(nonceB64);

    const anonPrivateKeyUint8 = sodium.from_base64(anonPrivateKey);
    const anonPublicKeyUint8 = sodium.from_base64(anonPublicKey);
    const encryptedAesKeyUint8 = sodium.from_base64(encryptedAesKey);

    const aesKey = sodium.crypto_box_seal_open(
      encryptedAesKeyUint8,
      anonPublicKeyUint8,
      anonPrivateKeyUint8
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
    console.error("Failed to decrypt case content for sender:", error);
    return null;
  }
}

export async function decryptCaseContentForReceiver(
  encryptedContent: string,
  encryptedAesKey: string,
  orgPrivateKey: string,
  orgPublicKey: string
): Promise<string | null> {
  try {
    const sodium = await initSodiumServer();

    const [encryptedContentB64, nonceB64] = encryptedContent.split(":");
    const encryptedContentUint8 = sodium.from_base64(encryptedContentB64);
    const nonce = sodium.from_base64(nonceB64);

    const orgPrivateKeyUint8 = sodium.from_base64(orgPrivateKey);
    const orgPublicKeyUint8 = sodium.from_base64(orgPublicKey);
    const encryptedAesKeyUint8 = sodium.from_base64(encryptedAesKey);

    const aesKey = sodium.crypto_box_seal_open(
      encryptedAesKeyUint8,
      orgPublicKeyUint8,
      orgPrivateKeyUint8
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
    console.error("Failed to decrypt case content for receiver:", error);
    return null;
  }
}

export function validateEncryptedCaseData(content: string): boolean {
  return content.includes(":") && content.split(":").length === 2;
}
