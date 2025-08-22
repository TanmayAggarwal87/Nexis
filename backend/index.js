import express from "express";

import {server,app, io, sessions } from "./sockets/socket.js";
import cors from "cors";


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));



// Create a new session
app.get("/create-session", (req, res) => {
  const sessionId = Math.floor(100000 + Math.random() * 900000).toString();
  sessions.set(sessionId, []); // ← Empty array, no users yet
  console.log("Created empty session:", sessionId);
  res.json({ sessionId });
});

// Join session via API (just for reference)
app.get("/join/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!sessions.has(sessionId)) {
    return res.status(404).send("Session not found");
  }
  console.log("Joining session via API:", sessionId);
  res.send(`You can now connect socket with sessionId: ${sessionId}`);
});

// Optional: delete session manually
app.delete("/delete-session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    // Disconnect all sockets in this session first
    const members = sessions.get(sessionId);
    members.forEach(socketId => {
      io.sockets.sockets.get(socketId)?.disconnect();
    });
    
    sessions.delete(sessionId);
    console.log(`Session ${sessionId} deleted manually and sockets disconnected`);
  }
  res.sendStatus(200);
});

server.listen(4000, () => console.log("Server running on http://localhost:4000"));
