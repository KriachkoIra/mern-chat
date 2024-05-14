import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Modal from "react-modal";

import ContactsPanel from "./chatComponents/ContactsPanel";
import MessagesPanel from "./chatComponents/MessagePanel";
import BackgroundToolbar from "./chatComponents/BackgroundToolbar";

export default function Chat() {
  const [bg, setBg] = useState(1);
  const [isBgToolbar, setIsBgToolbar] = useState(false);
  const [usersOnline, setUsersOnline] = useState([]);

  const { setWs } = useContext(UserContext);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    socket.addEventListener("message", handleMessage);
    setWs(socket);
  }, []);

  function handleMessage(e) {
    const data = JSON.parse(e.data);
    showContactsOnline(data.usersOnline);
  }

  function showContactsOnline(usersDuplicated) {
    const usersObject = {};
    usersDuplicated?.forEach(
      (user) => (usersObject[user.userId] = user.username)
    );

    const users = [];
    for (const [userId, username] of Object.entries(usersObject)) {
      users.push({ userId, username });
    }
    // console.log(users);
    setUsersOnline(users);
  }

  return (
    <div
      className="vh-100 vw-100 chat-bg row align-items-center"
      style={{ backgroundImage: `url("img/${bg}.jpg")` }}
    >
      <div className="container chat-container col-sm-11 col-md-10 col-lg-9 text-white">
        <div className="row gap-1 h-100">
          <ContactsPanel />
          <MessagesPanel />
        </div>
      </div>
      <button className="bg-btn" onClick={() => setIsBgToolbar((cur) => !cur)}>
        <i className="fa-solid fa-pen"></i>
      </button>
      {isBgToolbar && <BackgroundToolbar setBg={setBg} />}
    </div>
  );
}
