import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import crypto from "crypto-browserify";
import sjcl from "sjcl";

export default function Register() {
  const [username, setUsernameField] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const { setUsername, setId, setAvatar } = useContext(UserContext);

  const registerUser = async (e) => {
    e.preventDefault();

    const link = isRegister ? "/auth/register" : "/auth/login";

    await axios
      .post(link, { username, password })
      .then(async (res) => {
        setId(res.data.id);
        setUsername(res.data.username);
        setAvatar(res.data.avatar);

        try {
          const personalPublicKey = await axios.get(
            `/encrypt/public-key/${res.data.id}`
          );

          if (!personalPublicKey.data.publicKey) {
            const savedKey = localStorage.getItem(
              "clientPublicKey" + res.data.id
            );

            if (savedKey) {
              await axios.post("/encrypt/public-key", {
                id: res.data.id,
                publicKey: savedKey,
              });

              return;
            }

            const serverResponse = await axios.get(`/encrypt/public-key`);

            const { prime, generator } = serverResponse.data;

            const client = crypto.createDiffieHellman(
              Buffer.from(prime, "base64"),
              Buffer.from(generator, "base64")
            );
            const clientKey = client.generateKeys().toString("base64");
            const clientPrivateKey = client.getPrivateKey("base64");

            const bitArray = sjcl.hash.sha256.hash(
              process.env.REACT_APP_SECRET
            );
            const key = sjcl.codec.hex.fromBits(bitArray);
            const encryptedPrivate = sjcl.json.encrypt(key, clientPrivateKey);

            localStorage.setItem(
              `clientPrivateKey${res.data.id}`,
              encryptedPrivate
            );
            localStorage.setItem(`clientPublicKey${res.data.id}`, clientKey);

            await axios.post("/encrypt/public-key", {
              id: res.data.id,
              publicKey: clientKey,
            });
          }
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        setAlert(err.response.data.message);
        console.log(err);
      });
  };

  return (
    <div
      className="pt-5 text-center chat-bg vw-100 vh-100"
      style={{ backgroundImage: `url("img/1.jpg")` }}
    >
      <div className="mt-5 container register-container col-sm-11 col-md-8 col-lg-6 text-white">
        <h3 className="text-4xl text-center mb-1">
          {isRegister ? "Register" : "Login"}
        </h3>
        <form
          className="col-xl-6 col-lg-8 col-md-8 col-sm-9 mx-auto pb-2 d-grid gap-1 p-3 mx-auto"
          onSubmit={(e) => registerUser(e)}
        >
          <input
            type="text"
            placeholder="username"
            className="block w-full rounded-sm p-2 mb-2 border form-control"
            value={username}
            onChange={(e) => setUsernameField(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            className="block w-full rounded-sm p-2 mb-2 border form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {alert && (
            <div className="alert alert-danger" role="alert">
              {alert}
            </div>
          )}
          <button className="block w-full rounded-sm p-2 mb-2 btn-register">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>
        <div>
          <span>{isRegister ? "Alredy registered?" : "No account yet?"} </span>
          <button
            className="btn-register-switch"
            onClick={() => setIsRegister((st) => !st)}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
