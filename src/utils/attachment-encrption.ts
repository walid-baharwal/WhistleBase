import sodium from "libsodium-wrappers";

export async function encryptFile(file: File, aesKey: Uint8Array) {
  await sodium.ready;
  const data = new Uint8Array(await file.arrayBuffer());

  const rawKey = new Uint8Array(aesKey);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, data);

  return { encrypted, iv };
}

export async function decryptFile(
  encrypted: ArrayBuffer, 
  aesKey: Uint8Array, 
  iv: Uint8Array
): Promise<ArrayBuffer> {
  try {
    const rawKey = new Uint8Array(aesKey);
    const cleanIv = new Uint8Array(iv);

    const cryptoKey = await crypto.subtle.importKey(
      "raw", 
      rawKey, 
      "AES-GCM", 
      false, 
      ["encrypt", "decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: cleanIv },
      cryptoKey,
      encrypted
    );

    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt file:", error);
    throw new Error("Failed to decrypt file");
  }
}

export function ivToBase64(iv: Uint8Array): string {
  return btoa(String.fromCharCode(...iv));
}

export function base64ToIv(base64: string): Uint8Array {
  const binary = atob(base64);
  const iv = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    iv[i] = binary.charCodeAt(i);
  }
  return iv;
}
