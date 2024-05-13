import { useEffect, useState } from "react";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [bg, setBg] = useState(1);
  const [isBgToolbar, setIsBgToolbar] = useState(false);
  const [usersOnline, setUsersOnline] = useState([]);

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
    console.log(users);
    setUsersOnline(users);
  }

  return (
    <div
      className="vh-100 vw-100 chat-bg row align-items-center"
      style={{ backgroundImage: `url("img/${bg}.jpg")` }}
    >
      <div className="container chat-container col-sm-11 col-md-10 col-lg-9 text-white">
        <div className="row gap-1 h-100">
          <ContactsPanel usersOnline={usersOnline} />
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

function ContactsPanel({ usersOnline }) {
  return (
    <div className="col-sm-4 col-md-3 border-end border-dark mr-1">
      {usersOnline.map((user) => (
        <div>{user.username}</div>
      ))}
    </div>
  );
}

function MessagesPanel() {
  return (
    <div className="col my-padding">
      <div className="row h-100 gap-0">
        <div className="pt-3 pb-2 h-100">messages</div>
        <div className="col align-self-end pb-1 row gap-1 justify-content-center send-message-div">
          <input
            type="text"
            placeholder="Type your message."
            className="p-2 px-3 w-75 col-auto rounded"
          />
          <button className="p-2 px-3 col-auto rounded">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

function BackgroundToolbar({ setBg }) {
  const handleClick = function (n) {
    setBg(n);
  };

  return (
    <div className="bg-toolbar p-2">
      <button
        style={{ backgroundImage: `url("img/1.jpg")` }}
        onClick={() => handleClick(1)}
      />
      <button
        style={{ backgroundImage: `url("img/2.jpg")` }}
        onClick={() => handleClick(2)}
      />
      <button
        style={{ backgroundImage: `url("img/3.jpg")` }}
        onClick={() => handleClick(3)}
      />
      <button
        style={{ backgroundImage: `url("img/4.jpg")` }}
        onClick={() => handleClick(4)}
      />
      <button
        style={{ backgroundImage: `url("img/5.jpg")` }}
        onClick={() => handleClick(5)}
      />
      <button
        style={{ backgroundImage: `url("img/6.jpg")` }}
        onClick={() => handleClick(6)}
      />
      <button
        style={{ backgroundImage: `url("img/7.jpg")` }}
        onClick={() => handleClick(7)}
      />
    </div>
  );
}
