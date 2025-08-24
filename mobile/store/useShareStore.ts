import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { axiosInstance } from "../libs/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode as atob, encode as btoa } from "base-64";
import * as FileSystem from 'expo-file-system';

const BASE_URL = "http://192.168.29.59:4000/";
const CHUNK_SIZE = 64 * 1024;

interface FileInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  totalChunks: number;
  receivedChunks: number;
  chunks: Uint8Array[];
  progress: number;
}

interface SessionState {
  userConnected: boolean;
  sessionId: string | null;
  socket: Socket | null;
  files: any[];
  selectedFiles: any[];
  incomingFiles: Record<string, FileInfo>;
  status: "disconnected" | "waiting" | "connected";
  peerConnected: boolean;
  connectUser: () => Promise<void>;
  connectSocket: () => void;
  sendFiles: (files: any[]) => Promise<void>;
  disconnectSocket: () => void;
  joinSession: (joinSessionId: string) => Promise<void>;
  closeSession: () => Promise<void>;
  setSessionId: (id: string | null) => void;
  setUserConnected: (connected: boolean) => void;
  setStatus: (status: SessionState["status"]) => void;
  setPeerConnected: (connected: boolean) => void;
  setSelectedFiles: (files: any[]) => void;
  clearSelectedFiles: () => void;
  removeSelectedFile: (index: number) => void;
  

}

export const useSessionStore = create<SessionState>((set, get) => ({
  userConnected: false,
  sessionId: null,
  socket: null,
  files: [],
  incomingFiles: {},
  status: "disconnected",
  peerConnected: false,
  selectedFiles: [],

  setSessionId: (id) => set({ sessionId: id }),
  setUserConnected: (connected) => set({ userConnected: connected }),
  setStatus: (status) => set({ status }),
  setPeerConnected: (connected) => set({ peerConnected: connected }),
  setSelectedFiles: (files) => set({ selectedFiles: files }),
  clearSelectedFiles: () => set({ selectedFiles: [] }),
  removeSelectedFile: (index) => set((state) => ({
    selectedFiles: state.selectedFiles.filter((_, i) => i !== index)
  })),

  connectUser: async () => {
    try {
      const api = await axiosInstance.get("/create-session");
      const sessionId = api.data.sessionId;
      console.log("Session created:", sessionId);
      set({ sessionId, status: "waiting" });
      await AsyncStorage.setItem("sessionId", sessionId);
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
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected, joining session:", sessionId);
      socket.emit("join-session", sessionId);
    });

    socket.on("waiting-for-peer", (data) => {
      console.log("Waiting for peer");
      set({ status: "waiting", userConnected: false, peerConnected: false });
    });

    socket.on("connection-established", (data) => {
      console.log("Connection established with peer");
      set({ 
        userConnected: true, 
        status: "connected", 
        peerConnected: true 
      });
    });

    socket.on("file-receiving-start", (data) => {
      console.log("File receiving started:", data.fileName);
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

   socket.on("file-receiving-end", async (data) => {
  const { fileName, fileHash } = data;
  console.log("File receiving completed:", fileName);
  
  try {
    const state = get();
    const fileInfo = state.incomingFiles[fileName];
    if (!fileInfo) {
      console.error("File info not found for:", fileName);
      return;
    }

    // Calculate total size and combine all chunks
    const totalSize = fileInfo.chunks.reduce(
      (acc, chunk) => acc + (chunk?.length || 0),
      0
    );
    
    if (totalSize === 0) {
      console.error("No data received for file:", fileName);
      return;
    }

    const combined = new Uint8Array(totalSize);
    let offset = 0;

    for (const chunk of fileInfo.chunks) {
      if (chunk) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
    }

    // Save the file as binary data instead of base64
    const fileUri = FileSystem.cacheDirectory + fileName;
    
    // Convert Uint8Array to base64 properly
    let binary = '';
    const bytes = new Uint8Array(combined);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    const base64Data = btoa(binary);
    
    // Write the file with proper base64 encoding
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Verify the file was written correctly
    const fileInfoWritten = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfoWritten.exists) {
      throw new Error("File was not written successfully");
    }

    console.log("File successfully received and saved:", fileName, "Size:", fileInfo.fileSize);

    // Update state
    set((state) => {
      const { [fileName]: removed, ...remainingIncoming } = state.incomingFiles;
      return {
        incomingFiles: remainingIncoming,
        files: [...state.files, {
          name: fileName,
          type: fileInfo.fileType,
          size: fileInfo.fileSize,
          uri: fileUri,
          lastModified: Date.now(),
        }],
      };
    });

  } catch (error) {
    console.error("Error processing received file:", error);
  }
});

    socket.on("joined-session", (data) => {
      console.log("Joined session successfully");
      set({ userConnected: true, status: "connected" });
    });

    socket.on("session-update", (data) => {
      console.log("Session updated:", data);
    });

    socket.on("connect_error", (err) => {
      console.log("Connection error:", err);
      set({ userConnected: false, status: "disconnected", peerConnected: false });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ 
        userConnected: false, 
        status: "disconnected", 
        files: [],
        peerConnected: false 
      });
    });

    socket.on("error", (error) => {
      console.log("Socket error:", error);
      set({ userConnected: false, status: "disconnected", peerConnected: false });
    });

    set({ socket });
  },

  sendFiles: async (files) => {
  const { socket, sessionId } = get();
  if (!socket || !sessionId) {
    console.log("Socket or session ID not available");
    return;
  }

  for (const file of files) {
    try {
      console.log("Processing file:", file.name);
      
      // For React Native, read the file from the URI
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        console.error("File does not exist:", file.uri);
        continue;
      }

      // Read the file as base64
      const base64Content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Content);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE);
      console.log(`Sending file: ${file.name}, size: ${file.size}, chunks: ${totalChunks}`);

      // Emit start event
      socket.emit("share-files-start", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        totalChunks,
      });

      // Send chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, arrayBuffer.byteLength);
        const chunk = arrayBuffer.slice(start, end);
        
        // Convert chunk to base64 for transmission
        const chunkArray = new Uint8Array(chunk);
        let binaryString = '';
        for (let i = 0; i < chunkArray.byteLength; i++) {
          binaryString += String.fromCharCode(chunkArray[i]);
        }
        const chunkData = btoa(binaryString);

        socket.emit("share-files-chunk", {
          fileName: file.name,
          chunkIndex,
          chunkData,
        });

        // Update progress (optional)
        const progress = Math.round((chunkIndex + 1) / totalChunks * 100);
        console.log(`File ${file.name} progress: ${progress}%`);

        // Add a small delay between chunks to avoid overwhelming the connection
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Emit end event
      socket.emit("share-files-end", {
        fileName: file.name,
        fileHash: "placeholder-hash",
      });

      console.log(`File ${file.name} sent successfully`);

    } catch (error) {
      console.error(`Error sending file ${file.name}:`, error);
    }
  }
},

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
    }
    set({
      socket: null,
      userConnected: false,
      status: "disconnected",
      files: [],
      peerConnected: false,
    });
  },

  joinSession: async (joinSessionId) => {
  try {
    if (!joinSessionId || joinSessionId.trim() === "") {
      throw new Error("Invalid session ID");
    }

    const { sessionId: currentSessionId, socket: currentSocket } = get();

    // If we're already in this session, do nothing
    if (joinSessionId === currentSessionId && currentSocket?.connected) {
      return;
    }

    // First, check if the session exists
    const res = await axiosInstance.get(`/join/${joinSessionId}`);
    
    // Disconnect current socket if connected
    if (currentSocket?.connected) {
      currentSocket.disconnect();
    }

    // Reset state and set new session ID
    set({
      sessionId: joinSessionId,
      userConnected: false,
      status: "waiting",
      socket: null,
      peerConnected: false,
      files: [],
      incomingFiles: {},
    });

    await AsyncStorage.setItem("sessionId", joinSessionId);
    
    // Connect to the new session
    get().connectSocket();
  } catch (err: any) {
    console.log("Error joining session:", err);
    throw new Error(err.response?.data?.message || "Failed to join session");
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

    await AsyncStorage.removeItem("sessionId");
    set({
      socket: null,
      userConnected: false,
      sessionId: null,
      status: "disconnected",
      files: [],
      peerConnected: false,
    });
  },
}));