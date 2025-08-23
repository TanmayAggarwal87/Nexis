import { io } from "socket.io-client";

export const socket = io("https://nexis-production.up.railway.app",
  {
    withCredentials: true,
    reconnection:false
  }
);