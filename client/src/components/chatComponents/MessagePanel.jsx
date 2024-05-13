export default function MessagesPanel() {
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
