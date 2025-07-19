"use client";
/**
 * Encrypts a Uint8Array with a base64-encoded AES key using AES-GCM.
 */
export async function encryptWithSessionAESKey(
  plainData: Uint8Array,
  aesKeyRawBase64: string
): Promise<{ encryptedBase64: string; ivBase64: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM IV should be 12 bytes

  const aesKeyRaw = Uint8Array.from(atob(aesKeyRawBase64), (c) => c.charCodeAt(0));
  const aesKey = await crypto.subtle.importKey("raw", aesKeyRaw, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);
  const normalizedPlainData = new Uint8Array(plainData);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    normalizedPlainData
  );

  return {
    encryptedBase64: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    ivBase64: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypts base64-encoded AES-GCM encrypted data.
 */
export async function decryptWithSessionAESKey(
  encryptedBase64: string,
  ivBase64: string,
  aesKeyRawBase64: string
): Promise<Uint8Array> {
  const aesKeyRaw = Uint8Array.from(atob(aesKeyRawBase64), (c) => c.charCodeAt(0));
  const aesKey = await crypto.subtle.importKey("raw", aesKeyRaw, { name: "AES-GCM" }, false, [
    "decrypt",
  ]);

  const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encryptedBytes
  );

  return new Uint8Array(decryptedBuffer);
}

