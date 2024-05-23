import React, { useState } from "react";
import { getPlaylistSongs } from "../spotify"; // Adjust this import path as needed
//import SpotifyPlayer from "../comps/SpotifyPlayer"; // Import the new Music Player component

const Playlists = ({ playlists }) => {
  const [openPlaylistId, setOpenPlaylistId] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);

  const toggleDropdown = (playlistId) => {
    if (openPlaylistId === playlistId) {
      setOpenPlaylistId(null);
      setSongs([]);
    } else {
      setOpenPlaylistId(playlistId);
      fetchSongs(playlistId);
    }
  };

  const fetchSongs = async (playlistId) => {
    setLoadingSongs(true);
    try {
      const response = await getPlaylistSongs(playlistId);
      setSongs(response.items); // Ensure response structure matches expected data
      setLoadingSongs(false);
    } catch (error) {
      console.error("Error fetching songs:", error);
      setLoadingSongs(false);
    }
  };

  console.log("songs", songs);

  return (
    <div>
      <h1>Playlists</h1>
      {playlists.map((playlist) => (
        <div key={playlist.id}>
          <button onClick={() => toggleDropdown(playlist.id)}>
            {playlist.name}
          </button>
          {openPlaylistId === playlist.id && (
            <div>
              {loadingSongs ? (
                <p>Loading songs...</p>
              ) : (
                <ul>
                  {songs.map((song) => (
                    <li key={song.track.id}>
                      {song.track.name}

                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Playlists;
