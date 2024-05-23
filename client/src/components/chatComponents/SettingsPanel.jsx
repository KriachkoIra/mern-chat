import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";

export default function SettingsPanel() {
  const { id, avatar, setAvatar, username, setUsername } =
    useContext(UserContext);

  const [usernameField, setUsernameField] = useState("");

  const changeAvatar = function (e) {
    if (!e.target?.files[0]) return;

    const file = e.target?.files[0];
    e.target.value = null;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (ev) {
      axios
        .post(`/users/avatar`, {
          fileName: file.name,
          data: ev.target.result,
        })
        .then((res) => {
          setAvatar(res.data.avatar);
        })
        .catch((err) => {
          console.log(err);
        });
    };
  };

  const saveUsername = function () {
    axios
      .patch(`/users`, {
        username: usernameField,
      })
      .then(() => {
        setUsername(usernameField);
        setUsernameField("");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="col-sm-4 col-md-3 border-gray-left mr-1 py-4 px-4 text-center">
      <h4 className="mb-3">Settings</h4>
      <h6>Avatar</h6>
      <div
        className="d-inline-block px-1 avatar-change pt-3"
        style={
          avatar && {
            backgroundImage: `url(${axios.defaults.baseURL}/uploads/avatars/${avatar})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }
        }
      >
        <input
          type="file"
          className="d-none"
          id="avatarImage"
          accept="image/png, image/gif, image/jpeg"
          onChange={(e) => changeAvatar(e)}
        />
        <label
          className="p-2 px-3 rounded pointer pe-auto"
          role="button"
          htmlFor="avatarImage"
        >
          <i className="fa-solid fa-up-long fs-1 pt-2"></i>
        </label>
      </div>
      <h6 className="mt-3">Username</h6>
      <input
        type="text"
        placeholder={username}
        className="block rounded p-2 mb-2 w-100 username-change"
        value={usernameField}
        onChange={(e) => setUsernameField(e.target.value)}
        required
      />
      <button
        className="block rounded p-2 px-4 username-change-save"
        onClick={saveUsername}
      >
        Save
      </button>
    </div>
  );
}
