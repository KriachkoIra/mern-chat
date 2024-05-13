import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsernameField] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");
  const [isRegister, setIsRegister] = useState(true);

  const { setUsername, setId } = useContext(UserContext);

  const registerUser = async (e) => {
    e.preventDefault();

    const link = isRegister ? "/auth/register" : "/auth/login";

    await axios
      .post(link, { username, password })
      .then((res) => {
        console.log(res);
        setId(res.data.id);
        setUsername(res.data.username);
      })
      .catch((err) => {
        setAlert(err.response.data.message);
        console.log(err);
      });
  };

  return (
    <div className="mt-5 pt-5 text-center">
      <h3 className="text-4xl text-center mb-1">
        {isRegister ? "Register" : "Login"}
      </h3>
      <form
        className="col-xl-3 col-lg-4 col-md-6 col-sm-9 mx-auto pb-2 d-grid gap-1 p-3 mx-auto"
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
        <button className="block w-full rounded-sm p-2 mb-2 btn btn-outline-dark">
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
      <div>
        <span>{isRegister ? "Alredy registered?" : "No account yet?"} </span>
        <button className="btn-hide" onClick={() => setIsRegister((st) => !st)}>
          {isRegister ? "Login" : "Register"}
        </button>
      </div>
    </div>
  );
}
