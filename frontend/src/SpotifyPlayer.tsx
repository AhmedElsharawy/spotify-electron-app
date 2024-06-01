// src/SpotifyPlayer.tsx
import React, { useEffect, useState } from 'react';
import SpotifyScript from './SpotifyScript';

interface SpotifyPlayerProps {
  token: string;
  setToken: (token: string) => void;
}

interface SpotifyTrack {
  album: { images: { url: string }[] };
  name: string;
  artists: { name: string }[];
  duration_ms: number;
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
    const initializePlayer = () => {
      if (window.Spotify) {
        const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5
        });

        player.addListener('ready', ({ device_id }) => {
          setDeviceId(device_id);
          setIsReady(true);
          console.log('Player is ready');
        });

        player.addListener('not_ready', ({ device_id }) => {
          setIsReady(false);
          console.log('Player is not ready');
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

    if (isScriptLoaded) {
      initializePlayer();
    }
  }, [token, isScriptLoaded]);

  useEffect(() => {
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      setIsScriptLoaded(true);
    };
  }, []);

  const fetchNewToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/token');
      const data = await response.json();
      setToken(data.access_token);
    } catch (error) {
      console.error('Failed to fetch new token', error);
    }
  };

  const playPlaylist = (spotify_uri: string) => {
    if (player && isReady) {
      player._options.getOAuthToken(access_token => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ context_uri: spotify_uri }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to play playlist: ${response.statusText}`);
            }
          })
          .catch(error => {
            console.error('Error playing playlist:', error);
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
    if (player && isReady) {
      player.seek(seekPosition).catch(error => {
        console.error('Error seeking track:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volumeLevel = Number(event.target.value);
    setVolume(volumeLevel);
    if (player && isReady) {
      player.setVolume(volumeLevel).catch(error => {
        console.error('Error setting volume:', error);
      });
    } else {
      console.error('Player is not ready');
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">
      <SpotifyScript onScriptLoad={() => setIsScriptLoaded(true)} />
      <div className="flex items-center space-x-4">
        {currentTrack ? (
          <div className="flex items-center space-x-4">
            <img src={currentTrack.album.images[0].url} alt={currentTrack.name} className="w-16 h-16 rounded" />
            <div>
              <div className="text-lg font-bold">{currentTrack.name}</div>
              <div className="text-sm text-gray-400">{currentTrack.artists[0].name}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">No track currently playing</div>
        )}
      </div>
      <div className="mt-4">
        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded" onClick={() => playPlaylist('spotify:playlist:37i9dQZF1E4vhT0vGERtJH')}>
          Play Alias Radio Playlist
        </button>
      </div>
      <div className="mt-4 flex space-x-4">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={previousTrack}>
          Previous
        </button>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={nextTrack}>
          Next
        </button>
      </div>
      <div className="mt-4">
        <input
          type="range"
          min="0"
          max={currentTrack ? currentTrack.duration_ms : 100}
          value={progress}
          onChange={handleSeek}
          className="w-full"
        />
      </div>
      <div className="mt-4">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SpotifyPlayer;
