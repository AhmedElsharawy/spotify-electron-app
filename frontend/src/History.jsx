// src/History.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3000/history');
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h1>Listening History</h1>
      <ul>
        {history.map((track, index) => (
          <li key={index}>
            <strong>{track.trackName}</strong> by {track.artistName} on {new Date(track.playedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
