// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";
import History from "./History";
import SpotifyPlayer from "./SpotifyPlayer";

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    // Fetch token from backend
    fetch("http://localhost:3000/token")
      .then((response) => response.json())
      .then((data) => setToken(data.access_token))
      .catch((error) => console.error("Error fetching token:", error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Listening History</h1>
        <a href="http://localhost:3000">
          <h2>Login</h2>
        </a>
      </header>
      <History />
      {token && <SpotifyPlayer token={token} />}
    </div>
  );
}

export default App;
