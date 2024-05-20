import React, { useEffect, useState } from 'react';
import { setAccessToken, getUserPlaylists } from './spotify';

const CLIENT_ID = 'your_spotify_client_id';
const REDIRECT_URI = 'http://localhost:3000/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

function App() {
  const [token, setToken] = useState('');
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      window.location.hash = '';
      window.localStorage.setItem('token', token);
    }

    setToken(token);
    setAccessToken(token);

    if (token) {
      getUserPlaylists().then((response) => {
        setPlaylists(response.items);
      });
    }
  }, []);

  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
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

