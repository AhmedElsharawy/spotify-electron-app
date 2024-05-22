import React, { useEffect, useState } from 'react';

const SpotifyPlayer = ({ token }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setPaused] = useState(false);
  const [currentTrack, setTrack] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Spotify Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);
      });

      player.connect();
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  const handlePlay = () => {
    if (player) {
      player.resume().then(() => {
        console.log('Resumed!');
      });
    }
  };

  const handlePause = () => {
    if (player) {
      player.pause().then(() => {
        console.log('Paused!');
      });
    }
  };

  const handleNext = () => {
    if (player) {
      player.nextTrack().then(() => {
        console.log('Skipped to next track!');
      });
    }
  };

  const handlePrevious = () => {
    if (player) {
      player.previousTrack().then(() => {
        console.log('Skipped to previous track!');
      });
    }
  };

  return (
    <div>
      <h2>Spotify Player</h2>
      {currentTrack && (
        <div>
          <img src={currentTrack.album.images[0].url} alt={currentTrack.name} style={{ width: 200 }} />
          <h3>{currentTrack.name}</h3>
          <p>{currentTrack.artists[0].name}</p>
        </div>
      )}
      <div>
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={isPaused ? handlePlay : handlePause}>
          {isPaused ? 'Play' : 'Pause'}
        </button>
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default SpotifyPlayer;
