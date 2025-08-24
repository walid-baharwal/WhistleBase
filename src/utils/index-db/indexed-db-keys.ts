"use client";
import { openDB } from "idb";
import { getSession } from "next-auth/react";
import { decryptWithSessionAESKey, encryptWithSessionAESKey } from "../session/aes-session";

const DB_NAME = "indexDb";
const STORE_NAME = "wk";

export async function saveEncryptedKeyToIndexedDB(encryptedKey: string, iv: string) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });

  await db.put(STORE_NAME, encryptedKey, "ek");
  await db.put(STORE_NAME, iv, "iv");
}

export async function getEncryptedKeyFromIndexedDB(): Promise<{
  encryptedBase64: string;
  ivBase64: string;
} | null> {
  const db = await openDB(DB_NAME, 1);
  const encrypted = await db.get(STORE_NAME, "ek");
  const iv = await db.get(STORE_NAME, "iv");

  if (!encrypted || !iv) return null;

  return {
    encryptedBase64: encrypted,
    ivBase64: iv,
  };
}

export async function encryptAndSaveToIndexedDB({
  privateKey,
}: {
  privateKey: Uint8Array<ArrayBufferLike>;
}): Promise<void> {
  const session = await getSession();
  const sessionAESKey = session?.user?.aesKey;
  if (!sessionAESKey) return;
  const { encryptedBase64, ivBase64 } = await encryptWithSessionAESKey(privateKey, sessionAESKey);

  await saveEncryptedKeyToIndexedDB(encryptedBase64, ivBase64);
}

export async function getFromIndexDbAndDecrypt() {
  const session = await getSession();
  const sessionAESKey = session?.user?.aesKey;
  if (!sessionAESKey) return;

  const encryptedKey = await getEncryptedKeyFromIndexedDB();

  if (!encryptedKey) return;

  const decryptedKey = decryptWithSessionAESKey(
    encryptedKey.encryptedBase64,
    encryptedKey.ivBase64,
    sessionAESKey
  );

  return decryptedKey;
}

export async function clearEncryptedKeyFromIndexedDB() {
  indexedDB.deleteDatabase("indexDb");
}
