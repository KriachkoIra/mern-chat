import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    axios
      .get("/auth/verify")
      .then((res) => {
        console.log(res);
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
    <UserContext.Provider value={{ id, setId, username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
}
