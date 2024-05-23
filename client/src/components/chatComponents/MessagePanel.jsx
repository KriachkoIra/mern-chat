import { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios";

export default function MessagesPanel({ handleMessage, deletedMessages }) {
  const [isLast, setIsLast] = useState(false);

  const {
    selectedChat,
    setSelectedChatMessages,
    selectedChatMessages,
    page,
    setPage,
  } = useContext(UserContext);
  const messagesContainerEnd = useRef();
  const curPageScroll = useRef();

  useEffect(() => setIsLast(false), [selectedChat]);

  const toDate = function (date) {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
  };

  const getNextPage = function () {
    axios
      .get(`/messages/${selectedChat}?page=${page + 1}`)
      .then((res) => {
        setSelectedChatMessages(res.data.messages);
        if (res.data.isLast) setIsLast(true);
        setTimeout(
          () => curPageScroll?.current?.scrollIntoView({ behavior: "instant" }),
          20
        );
      })
      .catch((err) => {
        console.log(err);
      });
    setPage((p) => p + 1);
  };

  return (
    <div className="col my-padding h-100 justify-content-around">
      <div className="h-100 gap-0">
        {selectedChat ? (
          <>
            <div className="mt-3 mb-2 px-2 messages-container">
              {selectedChatMessages?.length === 0 && (
                <p className="text-gray mt-3 text-center">No messages yet.</p>
              )}
              {!isLast && (
                <button onClick={getNextPage} className="load-more-btn">
                  Load more
                </button>
              )}
              {selectedChatMessages?.map((msg, i) => {
                const num = Math.max(
                  selectedChatMessages.length - (page - 1) * 30,
                  0
                );
                const isScroll = num === i + 1;

                if (deletedMessages.includes(msg._id)) return null;
                if (
                  i === 0 ||
                  selectedChatMessages[i]?.createdAt.substring(0, 10) !==
                    selectedChatMessages[i - 1]?.createdAt.substring(0, 10)
                ) {
                  return (
                    <span key={"span" + i}>
                      <div
                        className="mx-auto my-2 text-center"
                        style={{ opacity: "70%" }}
                        key={"div" + i}
                      >
                        {toDate(selectedChatMessages[i]?.createdAt)}
                      </div>
                      <Message
                        key={i}
                        msg={msg}
                        curPageScroll={curPageScroll}
                        isScroll={isScroll}
                      />
                    </span>
                  );
                }

                return (
                  <Message
                    key={i}
                    msg={msg}
                    curPageScroll={curPageScroll}
                    isScroll={isScroll}
                  />
                );
              })}
              <div ref={messagesContainerEnd} id="anchor"></div>
            </div>
            <NewMessagePanel
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

function Message({ msg, isScroll, curPageScroll }) {
  const { id } = useContext(UserContext);
  const [imgShow, setImgShow] = useState(false);
  const [editDeleteShow, setEditDeleteShow] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [edit, setEdit] = useState(false);
  const [txtMessage, setTxtMessage] = useState(msg.text);

  const isMine = id.localeCompare(msg.from) === 0;

  function deleteMessage() {
    axios
      .delete(`messages/${msg._id}`)
      .then(() => {
        setIsDeleted(true);
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  }

  function editMessage() {
    axios
      .patch(`messages/${msg._id}`, { text: txtMessage })
      .then(() => {
        msg.text = txtMessage;
        setEditDeleteShow(true);
        setEdit(false);
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  }

  return isDeleted ? null : (
    <>
      {isScroll && <div ref={curPageScroll} id="scroll"></div>}
      <div
        className={`px-3 py-2 chat-message mb-2 ${
          isMine ? "my-message" : "others-message"
        }`}
        style={{ textAlign: "justify" }}
        onClick={() => isMine && setEditDeleteShow((eds) => !eds)}
      >
        {msg.fileName && !msg.isImage && (
          <div className="row justify-content-between mb-1">
            <div className="col-auto pe-0">
              <i className="fa-solid fa-file"></i>
            </div>

            <a
              href={`${axios.defaults.baseURL}/uploads/${msg.filePath}`}
              download={msg.fileName}
              id={msg.filePath}
              className="text-white hover-dark col"
            >
              {msg.fileName}
            </a>
          </div>
        )}

        {msg.fileName && msg.isImage && (
          <>
            <div onClick={() => setImgShow(true)} className="m-0 mb-1 p-0">
              <img
                src={`${axios.defaults.baseURL}/uploads/${msg.filePath}`}
                alt={msg.filePath}
                width={"100%"}
                style={{ pointerEvents: "all", cursor: "pointer" }}
                className="rounded m-0 p-0"
              />
            </div>
            <ViewImage
              key={msg.filePath}
              imgShow={imgShow}
              setImgShow={setImgShow}
              filePath={msg.filePath}
            />
          </>
        )}
        {!edit ? (
          <span className="text-start">{msg.text}</span>
        ) : (
          <>
            <textarea
              cols={35}
              rows={msg.text?.length / 30 || 2}
              type="text"
              value={txtMessage}
              onChange={(e) => setTxtMessage(e.target.value)}
              className="bg-transparent border border-white p-1 px-2 rounded text-white"
            />
            <div className="d-flex gap-2 justify-content-end">
              <i
                className="fa-solid fa-check hover-dark"
                onClick={editMessage}
              ></i>
              <i
                className="fa-solid fa-xmark hover-dark"
                onClick={() => {
                  setTxtMessage(msg.text);
                  setEditDeleteShow(true);
                  setEdit(false);
                }}
              ></i>
            </div>
          </>
        )}
        <div className="time" style={{ opacity: "70%" }}>
          {msg.createdAt.split("T")[1].substring(0, 5)}
        </div>
        {editDeleteShow && (
          <div className={`position-relative`}>
            <div className="position-absolute d-flex edit-delete-messsage">
              <i
                className="fa-solid fa-pen hover-dark"
                onClick={() => {
                  setEdit(true);
                }}
              ></i>
              <i
                className="fa-solid fa-eraser hover-dark"
                onClick={deleteMessage}
              ></i>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ViewImage({ imgShow, setImgShow, filePath }) {
  return (
    <div
      className={`w-100 h-100 fixed-top rounded ${
        !imgShow ? "d-none" : "d-block"
      }`}
      style={{ backgroundColor: "rgb(0, 0, 0, 0.6" }}
    >
      <img
        className={`top-0 left-0 fixed-top mx-auto pt-4 show-image ${
          !imgShow ? "d-none" : "d-block"
        }`}
        src={`${axios.defaults.baseURL}/uploads/${filePath}`}
        alt={filePath}
        style={{ zIndex: "5" }}
      ></img>
      <i
        className="fa-solid fa-close pe-auto position-absolute end-0 pt-4 pe-4 fs-2"
        onClick={() => {
          setImgShow(false);
        }}
        style={{ cursor: "pointer", zIndex: 5 }}
      ></i>
    </div>
  );
}

function NewMessagePanel({ setMessages, messagesContainerEnd, handleMessage }) {
  const [messageText, setMessageText] = useState("");

  const { setWs, ws, selectedChat, id, setSelectedChatMessages } =
    useContext(UserContext);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      document.getElementById("anchor").scrollIntoView();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [selectedChat]);

  const sendMessage = function (e, file) {
    e?.preventDefault();

    if (!file && !messageText) return;

    if (ws.readyState === 2 || ws.readyState === 3) {
      console.log("reconnecting");
      const socket = new WebSocket("ws://localhost:3001");
      socket.addEventListener("message", handleMessage);
      setWs(socket);
      setTimeout(
        () =>
          socket.send(
            JSON.stringify({
              message: messageText,
              to: selectedChat,
              fileName: file?.name,
              fileData: file?.data,
              isImage: file?.isImage,
            })
          ),
        300
      );
    } else {
      ws.send(
        JSON.stringify({
          message: messageText,
          to: selectedChat,
          fileName: file?.name,
          fileData: file?.data,
          isImage: file?.isImage,
        })
      );
    }

    if (file) {
      setTimeout(
        () =>
          axios
            .get(`/messages/${selectedChat}`)
            .then((res) => {
              setSelectedChatMessages(res.data.messages);
            })
            .catch((err) => {
              console.log(err);
            }),
        600
      );
      setTimeout(
        () =>
          messagesContainerEnd.current.scrollIntoView({ behavior: "smooth" }),
        700
      );
    } else {
      const date = new Date();

      setMessages((msgs) => [
        ...msgs,
        {
          text: messageText,
          from: id,
          _id: Date.now(),
          createdAt: date.toISOString(),
        },
      ]);
    }
    setMessageText("");

    setTimeout(
      () => messagesContainerEnd.current.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const sendAttachmentFile = function (e, isImage) {
    if (!e.target?.files[0]) return;

    const file = e.target?.files[0];
    e.target.value = null;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (ev) {
      sendMessage(null, {
        name: file.name,
        data: ev.target.result,
        isImage,
      });
    };
  };

  return (
    <form
      className="col align-self-end pb-1 row gap-1 justify-content-center send-message-div mx-auto px-3 col-lg-9"
      onSubmit={sendMessage}
    >
      <textarea
        type="text"
        placeholder="Type your message."
        className="p-2 px-3 col rounded input-search-user"
        rows="1"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />
      <div className="dropup-center dropup col-auto px-0">
        <button
          className="p-2 px-3 rounded dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa-solid fa-paperclip"></i>
        </button>
        <ul className="dropdown-menu text-center container mb-1 others-message">
          <div className="d-inline-block px-1" key="li1">
            <input
              type="file"
              className="d-none"
              id="attachmentFile"
              onChange={sendAttachmentFile}
            />
            <label
              className="p-2 px-3 rounded pointer pe-auto"
              role="button"
              htmlFor="attachmentFile"
            >
              <i className="fa-solid fa-file"></i>
            </label>
          </div>
          <div className="d-inline-block px-1" key="li2">
            <input
              type="file"
              className="d-none"
              id="attachmentImage"
              accept="image/png, image/gif, image/jpeg"
              onChange={(e) => sendAttachmentFile(e, true)}
            />
            <label
              className="p-2 px-3 rounded pointer pe-auto"
              role="button"
              htmlFor="attachmentImage"
            >
              <i className="fa-solid fa-image"></i>
            </label>
          </div>
        </ul>
      </div>

      <button className="p-2 px-3 col-auto rounded" type="submit">
        <i className="fa-solid fa-paper-plane"></i>
      </button>
    </form>
  );
}
