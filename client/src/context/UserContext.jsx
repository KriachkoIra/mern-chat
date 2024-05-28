import axios from "axios";
import { createContext, useEffect, useState } from "react";
import crypto from "crypto-browserify";
import sjcl from "sjcl";

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
  const [sharedSecret, setSharedSecret] = useState("");

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

  // set shared secret
  useEffect(() => {
    setPage(1);

    if (selectedChat) {
      axios.get(`encrypt/public-key/${selectedChat}`).then(async (res) => {
        const otherPublicKey = res.data.publicKey;

        const clientPublicKey = localStorage.getItem("clientPublicKey" + id);
        const clientPrivateKeyEncrypted = localStorage.getItem(
          "clientPrivateKey" + id
        );

        const bitArray = sjcl.hash.sha256.hash(process.env.REACT_APP_SECRET);
        const key = sjcl.codec.hex.fromBits(bitArray);
        const clientPrivateKey = sjcl.json.decrypt(
          key,
          clientPrivateKeyEncrypted
        );

        if (clientPublicKey && clientPrivateKey) {
          const serverResponse = await axios.get(`/encrypt/public-key`);

          const { prime, generator } = serverResponse.data;

          const client = crypto.createDiffieHellman(
            Buffer.from(prime, "base64"),
            Buffer.from(generator, "base64")
          );

          client.setPublicKey(Buffer.from(clientPublicKey, "base64"));
          client.setPrivateKey(Buffer.from(clientPrivateKey, "base64"));

          const sharedSecret = client.computeSecret(
            Buffer.from(otherPublicKey, "base64")
          );
          setSharedSecret(sharedSecret.toString("base64"));

          axios
            .get(`/messages/${selectedChat}`)
            .then((res) => {
              setSelectedChatMessages(res.data.messages);
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
        sharedSecret,
        setSharedSecret,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
