import express from "express"
import { Server } from "socket.io";
import http from "http";





export const app = express();
export const server = http.createServer(app);

export const io = new Server(server,{
  cors: {
    origin: "http://localhost:5173", // frontend
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const sessions = new Map(); // sessionId => [socketId1, socketId2]

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // In your socket.io server
socket.on("join-session", (sessionId) => {
  console.log("Trying to join session:", sessionId);
  
  // Check if session exists
  if (!sessions.has(sessionId)) {
    console.log("Invalid session ID");
    return socket.emit("error", "Invalid session ID");
  }

  const members = sessions.get(sessionId);
  
  // If session is empty (creator), just add the user
  if (members.length === 0) {
    socket.join(sessionId);
    members.push(socket.id);
    sessions.set(sessionId, members);
    socket.emit("waiting-for-peer", { sessionId });
    console.log(`${socket.id} created session ${sessionId}, waiting for peer`);
    return;
  }
  
  // If session has 1 user (waiting), add the second user
  if (members.length === 1) {
    socket.join(sessionId);
    members.push(socket.id);
    sessions.set(sessionId, members);
    
    // Notify BOTH users that connection is established
    io.to(sessionId).emit("connection-established", { 
      sessionId,
      members: members.length 
    });
    
    console.log(`${socket.id} joined session ${sessionId}, connection established`);
    return;
  }
  
  // If session is full (2 users)
  if (members.length >= 2) {
    console.log("Session full");
    return socket.emit("error", "Session full");
  }
});

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (const [sessionId, members] of sessions.entries()) {
      const updated = members.filter((id) => id !== socket.id);
      if (updated.length === 0) {
        sessions.delete(sessionId);
        console.log(`Session ${sessionId} deleted automatically`);
      } else {
        sessions.set(sessionId, updated);
      }
    }
  });
});
