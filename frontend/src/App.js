// src/App.js
import React from "react";
import "./App.css";
import History from "./History";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Listening History</h1>
      </header>
      <History />
    </div>
  );
}

export default App;
