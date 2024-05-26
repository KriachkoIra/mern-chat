import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { uniqBy } from "lodash";
import axios from "axios";

import ContactsPanel from "./chatComponents/ContactsPanel";
import MessagesPanel from "./chatComponents/MessagePanel";
import BackgroundToolbar from "./chatComponents/BackgroundToolbar";
import SettingsPanel from "./chatComponents/SettingsPanel";

export default function Chat() {
  const [bg, setBg] = useState(1);
  const [isBgToolbar, setIsBgToolbar] = useState(false);
  const [usersOnline, setUsersOnline] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [deletedMessages, setDeletedMessages] = useState([]);

  const {
    ws,
    setWs,
    setSelectedChatMessages,
    selectedChat,
    setNewMessagesContacts,
    page,
  } = useContext(UserContext);

  useEffect(() => {
    if (!ws || ws.readyState === 3) {
      ws?.close();
      const socket = new WebSocket("ws://localhost:3001");
      socket.addEventListener("message", handleMessage);
      socket.addEventListener("close", reconnect);
      setWs(socket);
    }
  }, []);

  useEffect(() => {
    axios
      .get(`/users/contactsWithNewMessages`)
      .then((res) => {
        setNewMessagesContacts(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function reconnect() {
    console.log("socket closed");
    // setTimeout(() => {
    //   console.log("reconnecting...");
    //   const socket = new WebSocket("ws://localhost:3001");
    //   socket.addEventListener("message", handleMessage);
    //   socket.addEventListener("close", this);
    //   setWs(socket);
    // }, 1000);
  }

  function handleMessage(e) {
    const data = JSON.parse(e.data);
    const selected = document.getElementById("selected")?.innerHTML;
    const page = document.getElementById("page")?.innerHTML;

    if (data?.usersOnline) showContactsOnline(data.usersOnline);
    else if (data?.deleted) {
      setDeletedMessages((dm) => [...dm, data.deleted]);
    } else if (data?.updated && selected === data.from) {
      axios
        .get(`/messages/${selected}?page=${page}`)
        .then((res) => {
          setSelectedChatMessages(res.data.messages);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (
      selected === data.from &&
      data &&
      data?.fileName &&
      data?.fileName !== ""
    ) {
      axios
        .get(`/messages/${selected}?page=${page}`)
        .then((res) => {
          setSelectedChatMessages(res.data.messages);
        })
        .catch((err) => {
          console.log(err);
        });
      removeIndicator(selected);
    } else if (selected === data.from && data?.message) {
      setSelectedChatMessages((msgs) =>
        uniqBy(
          [
            ...msgs,
            {
              text: data.message,
              from: data.from,
              _id: data.msgId,
              fileName: data.fileName,
              filePath: data.filePath,
              createdAt: data.createdAt,
              iv: data.iv,
            },
          ],
          "_id"
        )
      );
      removeIndicator(selected);
    } else if (data?.message) {
      setNewMessagesContacts((nmc) => {
        const nmcSet = new Set([...nmc, data.from]);
        return [...nmcSet];
      });
    }
  }

  function showContactsOnline(usersDuplicated) {
    const usersObject = {};
    usersDuplicated?.forEach((user) => (usersObject[user.id] = user.username));

    const users = [];
    for (const [id, username] of Object.entries(usersObject)) {
      users.push({ id, username });
    }

    setUsersOnline(users);
  }

  function removeIndicator(contactId) {
    axios
      .delete(`/users/contacts/removeNewMessage/${contactId}`)
      .then((res) => {
        // console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div
      className="vh-100 vw-100 chat-bg row align-items-center"
      style={{ backgroundImage: `url("img/${bg}.jpg")` }}
    >
      <div className="container chat-container col-sm-11 col-md-10 col-lg-9 text-white">
        <div className="row gap-1 h-100">
          <ContactsPanel
            usersOnline={usersOnline}
            setShowSettings={setShowSettings}
            removeIndicator={removeIndicator}
          />
          {(!showSettings || window.innerWidth > 1100) && (
            <MessagesPanel
              handleMessage={handleMessage}
              deletedMessages={deletedMessages}
            />
          )}
          {showSettings && <SettingsPanel />}
        </div>
        <div id="selected" className="d-none">
          {selectedChat}
        </div>
        <div id="page" className="d-none">
          {page}
        </div>
      </div>
      <button className="bg-btn" onClick={() => setIsBgToolbar((cur) => !cur)}>
        <i className="fa-solid fa-pen"></i>
      </button>
      {isBgToolbar && <BackgroundToolbar setBg={setBg} />}
    </div>
  );
}
