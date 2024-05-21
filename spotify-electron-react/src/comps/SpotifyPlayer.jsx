const SpotifyPlayer = ({ track }) => {
  return (
    console.log("track", track),
    (
      <div>
        {track.preview_url && (
          <audio controls src={track.preview_url}>
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    )
  );
};

export default SpotifyPlayer;
