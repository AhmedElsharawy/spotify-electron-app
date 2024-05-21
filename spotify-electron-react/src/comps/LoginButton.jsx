const LoginButton = ({ authEndpoint, clientId, redirectUri, responseType }) => {
  const loginUrl = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}`;
  //   console.log("Login URL:", loginUrl);

  const handleLoginClick = (event) => {
    // console.log("Attempting to redirect to:", loginUrl);
    window.location.href = loginUrl; // Force redirect using JavaScript
    event.preventDefault(); // Prevent default just to catch issues
  };

  return (
    <a href={loginUrl} onClick={handleLoginClick}>
      Login to Spotify
    </a>
  );
};

export default LoginButton;
