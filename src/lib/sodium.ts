"use client";
import _sodium from "libsodium-wrappers-sumo";

let sodium: typeof _sodium | null = null;

export const initSodium = async () => {
  if (!sodium) {
    await _sodium.ready;
    sodium = _sodium;
  }

  return sodium;
};
