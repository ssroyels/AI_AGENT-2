import { io } from "socket.io-client";

let socketInstance = null;

/* -------------------------------------------------------------------------- */
/* INIT SOCKET */
/* -------------------------------------------------------------------------- */
export const initializeSocket = (projectId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("❌ Socket init blocked: No token found");
    return null;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(import.meta.env.VITE_API_URL, {
    transports: ["websocket"],
    auth: {
      token, // fresh token
    },
    query: {
      projectId,
    },
  });

  socketInstance.on("connect", () => {
    console.log("🟢 Socket connected:", socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.error("🔴 Socket connection error:", err.message);
  });

  return socketInstance;
};

/* -------------------------------------------------------------------------- */
/* RECEIVE MESSAGE */
/* -------------------------------------------------------------------------- */
export const receiveMessage = (eventName, cb) => {
  if (!socketInstance) return;
  socketInstance.off(eventName);
  socketInstance.on(eventName, cb);
};

/* -------------------------------------------------------------------------- */
/* SEND MESSAGE */
/* -------------------------------------------------------------------------- */
export const sendMessage = (eventName, data) => {
  if (!socketInstance) {
    console.warn("⚠️ Socket not initialized");
    return;
  }
  socketInstance.emit(eventName, data);
};

/* -------------------------------------------------------------------------- */
/* DISCONNECT SOCKET (ON LOGOUT) */
/* -------------------------------------------------------------------------- */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
