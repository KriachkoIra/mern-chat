import { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios";

export default function MessagesPanel({ handleMessage }) {
  const { selectedChat, setSelectedChatMessages, selectedChatMessages } =
    useContext(UserContext);
  const messagesContainerEnd = useRef();

  return (
    <div className="col my-padding h-100">
      <div className="h-100 gap-0">
        {selectedChat ? (
          <>
            <div className="mt-3 mb-2 px-2 messages-container">
              {selectedChatMessages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}
              <div ref={messagesContainerEnd} id="anchor"></div>
            </div>
            <NewMessagePanel
              to={selectedChat}
              setMessages={setSelectedChatMessages}
              messagesContainerEnd={messagesContainerEnd}
              handleMessage={handleMessage}
            />
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

function Message({ msg }) {
  const { username, id } = useContext(UserContext);

  return (
    <div
      className={`px-3 py-2 chat-message mb-2 ${
        id.localeCompare(msg.from) === 0
          ? "my-message text-end"
          : "others-message"
      }`}
    >
      {msg.text}
    </div>
  );
}

function NewMessagePanel({
  to,
  setMessages,
  messagesContainerEnd,
  handleMessage,
}) {
  const [messageText, setMessageText] = useState("");

  const { setWs, ws, username, id } = useContext(UserContext);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      document.getElementById("anchor").scrollIntoView();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [to]);

  const sendMessage = function (e) {
    e.preventDefault();

    if (ws.readyState === 2 || ws.readyState === 3) {
      const socket = new WebSocket("ws://localhost:3001");
      socket.addEventListener("message", handleMessage);
      setWs(socket);
      setTimeout(
        () => socket.send(JSON.stringify({ message: messageText, to })),
        1000
      );
    } else {
      ws.send(JSON.stringify({ message: messageText, to }));
    }

    setMessages((msgs) => [
      ...msgs,
      { text: messageText, from: id, _id: Date.now() },
    ]);
    setMessageText("");

    setTimeout(
      () => messagesContainerEnd.current.scrollIntoView({ behavior: "smooth" }),
      100
    );
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
