// src/SpotifyScript.tsx
import { FC, useEffect } from 'react';

const SpotifyScript: FC<{ onScriptLoad: () => void }> = ({ onScriptLoad }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'spotify-player';
    script.type = 'text/javascript';
    script.async = false;
    script.defer = true;
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.onload = () => {
      console.log('Spotify loaded');
      onScriptLoad();
    };
    script.onerror = console.error;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('spotify-player');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [onScriptLoad]);

  return null;
};

export default SpotifyScript;
