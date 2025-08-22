import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../libs/axios.js";

const BASE_URL = "http://localhost:4000/";

export const useSessionStore = create((set, get) => ({
  userConnected: false,
  sessionId: null,
  socket: null,
  status: "disconnected", // Add status tracking: disconnected, waiting, connected

  connectUser: async () => {
    try {
      const api = await axiosInstance.get("/create-session");
      const sessionId = api.data.sessionId;
      console.log("Session created:", sessionId);
      set({ sessionId: sessionId, status: "waiting" });
      localStorage.setItem("sessionId", sessionId);
      get().connectSocket();
    } catch (err) {
      console.log("Error creating session:", err);
    }
  },

  connectSocket: () => {
    const { sessionId } = get();
    if (!sessionId || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
      reconnection: false,
      transports: ["websocket","polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-session", sessionId);
    });

    socket.on("waiting-for-peer", (data) => {
      console.log("Waiting for another user to join...");
      set({ status: "waiting", userConnected: false });
    });

    socket.on("connection-established", (data) => {
      console.log("Connection established with peer!");
      set({ userConnected: true, status: "connected" });
    });

    socket.on("joined-session", (data) => {
      console.log("Joined session:", data.sessionId);
      set({ userConnected: true, status: "connected" });
    });

    socket.on("session-update", (data) => {
      console.log("Updated members:", data.members);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket error:", err);
      set({ userConnected: false, status: "disconnected" });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ userConnected: false, status: "disconnected" });
    });

    socket.on("error", (error) => {
      console.log("Socket error:", error);
      set({ userConnected: false, status: "disconnected" });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      console.log("Socket disconnected manually");
    }
    set({ socket: null, userConnected: false, status: "disconnected" });
  },

  joinSession: async (joinSessionId) => {
    try {
      if(!joinSessionId || joinSessionId.trim() === ''){
        return;
      }
      
      const { sessionId } = get();
      
      // Only join if it's a different session
      if(joinSessionId !== sessionId){
        const res = await axiosInstance.get(`/join/${joinSessionId}`);
        console.log("Join session response:", res.data);
        
        // Clear current session and set new one
        if (get().socket?.connected) {
          get().socket.disconnect();
        }
        
        set({ 
          sessionId: joinSessionId, 
          userConnected: false,
          status: "waiting",
          socket: null 
        });
        
        localStorage.setItem("sessionId", joinSessionId);
        get().connectSocket();
      }
      
    } catch (err) {
      console.log("Error joining session:", err);
      // Show error message to user instead of auto-creating
    }
  },

  closeSession: async () => {
    const { socket, sessionId } = get();
    
    console.log("Closing session:", sessionId);

    // Clean up socket first
    if (socket?.connected) {
      socket.disconnect();
      console.log("Socket disconnected");
    }
    
    // Delete old session from backend
    if (sessionId) {
      try {
        await axiosInstance.delete(`/delete-session/${sessionId}`);
        console.log(`Session ${sessionId} deleted from backend`);
      } catch (err) {
        console.log("Error deleting session:", err);
      }
    }
    
    // Clear old state
    localStorage.removeItem("sessionId");
    set({ socket: null, userConnected: false, sessionId: null, status: "disconnected" });
    
    // Create NEW session
    console.log("Creating new session via connectUser...");
    get().connectUser();
  },
}));