import { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import useStateWithCallback from "use-state-with-callback";

export default function MessagesPanel() {
  const { selectedChat } = useContext(UserContext);

  return (
    <div className="col my-padding">
      <div className="row h-100 gap-0">
        {selectedChat ? (
          <>
            <div className="pt-3 pb-2 h-100">{selectedChat}</div>
            <NewMessagePanel to={selectedChat} />
          </>
        ) : (
          <div className="pt-3 pb-2 h-100">
            <p className="text-gray mt-3 text-center">
              Select a person to start a conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewMessagePanel({ to }) {
  const [messageText, setMessageText] = useState("");

  const { setWs, ws } = useContext(UserContext);

  const sendMessage = function (e) {
    e.preventDefault();
    console.log(ws.readyState);
    if (ws.readyState === 2 || ws.readyState === 3) {
      const socket = new WebSocket("ws://localhost:3001");
      setWs(socket);
      socket.send(JSON.stringify({ message: messageText, to }));
    } else {
      ws.send(JSON.stringify({ message: messageText, to }));
    }
    setMessageText("");
  };

  return (
    <form
      className="col align-self-end pb-1 row gap-1 justify-content-center send-message-div"
      onSubmit={sendMessage}
    >
      <input
        type="text"
        placeholder="Type your message."
        className="p-2 px-3 w-75 col-auto rounded"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        required
      />
      <button className="p-2 px-3 col-auto rounded" type="submit">
        <i className="fa-solid fa-paper-plane"></i>
      </button>
    </form>
  );
}
