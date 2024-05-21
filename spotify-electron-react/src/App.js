import React, { useEffect, useState } from "react";
import { setAccessToken, getUserPlaylists } from "./spotify";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function App() {
  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let localToken = window.localStorage.getItem("token");

    if (!localToken && hash) {
      localToken = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", localToken);
      console.log("Token set from hash:", localToken);
    }

    setToken(localToken);
    setAccessToken(localToken);

    if (localToken) {
      getUserPlaylists()
        .then((response) => {
          setPlaylists(response.items);
        })
        .catch((error) => {
          console.error("Failed to fetch playlists:", error);
        });
    } else {
      console.log("No token found. User needs to log in.");
    }
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    console.log("User logged out.");
  };

  return (
    <div className="App">
      <header className="App-header">
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
          >
            Login to Spotify
          </a>
        ) : (
          <button onClick={logout}>Logout</button>
        )}

        {token ? (
          <div>
            <h1>Playlists</h1>
            <ul>
              {playlists.map((playlist) => (
                <li key={playlist.id}>{playlist.name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <h2>Please login to Spotify</h2>
        )}
      </header>
    </div>
  );
}

export default App;
