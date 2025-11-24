import { getSocket } from "./socket";

export const testSocket = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected")
    return;
  }

  if (off) {
    socket.off("testSocket", payload);
  } else if (typeof payload === "function") {
    socket.on("testSocket", payload);
  } else{
    socket.emit("testSocket", payload);
  }
};

export const updateProfile = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected")
    return;
  }

  if (off) {
    socket.off("updateProfile", payload);
  } else if (typeof payload === "function") {
    socket.on("updateProfile", payload);
  } else{
    socket.emit("updateProfile", payload);
  }
};

// Add a separate function for registering the updateProfile listener
export const onUpdateProfile = (callback: (data: any) => void, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected")
    return;
  }

  if (off) {
    socket.off("updateProfileSuccess", callback);
    socket.off("updateProfileError", callback);
  } else {
    socket.on("updateProfileSuccess", callback);
    socket.on("updateProfileError", callback);
  }
};

export const getContacts = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected")
    return;
  }

  if (off) {
    socket.off("getContacts", payload);
  } else if (typeof payload === "function") {
    socket.on("getContacts", payload);
  } else{
    socket.emit("getContacts", payload);
  }
}; 

export const newConversation = (payload: any, off: boolean = false) => {
  const socket = getSocket();
  if (!socket) {
    console.log("Socket not connected")
    return;
  }

  if (off) {
    socket.off("newConversation", payload);
    socket.off("newConversationError", payload);
  } else if (typeof payload === "function") {
    socket.on("newConversation", payload);
    socket.on("newConversationError", payload);
  } else{
    socket.emit("newConversation", payload);
  }
}; 