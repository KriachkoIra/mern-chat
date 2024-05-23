import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [ws, setWs] = useState(null);
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState([]);
  const [newMessagesContacts, setNewMessagesContacts] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios
      .get("/auth/verify")
      .then((res) => {
        setId(res.data.id);
        setUsername(res.data.username);
        setAvatar(res.data.avatar);
      })
      .catch((err) => {
        setId(null);
        setUsername(null);
        console.log(err);
      });
  });

  useEffect(() => {
    setPage(1);

    if (selectedChat) {
      axios
        .get(`/messages/${selectedChat}`)
        .then((res) => {
          setSelectedChatMessages(res.data.messages);
        })
        .catch((err) => {
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
        avatar,
        setAvatar,
        newMessagesContacts,
        setNewMessagesContacts,
        page,
        setPage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
