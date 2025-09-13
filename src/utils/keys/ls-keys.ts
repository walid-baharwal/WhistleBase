"use client";

import SecureLS from "secure-ls";

let ls: SecureLS;
if (typeof window !== "undefined") {
  ls = new SecureLS({ encodingType: "aes" });
}

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || "temp_case_keys_v1";

type StoredKeys = {
  publicKey: string;
  privateKey: string;
  expiresAt: number;
};

export function storeTemporaryKeys(publicKey: string, privateKey: string, ttlMinutes = 10) {
  if (typeof window === "undefined" || !ls) {
    return;
  }

  const expiresAt = Date.now() + ttlMinutes * 60_000;
  const payload: StoredKeys = { publicKey, privateKey, expiresAt };

  ls.set(STORAGE_KEY, payload);

  scheduleAutoClear(ttlMinutes);
}

export function getTemporaryKeys(): { publicKey: string; privateKey: string } | null {
  if (typeof window === "undefined" || !ls) {
    return null;
  }

  try {
    const maybe = ls.get(STORAGE_KEY) as StoredKeys | null;

    if (!maybe) return null;

    if (Date.now() > maybe.expiresAt) {
      ls.remove(STORAGE_KEY);
      return null;
    }

    return { publicKey: maybe.publicKey, privateKey: maybe.privateKey };
  } catch (error) {
    console.error("Error getting temporary keys:", error);
    return null;
  }
}

export function clearTemporaryKeys() {
  if (typeof window === "undefined" || !ls) {
    return;
  }

  ls.remove(STORAGE_KEY);
}

let _autoClearTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleAutoClear(ttlMinutes?: number) {
  if (typeof window === "undefined" || !ls) {
    return;
  }

  if (_autoClearTimer !== null) {
    window.clearTimeout(_autoClearTimer);
    _autoClearTimer = null;
  }

  try {
    const maybe = ls.get(STORAGE_KEY) as StoredKeys | null;

    let msLeft: number | null = null;
    if (maybe) {
      msLeft = maybe.expiresAt - Date.now();
    } else if (typeof ttlMinutes === "number") {
      msLeft = ttlMinutes * 60_000;
    }

    if (msLeft == null || msLeft <= 0) {
      if (maybe) clearTemporaryKeys();
      return;
    }

    _autoClearTimer = setTimeout(() => {
      clearTemporaryKeys();
      _autoClearTimer = null;
    }, msLeft);
  } catch (error) {
    console.error("Error scheduling auto clear:", error);
  }
}
