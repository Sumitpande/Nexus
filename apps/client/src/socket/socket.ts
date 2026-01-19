import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:4000", {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket() {
  const token = useAuthStore.getState().accessToken;
  if (!token) return;

  const s = getSocket();
  s.auth = { token };
  s.connect();
}

export function disconnectSocket() {
  socket?.disconnect();
}
