# Nexis

Nexis is a full-stack project that brings together **web and mobile** clients with a common backend. The idea was simple: create a smooth file-sharing and session-based experience across platforms — and it turned into a project that taught me a ton about real-time systems.

---

## Features

- **Real-time connections** powered by WebSockets  
- **Cross-platform**: Web client + Mobile client  
- **Chunk-size file transfers** so large files can move smoothly without crashing the system  
- **Session-based sharing** to connect multiple users and manage transfers easily  


---

## Tech Stack

- **Backend**: Node.js + Express + Socket.IO  
- **Web**: React  
- **Mobile**: React Native (Expo)  

---

## Repository Structure

-/backend → Node.js + Socket.IO server
-/web → React frontend
-/mobile → React Native client

## Web
```bash
cd web
npm install
npm run dev
```

# Mobile
```bash
cd mobile
npm install
npx expo start
```

## What I Learned

This project wasn’t just about building something that works it really deepened my understanding of WebSockets and real-time systems. Handling chunk-size file transfers was one of the trickiest but most rewarding parts. Instead of sending full files at once (which can break things for large sizes), I learned how to split files into chunks, transfer them reliably, and reassemble them on the other side.
It gave me a much clearer picture of how apps like file-sharing platforms or even real-time collaboration tools handle data under the hood.

## Future Plans

-Add better UI for progress indicators while transferring files

-Improve reconnection logic for unstable networks

-Explore peer-to-peer connections for faster transfers
