import sjcl from "sjcl";
import crypto from "crypto-browserify";

const checkIfEncrypted = (str) => {
  try {
    const parsed = JSON.parse(str);
    return (
      parsed && typeof parsed === "object" && "ct" in parsed && "iv" in parsed
    );
  } catch (e) {
    return false;
  }
};

const generateKey = (sharedSecret) => {
  const bitArray = sjcl.hash.sha256.hash(sharedSecret);
  return sjcl.codec.hex.fromBits(bitArray);
};

export const encrypt = function (secret, message) {
  // const sharedSecret = Buffer.from(secret, "base64");

  const iv = crypto.randomBytes(16);
  const key = generateKey(secret);
  const encrypted = sjcl.json.encrypt(key, message, {
    iv: iv.toString("base64"),
  });

  return { encrypted, iv: iv.toString("base64") };
};

export const decrypt = function (secret, encrypted, iv) {
  if (!checkIfEncrypted(encrypted)) return encrypted;

  try {
    const key = generateKey(secret);
    const decrypted = sjcl.json.decrypt(key, encrypted);

    return decrypted;
  } catch (err) {
    return err.message;
  }
};
