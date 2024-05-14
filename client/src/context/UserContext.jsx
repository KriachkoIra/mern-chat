import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [ws, setWs] = useState(null);
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    axios
      .get("/auth/verify")
      .then((res) => {
        setId(res.data.id);
        setUsername(res.data.username);
      })
      .catch((err) => {
        setId(null);
        setUsername(null);
        console.log(err);
      });
  });

  return (
    <UserContext.Provider
      value={{
        id,
        setId,
        username,
        setUsername,
        selectedChat,
        setSelectedChat,
        ws,
        setWs,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
