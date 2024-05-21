import React, { useEffect, useState } from "react";
import { setAccessToken, getUserPlaylists } from "./spotify";
import Home from "./pages/Home";

function App() {
  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // console.log("App useEffect running");
    const { hash } = window.location;
    let token = window.localStorage.getItem("token");
    // console.log("Initial token from localStorage:", token);

    if (!token && hash) {
      // console.log("Hash found in URL:", hash);
      const tokenFromHash = hash
        .substring(1)
        .split("&")
        .reduce((initial, item) => {
          if (item) {
            let parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
          }
          return initial;
        }, {}).access_token;

      // console.log("Parsed token from URL hash:", tokenFromHash);

      if (tokenFromHash) {
        window.localStorage.setItem("token", tokenFromHash);
        window.location.hash = "";
        token = tokenFromHash;
        // console.log("Token stored in localStorage and hash cleared:", token);
      }
    }

    if (token) {
      setToken(token);
      setAccessToken(token);
      fetchPlaylists(token);
    } else {
      // console.log("No token found. User needs to log in.");
    }
  }, []);

  const fetchPlaylists = (token) => {
    console.log("Fetching playlists");
    setLoading(true);
    getUserPlaylists()
      .then((response) => {
        setPlaylists(response.items);
        setLoading(false);
        // console.log("Playlists fetched successfully:", response.items);
      })
      .catch((error) => {
        // console.error("Failed to fetch playlists:", error);
        setLoading(false);
      });
  };

  const logout = () => {
    // console.log("Logging out");
    setToken("");
    window.localStorage.removeItem("token");
  };

  return (
    <Home
      token={token}
      logout={logout}
      playlists={playlists}
      loading={loading}
    />
  );
}

export default App;
