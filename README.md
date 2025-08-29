#  Nexis

> **Real-time file sharing across web and mobile platforms**

Nexis is a full-stack application that enables seamless file sharing and real-time communication between web and mobile clients. Built with modern technologies and WebSocket connections, it delivers a smooth, cross-platform experience for sharing files of any size.

## ✨ Features

- **🔄 Real-time synchronization** - Instant file transfers powered by WebSockets
- **📱 Cross-platform support** - Works seamlessly on web browsers and mobile devices
- **📦 Chunked file transfers** - Smart file splitting for reliable large file handling
- **👥 Session-based sharing** - Multi-user sessions with easy connection management
- **⚡ Live progress tracking** - Real-time transfer status and progress indicators
- **🔗 Instant connectivity** - No account creation required, just share and go

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.IO** - Real-time bidirectional communication

### Frontend
- **React** - Modern web interface
- **Vite** - Fast development and build tool

### Mobile
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools

## 🏗️ Architecture

```
nexis/
├── backend/          # Node.js + Socket.IO server
├── web/             # React frontend client
└── mobile/          # React Native mobile app
```

## 🌐 Live Deployment

| Platform | URL | Status |
|----------|-----|--------|
| **Web App** | [nexis-share.netlify.app](https://nexis-share.netlify.app) | 🟢 Live |
| **API Backend** | [nexis-api.railway.app](https://nexis-api.railway.app) | 🟢 Live |
| **Mobile App** | Download APK / iOS TestFlight | In Progress |

### Deployment Details
- **Backend**: Deployed on Railway (Port 4000)
- **Frontend**: Deployed on Netlify (Port 5173 in development)
- **Mobile**: Expo development server (Port 8080)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (for mobile development)

### Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:4000
```

### Web Client Setup
```bash
cd web
npm install
npm run dev
# Client runs on http://localhost:5173
```

### Mobile App Setup
```bash
cd mobile
npm install
npx expo start
# Metro bundler runs on http://localhost:8080
```

## 📖 How It Works

1. **Session Creation** - Users create or join sharing sessions
2. **File Selection** - Choose files from device storage
3. **Chunked Transfer** - Files are split into manageable chunks
4. **Real-time Sync** - WebSocket connections ensure instant updates
5. **Progress Tracking** - Live progress bars show transfer status
6. **File Reconstruction** - Chunks are reassembled on the receiving end

## 🔧 Configuration

The application currently runs with default configurations. Backend connects on port 4000, web client on port 5173, and mobile development server on port 8080.

## 📱 Mobile App Distribution

### Android
- Download APK from [Releases](https://github.com/yourusername/nexis/releases)
- Install via `adb install nexis.apk`

### iOS
- Join TestFlight beta program
- Install via Expo Go for development

## 🧠 Technical Deep Dive

### File Chunking Algorithm
```javascript
const CHUNK_SIZE = 64 * 1024; // 64KB chunks
// Files are split into manageable pieces to prevent memory overflow
// and enable resumable transfers
```

### WebSocket Events
- `join-session` - Connect to sharing session
- `file-chunk` - Transfer file piece
- `transfer-progress` - Update progress status
- `transfer-complete` - Signal successful completion

### Error Handling
- Automatic reconnection for dropped connections
- Chunk validation and retry mechanisms
- Progress state persistence across interruptions

## 🎯 What I Learned

Building Nexis was a comprehensive journey into real-time systems and cross-platform development:

- **WebSocket Mastery** - Deep understanding of bidirectional communication patterns
- **File Handling** - Efficient chunked transfer algorithms for large files
- **Cross-Platform Development** - Unified codebase strategies for web and mobile
- **Deployment Architecture** - Modern CI/CD practices with Railway and Netlify
- **Real-time State Management** - Synchronizing state across multiple clients

The chunked file transfer implementation was particularly challenging and rewarding. Instead of attempting to send entire files (which fails for large files and poor connections), I developed a robust system that:
- Splits files into 64KB chunks
- Transfers chunks with progress tracking
- Handles network interruptions gracefully
- Reassembles files with integrity verification

## 🤝 Open for Collaboration

This project is open for collaboration and new ideas! Whether you're interested in contributing code, suggesting features, or discussing improvements, I'd love to hear from you.

**Ways to get involved:**
- 💡 Share ideas for new features or improvements
- 🐛 Report bugs or issues you encounter
- 🚀 Submit pull requests with enhancements
- 📝 Improve documentation or add examples
- 🎨 Contribute to UI/UX design improvements

Feel free to open an issue to start a discussion or reach out if you want to collaborate on making Nexis even better!
