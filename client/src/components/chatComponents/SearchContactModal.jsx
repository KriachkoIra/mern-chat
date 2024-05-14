import { useState, useContext } from "react";
import { UserContext } from "../../context/UserContext";
import axios from "axios";

export default function SearchContactModal({ setIsOpen, getContacts }) {
  const [searchUser, setSearchUser] = useState("");
  const [resultUsers, setResultUsers] = useState([]);

  const { id, username } = useContext(UserContext);

  const handleSearch = function () {
    axios
      .get(`users/contacts?usernameSearch=${searchUser}`)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  };

  const handleChange = function (e) {
    setSearchUser(e.target.value);

    axios
      .get(`users/${id}/seachContacts?usernameSearch=${e.target.value}`)
      .then((res) => {
        console.log(res);
        setResultUsers(res.data.users);
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  };

  return (
    <div className="search-users-modal px-3 py-1 ">
      <div className="row justify-content-between">
        <span className="col col-auto me-auto align-self-center text-left fs-6">
          Search user
        </span>
        <button
          className="col-auto bg-transparent text-white border-0 fs-5"
          onClick={() => setIsOpen(false)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="row mb-3 px-2 mt-2">
        <div className="input-group col px-1">
          <input
            type="text"
            className="form-control input-search-user-light"
            placeholder="Search user"
            data-bs-theme="dark"
            value={searchUser}
            onChange={handleChange}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary my-btn-outline"
              type="button"
              onClick={handleSearch}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </div>
      {resultUsers.length ? (
        resultUsers.map((user) => (
          <SearchUser
            user={user}
            setIsOpen={setIsOpen}
            key={user.username}
            getContacts={getContacts}
          />
        ))
      ) : (
        <p className="text-start text-gray">No results found.</p>
      )}
    </div>
  );
}

function SearchUser({ user, setIsOpen, getContacts }) {
  const { username, id } = useContext(UserContext);

  const handleAdd = function () {
    axios
      .post(`users/${id}/contacts`, { usernameAdd: user.username })
      .then((res) => {
        console.log(res);
        setIsOpen(false);
        getContacts();
      })
      .catch((err) => {
        // setAlert(err.response.data.message);
        console.log(err);
      });
  };

  return (
    <div
      className="row align-items-center py-2 mx-1 border-gray-bottom"
      style={{ cursor: "pointer" }}
    >
      <div className="col row align-items-center gap-3">
        <Avatar username={user.username} /> {user.username}
      </div>
      <button
        className="col-auto text-white bg-transparent border-0"
        onClick={handleAdd}
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
}

function Avatar({ username }) {
  return (
    <div className="avatar text-center pt-2 rounded-circle">{username[0]}</div>
  );
}
