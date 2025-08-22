import { ArrowRight, X } from "lucide-react";
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { axiosInstance } from "../libs/axios";
import { useSessionStore } from "../store/useShareAuth.js";
import { useEffect, useState } from "react";

function MainPage() {
  const { connectUser, sessionId, joinSession, userConnected } =useSessionStore();
  

  const [Id, setId] = useState("");


  function handleSession(e) {
    e.preventDefault();
    joinSession(Id);
  }
  useEffect(() => {
    const savedSession = localStorage.getItem("sessionId");
    connectUser()
    if (savedSession) {
      // Only join if we're not already connected
      if (!userConnected) {
        joinSession(Id);
      }
    } else {
      connectUser();
    }
  }, [connectUser, joinSession, userConnected]);

  return (
    <div className="flex justify-center items-center  flex-col gap-2 max-w-screen px-2">
      <div className="text-center space-y-4 mt-10">
        <div className="flex items-center justify-center mb-4">
          <h1 className="flex items-center text-4xl font-bold text-gray-900 tracking-wide">
            NE
            <span className=" text-indigo-500  h-full">
              <X className="w-10 h-10 mt-1" strokeWidth={4} />
            </span>
            IS
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Connect instantly with anyone to share files securely
        </p>
      </div>

      <div className="flex justify-center items-center  flex-col gap-2">
        <div id="qr" className="w-50  h-50 bg-black rounded-xl">
          <QRCodeSVG
            value={`http://localhost:4000/join/${sessionId}`}
            className="h-full w-full rounded-xl"
          />
        </div>

        <div className="max-w-screen mx-2 w-[500px] flex justify-center items-center flex-col gap-3 uppercase font-sans">
          <p className="text-gray-500 font-xl mt-2">Your Connection code</p>
          <div className=" w-full flex justify-center items-center   rounded-lg font-semibold tracking-widest text-xl py-2 border-2 border-gray-500">
            <p>{sessionId}</p>
          </div>
        </div>

        <div className="w-full flex items-center text-gray-500">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="mx-4">OR</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* Label */}
          <p className="text-center text-sm font-medium text-gray-500 tracking-widest mb-2">
            CONNECT TO SOMEONE
          </p>

          {/* Input + Button */}
          <form
            type="submit"
            className="flex items-center mt-4"
            onSubmit={handleSession}
          >
            <input
              type="text"
              value={Id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter connection code or scan QR"
              className="flex-1 h-14 px-4 rounded-lg border border-gray-200 shadow-sm 
                     focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 
                     text-gray-700 placeholder-gray-400 text-sm tracking-wide"
            />
            <button
              type="submit"
              className="ml-3 h-14 w-14 flex items-center justify-center rounded-lg 
                     bg-indigo-500 hover:bg-indigo-500 text-white shadow-md 
                     transition-all duration-200 cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
