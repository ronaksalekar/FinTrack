import CryptoJS from "crypto-js";

/* ================= KEY DERIVATION ================= */
export const deriveKey = (password, salt) => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 150000,
  });
};

/* ================= ENCRYPT ================= */
export const encryptData = (data, key) => {
  try {
    const iv = CryptoJS.lib.WordArray.random(16);
    const json = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(
      json,
      key,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return JSON.stringify({
      iv: iv.toString(),
      data: encrypted.toString(),
    });
  } catch (err) {
    throw new Error("Encryption failed");
  }
};

/* ================= DECRYPT ================= */
export const decryptData = (payload, key) => {
  try {
    const { iv, data } = JSON.parse(payload);

    const decrypted = CryptoJS.AES.decrypt(
      data,
      key,
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const text = decrypted.toString(CryptoJS.enc.Utf8);

    if (!text) throw new Error();

    return JSON.parse(text);
  } catch {
    throw new Error("Decryption failed");
  }
};

/* ================= RECOVERY KEY ================= */
export const generateRecoveryKey = () => {
  const bytes = CryptoJS.lib.WordArray.random(32); // 256-bit
  return bytes.toString().match(/.{1,4}/g).join("-").toUpperCase();
};

/* ================= PASSWORD VALIDATION ================= */
export const validatePassword = (password) => {
  const rules = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  return {
    isValid: Object.values(rules).every(Boolean),
    errors: Object.fromEntries(
      Object.entries(rules).map(([k, v]) => [k, !v])
    ),
  };
};

/* ================= BATCH ================= */
export const encryptBatch = (items, key) =>
  items.map((i) => encryptData(i, key));

export const decryptBatch = (items, key) =>
  items.map((i) => decryptData(i, key));
