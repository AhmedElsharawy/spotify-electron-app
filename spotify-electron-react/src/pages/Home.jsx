import React from "react";
import LoginButton from "../comps/LoginButton";
import LogoutButton from "../comps/LogoutButton";
import Playlists from "./Playlists";
import Footer from "../comps/Footer";

const Home = ({ token, logout, loading, playlists }) => {
  //   console.log("Rendering Home", { token, loading, playlists });
  return (
    <div className="App-header">
      {!token ? (
        <LoginButton
          authEndpoint="https://accounts.spotify.com/authorize"
          clientId={process.env.REACT_APP_SPOTIFY_CLIENT_ID}
          redirectUri="http://localhost:3000"
          responseType="token"
        />
      ) : (
        <>
          <LogoutButton onLogout={logout} />
          <Playlists playlists={playlists} loading={loading} />
          <Footer />
        </>
      )}
      {!token && <h2>Please login to Spotify</h2>}
    </div>
  );
};

export default Home;
