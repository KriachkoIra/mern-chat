import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import SearchContactModal from "./SearchContactModal";

export default function ContactsPanel({
  usersOnline,
  setShowSettings,
  removeIndicator,
}) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");

  const {
    username,
    setId,
    setUsername,
    setSelectedChat,
    setSelectedChatMessages,
    ws,
    setWs,
    avatar,
    setAvatar,
  } = useContext(UserContext);

  function getContacts() {
    axios
      .get(`users/contacts`)
      .then((res) => {
        setContacts(res.data.contacts);
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  }

  function logout() {
    axios
      .post(`auth/logout`)
      .then(() => {
        setId(null);
        setSelectedChat(null);
        setSelectedChatMessages([]);
        setAvatar(null);
        ws?.close();
        setWs(null);
        setUsername(null);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(getContacts, []);

  return (
    <>
      <div className="col-sm-4 col-md-3 border-gray-right mr-1 py-2 px-4">
        <div className="row gap-0 align-items-center py-2 mb-2">
          <div
            className="avatar avatar-main text-center pt-2 rounded-circle col-auto"
            style={
              avatar && {
                backgroundImage: `url(${axios.defaults.baseURL}/uploads/avatars/${avatar})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }
            }
          >
            {!avatar && username[0]}
          </div>
          <h5 className="col-auto">{username}</h5>
          <button
            className="col-auto bg-transparent border-0 text-white logout-button px-2"
            onClick={() => setShowSettings((s) => !s)}
          >
            <i className="fa-solid fa-gear"></i>
          </button>
          <button
            className="col-auto bg-transparent border-0 text-white logout-button px-1"
            onClick={logout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>

        <div className="row mb-3">
          <SearchContactPanel serach={search} setSearch={setSearch} />
          <button
            type="button"
            className="col-auto rounded my-bg-transparent"
            onClick={() => setModalIsOpen(true)}
          >
            <i className="fa-solid fa-user-plus"></i>
          </button>
        </div>

        <div className="row justify-content-center">
          {contacts.map((user) =>
            user.username.toLowerCase().includes(search) ? (
              <Contact
                contact={user}
                key={user.username}
                removeIndicator={removeIndicator}
                isOnline={usersOnline.find(
                  (u) => u.id?.localeCompare(user.id) === 0
                )}
              />
            ) : null
          )}
        </div>
      </div>
      {modalIsOpen && (
        <SearchContactModal
          setIsOpen={setModalIsOpen}
          getContacts={getContacts}
        />
      )}
    </>
  );
}

function SearchContactPanel({ search, setSearch }) {
  return (
    <div className="input-group col px-1">
      <input
        type="text"
        className="form-control input-search-user"
        placeholder="Search contact"
        data-bs-theme="dark"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="input-group-append">
        <button
          className="btn btn-outline-secondary btn-search-user"
          type="button"
        >
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
    </div>
  );
}

function Contact({ contact, isOnline, removeIndicator }) {
  const {
    selectedChat,
    setSelectedChat,
    newMessagesContacts,
    setNewMessagesContacts,
  } = useContext(UserContext);

  const isNewMessage = newMessagesContacts.find((c) => c === contact.id);

  return (
    <div
      className={`row gap-3 align-items-center py-2 border-gray-bottom contact-div ${
        contact.id === selectedChat ? "contact-selected" : ""
      }`}
      style={{ cursor: "pointer" }}
      onClick={() => {
        setNewMessagesContacts((nmc) => nmc.filter((c) => c !== contact.id));
        removeIndicator(contact.id);
        setSelectedChat(contact.id);
      }}
    >
      {contact.id === selectedChat && <div className="selected-side"></div>}
      <Avatar
        avatar={contact.avatar}
        username={contact.username}
        isOnline={isOnline}
      />{" "}
      {contact.username}
      {isNewMessage && <span className="new-message"></span>}
    </div>
  );
}

function Avatar({ username, isOnline, avatar }) {
  return (
    <div
      className="avatar text-center pt-2 rounded-circle"
      style={
        avatar && {
          backgroundImage: `url(${axios.defaults.baseURL}/uploads/avatars/${avatar})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }
      }
    >
      {isOnline && <div className="dot"></div>}
      {!avatar && username[0]}
    </div>
  );
}
