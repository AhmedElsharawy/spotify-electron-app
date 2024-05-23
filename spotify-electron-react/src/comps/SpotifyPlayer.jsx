import React, { useEffect, useState } from 'react';

const SpotifyPlayer = ({ token }) => {
  const [player, setPlayer] = useState(null);
  const [isPaused, setPaused] = useState(false);
  const [currentTrack, setTrack] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Spotify Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: volume,
      });

      setPlayer(player);

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

      player.addListener('player_state_changed', (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);
      });

      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        } else {
          console.error('The Web Playback SDK failed to connect to Spotify.');
        }
      });
    };

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token, volume]);

  const handlePlay = () => {
    if (player) {
      player.resume().then(() => {
        console.log('Resumed!');
      }).catch(e => console.error('Error resuming playback', e));
    }
  };

  const handlePause = () => {
    if (player) {
      player.pause().then(() => {
        console.log('Paused!');
      }).catch(e => console.error('Error pausing playback', e));
    }
  };

  const handleNext = () => {
    if (player) {
      player.nextTrack().then(() => {
        console.log('Skipped to next track!');
      }).catch(e => console.error('Error skipping to next track', e));
    }
  };

  const handlePrevious = () => {
    if (player) {
      player.previousTrack().then(() => {
        console.log('Skipped to previous track!');
      }).catch(e => console.error('Error skipping to previous track', e));
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume).then(() => {
        console.log('Volume updated!');
      }).catch(e => console.error('Error setting volume', e));
    }
  };

  const handleSeek = (e) => {
    const newPosition = parseInt(e.target.value);
    setPosition(newPosition);
    if (player) {
      player.seek(newPosition).then(() => {
        console.log('Seeked to new position!');
      }).catch(e => console.error('Error seeking', e));
    }
  };

  return (
    <div style={styles.playerContainer}>
      <h2>Spotify Player</h2>
      {currentTrack && (
        <div>
          <img src={currentTrack.album.images[0].url} alt={currentTrack.name} style={{ width: 50 }} />
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
      <div>
        <label>
          Volume:
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
        </label>
      </div>
      <div>
        <label>
          Seek:
          <input type="range" min="0" max={duration} value={position} onChange={handleSeek} />
        </label>
      </div>
    </div>
  );
};

const styles = {
  playerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default SpotifyPlayer;
