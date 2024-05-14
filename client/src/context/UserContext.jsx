import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [ws, setWs] = useState(null);
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState([]);

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

  useEffect(() => {
    if (selectedChat) {
      axios
        .get(`/messages/${id}/${selectedChat}`)
        .then((res) => {
          // console.log(res);
          setSelectedChatMessages(res.data.messages);
        })
        .catch((err) => {
          // setAlert(err.response.data.message);
          console.log(err);
        });
    }
  }, [selectedChat]);

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
        selectedChatMessages,
        setSelectedChatMessages,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
