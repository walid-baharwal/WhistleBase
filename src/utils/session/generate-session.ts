export async function generateSessionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );

  const rawKey = await crypto.subtle.exportKey("raw", key); // ArrayBuffer
  const rawKeyBytes = new Uint8Array(rawKey);

  // Convert to Base64
  const base64Key = btoa(String.fromCharCode(...rawKeyBytes));
  return base64Key;
}
