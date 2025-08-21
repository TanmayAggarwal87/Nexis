import { CloudUpload, Download, File, LogOut, Users, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import React from "react";

function FileSharing() {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop: (acceptedFiles) => {
        console.log(acceptedFiles);
      },
    });

  return (
    <div>
      <div
        id="headr"
        className="flex justify-between items-center flex-row 
             mx-4 sm:mx-8 md:mx-[100px] 
             max-w-full md:max-w-screen 
             bg-white border border-gray-400 
             px-3 sm:px-4 py-2 rounded-xl mt-3 sm:mt-5"
      >
        {/* Left */}
        <div
          id="left"
          className="flex justify-between items-start flex-col gap-2 sm:gap-3"
        >
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <h1 className="flex items-center text-xl sm:text-2xl font-bold text-gray-900 tracking-wide">
              NE
              <span className="text-indigo-500 h-full">
                <X className="w-5 h-7 sm:w-6 sm:h-8 sm:mt-1" strokeWidth={5} />
              </span>
              IS
            </h1>
          </div>
          <div className="flex justify-center items-center flex-row gap-2 flex-wrap">
            <div className="badge badge-soft badge-success text-xs sm:text-sm">
              • Connected
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 tracking-widest">
              • NEXIS-7429
            </p>
          </div>
        </div>

        {/* Right */}
        <div
          id="right"
          className="flex justify-center items-center flex-row gap-3 sm:gap-3 text-gray-500"
        >
          <div className="flex justify-center items-center flex-row gap-1 text-xs sm:text-sm">
            <Users size={16} className="sm:size-4" />
            <p className="hidden sm:block">2 connected</p>
          </div>

          <button
            className="flex justify-center items-center flex-row gap-1 text-xs sm:text-sm 
                 px-2 py-1 border border-gray-400 rounded-lg cursor-pointer"
          >
            <LogOut size={16} className="sm:size-4" />
            <p className="hidden md:block">Disconnect</p>
          </button>
        </div>
      </div>

      {/* SHARINF SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-6 md:mx-[100px] mt-10">
        {/* Upload Section */}
        <div>
          <label
            {...getRootProps()}
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center h-[300px] w-full p-8 bg-white border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:border-gray-600 transition"
          >
            <CloudUpload className="w-12 h-12 text-gray-600 mb-3" />
            <span className="text-gray-700 font-medium">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop files here, or click to select"}
            </span>
            <input
              {...getInputProps()}
              id="file-upload"
              type="file"
              className="hidden"
            />
          </label>

          <ul className="mt-4">
            {acceptedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-700">
                <div className="flex justify-start truncate hover:bg-indigo-50 items-center flex-row gap-2 mb-2 py-2 px-4 rounded-xl transition-all duration-300 border-1 border-indigo-500 bg-indigo-300/20 text-black font-medium tracking-wider">
                  <File /> {file.name} ({Math.round(file.size / 1024)} KB)
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Files Received Section */}
        <label className="flex flex-col items-center justify-center h-[300px] w-full p-8 bg-white border-2 border-dashed border-gray-400 rounded-2xl cursor-pointer hover:border-gray-600 transition">
          <Download className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-700 font-medium">View Files Received</p>
        </label>
      </div>
    </div>
  );
}

export default FileSharing;
