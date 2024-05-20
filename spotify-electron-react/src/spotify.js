import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

const setAccessToken = (token) => {
  spotifyApi.setAccessToken(token);
};

const getUserPlaylists = () => {
  return spotifyApi.getUserPlaylists();
};

export { setAccessToken, getUserPlaylists };

