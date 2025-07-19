import _sodium from "libsodium-wrappers-sumo";

let sodium: typeof _sodium | null = null;

export const initSodiumServer = async () => {
  if (!sodium) {
    await _sodium.ready;
    sodium = _sodium;
  }
  return sodium;
};

export const getSodium = async () => {
  return await initSodiumServer();
};
