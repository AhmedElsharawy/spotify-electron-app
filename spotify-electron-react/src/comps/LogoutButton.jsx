import React from "react";

const LogoutButton = ({ onLogout }) => {
  //   console.log("Rendering LogoutButton");
  return <button onClick={onLogout}>Logout</button>;
};

export default LogoutButton;
