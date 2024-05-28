import { useContext } from "react";
import Register from "./components/Register.jsx";
import axios from "axios";
import { UserContext } from "./context/UserContext.jsx";
import Chat from "./components/Chat.jsx";

function App() {
  axios.defaults.baseURL = "https://localhost:3001";
  axios.defaults.withCredentials = true;

  const { username } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }

  return <Register />;
}

export default App;
