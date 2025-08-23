import React from 'react'
import QRcode from './components/MainPage'
import MainPage from './components/MainPage'
import FileSharing from './components/FileSharing'
import {Toaster} from "react-hot-toast"
import { useSessionStore } from './store/useShareAuth'
import { Route, Routes } from 'react-router-dom'

function App() {
  const {userConnected,sessionId} = useSessionStore()

  return (
    <div>
      <Routes>
      <Route path="/" element={!userConnected ? <MainPage /> : <FileSharing />} />
        
        

      </Routes>
      
      <Toaster/>
    </div>
  )
}

export default App