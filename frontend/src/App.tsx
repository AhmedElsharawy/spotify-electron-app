// src/App.tsx
import React, { useEffect, useState } from "react";
import History from "./History";
import SpotifyPlayer from "./SpotifyPlayer";

const App: React.FC = () => {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:3000/token")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setToken(data.access_token))
      .catch((error) => console.error("Error fetching token:", error));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-4xl font-bold text-center flex-grow">Spotify Web Player</h1>
        <nav>
          <a href="http://localhost:3000" className="text-lg text-blue-500 hover:text-blue-700">
            Login
          </a>
        </nav>
      </header>
      <div className="flex flex-grow">
        <div className="w-1/2 p-4">
          {token && <SpotifyPlayer token={token} setToken={setToken} />}
        </div>
        <div className="w-1/2 p-4">
          <History />
        </div>
      </div>
    </div>
  );
}

export default App;
