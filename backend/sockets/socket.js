import express from "express";
import { Server } from "socket.io";
import http from "http";

export const app = express();
export const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: ["https://nexis-share.netlify.app","exp://rf303q0-anonymous-8081.exp.direct"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const sessions = new Map();

io.on("connection", (socket) => {

  socket.on("join-session", (sessionId) => {
    if (!sessions.has(sessionId)) {
      return socket.emit("error", "Invalid session ID");
    }

    const members = sessions.get(sessionId);
    if (members.length === 0) {
      socket.join(sessionId);
      members.push(socket.id);
      sessions.set(sessionId, members);
      socket.emit("waiting-for-peer", { sessionId });
      return;
    }
    if (members.length === 1) {
      socket.join(sessionId);
      members.push(socket.id);
      sessions.set(sessionId, members);
      io.to(sessionId).emit("connection-established", {
        sessionId,
        members: members.length,
      });

      return;
    }
    if (members.length >= 2) {
      return socket.emit("error", "Session full");
    }
  });

  socket.on("share-files", (data) => {

    const rooms = Array.from(socket.rooms);
    const sessionRoom = rooms.find((room) => room !== socket.id);

    if (sessionRoom) {
      socket.to(sessionRoom).emit("share-files", data);
    } else {
      console.log("No session room found for socket:", socket.id);
    }
  });
  socket.on("share-files-start", (data) => {
  const rooms = Array.from(socket.rooms);
  const sessionRoom = rooms.find((room) => room !== socket.id);
  
  if (sessionRoom) {
    socket.to(sessionRoom).emit("file-receiving-start", data);
  }
});

socket.on("share-files-chunk", (data) => {
  const rooms = Array.from(socket.rooms);
  const sessionRoom = rooms.find((room) => room !== socket.id);
  
  if (sessionRoom) {
    socket.to(sessionRoom).emit("file-receiving-chunk", data);
  }
});

socket.on("share-files-end", (data) => {
  const rooms = Array.from(socket.rooms);
  const sessionRoom = rooms.find((room) => room !== socket.id);
  
  if (sessionRoom) {
    socket.to(sessionRoom).emit("file-receiving-end", data);
  }
});
  socket.on("disconnect", () => {
    for (const [sessionId, members] of sessions.entries()) {
      const updated = members.filter((id) => id !== socket.id);
      if (updated.length === 0) {
        sessions.delete(sessionId);

      } else {
        sessions.set(sessionId, updated);
      }
    }
  });
});
