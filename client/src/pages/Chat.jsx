import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import "../styles/chat.css";

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    <div className="chat-layout">
      <Sidebar activeRoom={activeRoom} onSelectRoom={setActiveRoom} />
      <ChatWindow room={activeRoom} />
    </div>
  );
};

export default Chat;
