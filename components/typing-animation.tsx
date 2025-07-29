"use client";

export function TypingAnimation() {
  return (
    <div className="flex items-center space-x-1 p-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-pulse delay-150"></div>
      </div>
      <div className="flex space-x-1 ml-2">
        <div className="w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce delay-200"></div>
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-bounce delay-300"></div>
        <div className="w-1 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce delay-400"></div>
      </div>
      <div className="flex space-x-1 ml-2">
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full animate-pulse delay-500"></div>
        <div className="w-1 h-1 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full animate-pulse delay-600"></div>
      </div>
    </div>
  );
}
