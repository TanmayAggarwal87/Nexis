import express from "express";

import {server,app, io, sessions } from "./sockets/socket.js";
import cors from "cors";


app.use(cors({
  origin: "https://nexis-share.netlify.app",//url update
  credentials: true
}));




app.get("/create-session", (req, res) => {
  const sessionId = Math.floor(100000 + Math.random() * 900000).toString();
  sessions.set(sessionId, []);
  res.json({ sessionId });
});

app.get("/join/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!sessions.has(sessionId)) {
    return res.status(404).send("Session not found");
  }
  res.send(`You can now connect socket with sessionId: ${sessionId}`);
});

app.delete("/delete-session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    const members = sessions.get(sessionId);
    members.forEach(socketId => {
      io.sockets.sockets.get(socketId)?.disconnect();
    });
    
    sessions.delete(sessionId);
  }
  res.sendStatus(200);
});

server.listen(4000, () => console.log("Server running on http://localhost:4000"));
