// ============================================================
// Socket Context — Global Socket.io connection
// ============================================================
// Connects to Socket.io when user is logged in.
// Disconnects when they logout.
// Any component can use useSocket() to emit/listen for events.
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !user) {
      // No user = no socket
      return;
    }

    // Connect to Socket.io with JWT
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
    });

    newSocket.on("connection_ack", (data) => {
      console.log("✅ Server acknowledged:", data);
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    setSocket(newSocket);

    // Cleanup: disconnect when user logs out or component unmounts
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
