// src/SpotifyPlayer.jsx
import React, { useEffect, useState } from 'react';

const SpotifyPlayer = ({ token }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadSpotifyScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('spotify-player-script')) {
          resolve();
        } else {
          const script = document.createElement('script');
          script.id = 'spotify-player-script';
          script.src = 'https://sdk.scdn.co/spotify-player.js';
          script.async = true;
          script.onload = () => {
            setIsScriptLoaded(true);
            resolve();
          };
          script.onerror = reject;
          document.body.appendChild(script);
        }
      });
    };

    const initializePlayer = () => {
      if (window.Spotify) {
        const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(token); },
        });
        console.log(`${token}`);

        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Failed to authenticate', message);
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Failed to validate Spotify account', message);
        });

        player.addListener('playback_error', ({ message }) => {
          console.error('Failed to perform playback', message);
        });

        player.addListener('player_state_changed', state => {
          if (state) {
            const currentTrack = state.track_window.current_track;
            setCurrentTrack(currentTrack);
            setIsPlaying(!state.paused);
          }
        });

        player.connect().then(success => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          }
        });

        setPlayer(player);
      }
    };

    const setupPlayer = async () => {
      try {
        if (!isScriptLoaded) {
          await loadSpotifyScript();
        }
        initializePlayer();
      } catch (error) {
        console.error('Failed to load Spotify SDK', error);
      }
    };

    setupPlayer();
  }, [token, isScriptLoaded]);

  const playTrack = (spotify_uri) => {
    player._options.getOAuthToken(access_token => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to play track');
          }
          console.log('Track is playing');
        })
        .catch(error => {
          console.error('Error playing track:', error);
        });
    });
  };

  const togglePlay = () => {
    if (player) {
      player.togglePlay().catch(error => {
        console.error('Error toggling play/pause:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const nextTrack = () => {
    if (player) {
      player.nextTrack().catch(error => {
        console.error('Error skipping to next track:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const previousTrack = () => {
    if (player) {
      player.previousTrack().catch(error => {
        console.error('Error skipping to previous track:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  return (
    <div>
      <div>
        {currentTrack ? (
          <div>
            <img src={currentTrack.album.images[0].url} alt={currentTrack.name} width={50} />
            <div>{currentTrack.name} - {currentTrack.artists[0].name}</div>
          </div>
        ) : (
          <div>No track currently playing</div>
        )}
      </div>
      <button onClick={() => playTrack('spotify:track:6rqhFgbbKwnb9MLmUQDhG6')}>
        Play Specific Track
      </button>
      <button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={previousTrack}>
        Previous
      </button>
      <button onClick={nextTrack}>
        Next
      </button>
    </div>
  );
};

export default SpotifyPlayer;
