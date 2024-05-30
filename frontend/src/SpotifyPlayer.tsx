// src/SpotifyPlayer.tsx
import React, { useEffect, useState } from 'react';

interface SpotifyPlayerProps {
  token: string;
  setToken: (token: string) => void;
}

interface SpotifyTrack {
  album: { images: { url: string }[] };
  name: string;
  artists: { name: string }[];
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ token, setToken }) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);

  useEffect(() => {
    const loadSpotifyScript = () => {
      return new Promise<void>((resolve, reject) => {
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

        player.addListener('ready', ({ device_id }) => {
          setDeviceId(device_id);
          setIsReady(true);
        });

        player.addListener('not_ready', ({ device_id }) => {
          setIsReady(false);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Failed to initialize', message);
        });

        player.addListener('authentication_error', async ({ message }) => {
          console.error('Failed to authenticate', message);
          await fetchNewToken();
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
            setProgress(state.position);
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

  const fetchNewToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/token');
      const data = await response.json();
      setToken(data.access_token);
    } catch (error) {
      console.error('Failed to fetch new token', error);
    }
  };

  const playTrack = (spotify_uri: string) => {
    if (player && isReady) {
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
          })
          .catch(error => {
            console.error('Error playing track:', error);
          });
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const togglePlay = () => {
    if (player && isReady) {
      player.togglePlay().catch(error => {
        console.error('Error toggling play/pause:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const nextTrack = () => {
    if (player && isReady) {
      player.nextTrack().catch(error => {
        console.error('Error skipping to next track:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const previousTrack = () => {
    if (player && isReady) {
      player.previousTrack().catch(error => {
        console.error('Error skipping to previous track:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const seekPosition = Number(event.target.value);
    setProgress(seekPosition);
    player!.seek(seekPosition).catch(error => {
      console.error('Error seeking track:', error);
    });
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volumeLevel = Number(event.target.value);
    setVolume(volumeLevel);
    player!.setVolume(volumeLevel).catch(error => {
      console.error('Error setting volume:', error);
    });
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
      <div>
        <input
          type="range"
          min="0"
          max={currentTrack ? currentTrack.duration_ms : 100}
          value={progress}
          onChange={handleSeek}
        />
      </div>
      <div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default SpotifyPlayer;
