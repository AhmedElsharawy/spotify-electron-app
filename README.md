# Spotify alternative player + extra features.
## .env file is required for almost everything we're using here. 

- Git clone into your directory
```
git clone https://github.com/AhmedElsharawy/spotify-electron-app
```
- Get your ClientID and ClientSecret from [here](https://developer.spotify.com). (If you don't have a **premium** spotify account lmk)
- Create a new .env file inside **BOTH** your frontend and backend folders.
- Place the following inside the .env file:
```
SPOTIFY_CLIENT_ID: *your ClientID here*
SPOTIFY_CLIENT_SECRET: *your ClientSecret here*
```

### Make sure you have Nodejs installed and **RUN** this command inside both your frontend and backend folders. `npm i`

- Run the backend using `node index.js`
- Run the frontend using `npm start`
