require("dotenv").config();

const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const app = express();
const port = 3000;

// Spotify credentials
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/callback"; // Ensure this is registered in your Spotify app

// Step 2: Route to initiate the authorization process
app.get("/login", (req, res) => {
  const scopes =
    "user-modify-playback-state user-read-playback-state streaming";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authUrl);
});

// Step 3: Callback route to handle Spotify's response
app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    res.send("Authorization code not provided.");
    return;
  }

  try {
    const tokenData = await getAccessToken(code, redirectUri);
    console.log("Access token:", tokenData.access_token);
    res.send(`Access token received: ${tokenData.access_token}`);
  } catch (error) {
    console.error("Error getting access token:", error);
    res.send("Error getting access token");
  }
});

// Step 4: Define getAccessToken function
async function getAccessToken(code, redirectUri) {
  try {
    console.log("Requesting access token with the following parameters:");
    console.log("Code:", code);
    console.log("Redirect URI:", redirectUri);
    console.log("Client ID:", clientId); // Consider masking sensitive information in production logs
    console.log("Client Secret:", clientSecret); // Consider masking sensitive information in production logs

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    console.log("Access token response received:");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "Error requesting access token:",
      error.response ? error.response.data : error.message,
    );
    throw error;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
