// src/History.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Track {
  albumArt: string;
  trackName: string;
  artistName: string;
  playedAt: string;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<Track[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:3000/history');
        if (!response.data) {
          throw new Error('No data received');
        }
        setHistory(response.data.reverse());
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
  
    fetchHistory();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Listening History</h1>
      <div className="space-y-4">
        {history.map((track, index) => (
          <div key={index} className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md">
            <img src={track.albumArt} alt={track.trackName} className="w-20 h-20 rounded-lg" />
            <div className="ml-4">
              <div className="text-xl font-bold">{track.trackName}</div>
              <div className="text-gray-400">{track.artistName}</div>
              <div className="text-gray-500 text-sm">{new Date(track.playedAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
