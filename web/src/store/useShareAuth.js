import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../libs/axios.js";

const BASE_URL = "https://nexis-production.up.railway.app/";
const CHUNK_SIZE = 64 * 1024;

export const useSessionStore = create((set, get) => ({
  userConnected: false,
  sessionId: null,
  socket: null,
  files :[],
  incomingFiles:{},
  status: "disconnected",

  connectUser: async () => {
    try {
      const api = await axiosInstance.get("/create-session");
      const sessionId = api.data.sessionId;
      set({ sessionId: sessionId, status: "waiting" });
      localStorage.setItem("sessionId", sessionId);
      get().connectSocket();
    } catch (err) {

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
      socket.emit("join-session", sessionId);
    });

    socket.on("waiting-for-peer", (data) => {
      set({ status: "waiting", userConnected: false });
    });

    socket.on("connection-established", (data) => {
      set({ userConnected: true, status: "connected" });
    });

     socket.on("file-receiving-start", (data) => {
      set((state) => ({
        incomingFiles: {
          ...state.incomingFiles,
          [data.fileName]: {
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileType: data.fileType,
            totalChunks: data.totalChunks,
            receivedChunks: 0,
            chunks: [],
          },
        },
      }));
    });

    socket.on("file-receiving-chunk", (data) => {
      const { fileName, chunkIndex, chunkData } = data;
      set((state) => {
        const fileInfo = state.incomingFiles[fileName];
        if (!fileInfo) return state;

        const binaryString = atob(chunkData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const updatedChunks = [...fileInfo.chunks];
        updatedChunks[chunkIndex] = bytes;

        return {
          incomingFiles: {
            ...state.incomingFiles,
            [fileName]: {
              ...fileInfo,
              receivedChunks: fileInfo.receivedChunks + 1,
              chunks: updatedChunks,
            },
          },
        };
      });
    });

    socket.on("file-receiving-end", (data) => {
      const { fileName, fileHash } = data;
      set((state) => {
        const fileInfo = state.incomingFiles[fileName];
        if (!fileInfo) return state;

        const totalSize = fileInfo.chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalSize);
        let offset = 0;
        
        for (const chunk of fileInfo.chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }

        const file = new File([combined], fileName, {
          type: fileInfo.fileType,
          lastModified: Date.now(),
        });

        const { [fileName]: removed, ...remainingIncoming } = state.incomingFiles;
        
        return {
          incomingFiles: remainingIncoming,
          files: [...state.files, file],
        };
      });
    });

    socket.on("joined-session", (data) => {
      set({ userConnected: true, status: "connected" });
    });

    socket.on("session-update", (data) => {
    });

    socket.on("connect_error", (err) => {
      set({ userConnected: false, status: "disconnected" });
    });

    socket.on("disconnect", (reason) => {
      set({ userConnected: false, status: "disconnected" , files:[]});
    });

    socket.on("error", (error) => {
      set({ userConnected: false, status: "disconnected" });
    });

    set({ socket });
  },

   sendFiles: async (files) => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE);
      
      socket.emit("share-files-start", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks,
      });

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, arrayBuffer.byteLength);
        const chunk = arrayBuffer.slice(start, end);
        const chunkData = btoa(
          new Uint8Array(chunk).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        socket.emit("share-files-chunk", {
          fileName: file.name,
          chunkIndex,
          chunkData,
        });

        await new Promise(resolve => setTimeout(resolve, 10));
      }

      socket.emit("share-files-end", {
        fileName: file.name,
        fileHash: "placeholder-hash", 
      });
    }
  },


  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null, userConnected: false, status: "disconnected", files:[] });
  },

  joinSession: async (joinSessionId) => {
    try {
      if(!joinSessionId || joinSessionId.trim() === ''){
        return;
      }
      
      const { sessionId } = get();
      
      if(joinSessionId !== sessionId){
        const res = await axiosInstance.get(`/join/${joinSessionId}`);
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
    }
  },

  closeSession: async () => {
    const { socket, sessionId } = get();

    if (socket?.connected) {
      socket.disconnect();
    }
    if (sessionId) {
      try {
        await axiosInstance.delete(`/delete-session/${sessionId}`);
      } catch (err) {
        console.log("Error deleting session:", err);
      }
    }
    
    localStorage.removeItem("sessionId");
    set({ socket: null, userConnected: false, sessionId: null, status: "disconnected" , files:[]});
    get().connectUser();
  },
}));