export async function generateSessionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);
  const rawKeyBytes = new Uint8Array(rawKey);

  const base64Key = btoa(String.fromCharCode(...rawKeyBytes));
  return base64Key;
}
