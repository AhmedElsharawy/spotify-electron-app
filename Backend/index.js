require("dotenv").config();

const express = require("express");
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
const port = 3000;

// Replace these values with your Spotify app credentials
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/callback";

const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

// Step 1: Authorize user
app.get("/login", (req, res) => {
  const scopes = ["user-read-recently-played"];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

// Step 2: Handle the callback after authorization
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body["access_token"];
    const refreshToken = data.body["refresh_token"];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    res.redirect("/recently-played");
  } catch (err) {
    console.error("Error getting tokens:", err);
    res.send("Error getting tokens.");
  }
});

// Step 3: Get the user's recently played tracks
app.get("/recently-played", async (req, res) => {
  try {
    const data = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 30 });
    const tracks = data.body.items.map((item) => ({
      trackName: item.track.name,
      artistName: item.track.artists.map((artist) => artist.name).join(", "),
      playedAt: item.played_at,
    }));

    res.json(tracks);
  } catch (err) {
    console.error("Error getting recently played tracks:", err);
    res.send("Error getting recently played tracks.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
