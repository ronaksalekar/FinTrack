/* eslint-disable no-restricted-globals */
import CryptoJS from "crypto-js";

const decryptPayload = (payload, key) => {
  const { iv, data } = JSON.parse(payload);
  const decrypted = CryptoJS.AES.decrypt(data, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const text = decrypted.toString(CryptoJS.enc.Utf8);
  if (!text) throw new Error("Decryption failed");
  return JSON.parse(text);
};

self.onmessage = (event) => {
  const { encryptedRows = [], candidateKeys = [] } = event.data || {};

  const decrypted = encryptedRows
    .map((item) => {
      for (const key of candidateKeys) {
        try {
          const parsed = decryptPayload(item.encryptedData, key);
          return {
            ...parsed,
            _id: item._id,
            _timestamp: item.encryptedTimestamp,
          };
        } catch {
          // Try next key.
        }
      }

      return {
        _id: item._id,
        _corrupted: true,
      };
    })
    .filter(Boolean);

  self.postMessage({ decrypted });
};
