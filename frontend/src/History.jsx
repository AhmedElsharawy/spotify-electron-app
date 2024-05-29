import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css'; // Create this CSS file for styling

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3000/history');
        setHistory(response.data.reverse());
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h1>Listening History</h1>
      <div className="history-container">
        {history.map((track, index) => (
          <div key={index} className="track">
            <img src={track.albumArt} alt={track.trackName} className="album-art" />
            <div className="track-info">
              <strong>{track.trackName}</strong> by {track.artistName} on {new Date(track.playedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
