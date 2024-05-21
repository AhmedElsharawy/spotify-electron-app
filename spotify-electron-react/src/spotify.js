import SpotifyWebApi from "spotify-web-api-js";
const spotifyApi = new SpotifyWebApi();

const setAccessToken = (token) => {
  spotifyApi.setAccessToken(token);
};

const getUserPlaylists = () => {
  return spotifyApi.getUserPlaylists();
};

// Function to fetch songs from a specific playlist
const getPlaylistSongs = (playlistId) => {
  return spotifyApi.getPlaylistTracks(playlistId);
};

export { setAccessToken, getUserPlaylists, getPlaylistSongs };
