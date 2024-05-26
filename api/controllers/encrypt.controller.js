import crypto from "crypto";
import Key from "../models/Key.js";
import User from "../models/User.js";

const createKey = async function () {
  const server = crypto.createDiffieHellman(2048);
  const serverKey = server.generateKeys();

  const key = new Key({
    prime: server.getPrime("base64"),
    generator: server.getGenerator("base64"),
    publicKey: serverKey.toString("base64"),
  });

  try {
    await key.save();
    return key;
  } catch (err) {
    console.log(err);
  }
};

const getPublicKey = async function (req, res) {
  try {
    const keys = await Key.find();
    let key;
    if (keys.length === 0) {
      key = await createKey();
    } else {
      key = keys[0];
    }

    res.json({
      prime: key.prime,
      generator: key.generator,
      publicKey: key.publicKey,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserPublicKey = async function (req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "No id." });

  try {
    const user = await User.findById(id);
    if (!user) throw "No user.";

    res.json({ publicKey: user.publicKey });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const setPublicKey = async function (req, res) {
  const { id, publicKey } = req.body;

  if (!id || !publicKey)
    return res.status(400).json({ message: "No id or key." });

  try {
    const user = await User.findById(id);
    if (!user) throw "No user.";

    user = { ...user, publicKey };
    await user.save();

    res.json("Key saved.");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export { getPublicKey, getUserPublicKey, setPublicKey };
