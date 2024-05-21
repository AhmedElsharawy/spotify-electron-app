import React from "react";

const Playlists = ({ playlists, loading }) => {
  // console.log("Rendering Playlists", { playlists, loading });
  return (
    <div>
      <h1>Playlists</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist.id}>{playlist.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Playlists;
