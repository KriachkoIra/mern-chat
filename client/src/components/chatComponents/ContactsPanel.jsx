import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import SearchContactModal from "./SearchContactModal";

export default function ContactsPanel() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");

  const { username, id } = useContext(UserContext);

  function getContacts() {
    axios
      .get(`users/${id}/contacts`)
      .then((res) => {
        console.log(res);
        setContacts(res.data.contacts);
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  }

  useEffect(getContacts, []);

  return (
    <>
      <div className="col-sm-4 col-md-3 border-gray-right mr-1 py-2 px-4">
        <div className="row gap-1 align-items-center py-2 mb-2">
          <div className="avatar avatar-main text-center pt-2 rounded-circle col-auto">
            {username[0]}
          </div>
          <h4 className="col">{username}</h4>
        </div>

        <div className="row mb-3">
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
              <Contact contact={user} key={user.username} />
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

function Contact({ contact }) {
  return (
    <div
      className="row gap-3 align-items-center py-2 border-gray-bottom"
      style={{ cursor: "pointer" }}
    >
      <Avatar username={contact.username} /> {contact.username}
    </div>
  );
}

function Avatar({ username }) {
  return (
    <div className="avatar text-center pt-2 rounded-circle">{username[0]}</div>
  );
}
