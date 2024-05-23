// Footer.js
import React from 'react';
import SpotifyPlayer from './SpotifyPlayer'; // Adjust the path as necessary

const Footer = ({ token }) => {
  return (
    <footer style={styles.footer}>
      <SpotifyPlayer token={token} />
    </footer>
  );
};

const styles = {
  footer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    backgroundColor: '#282c34',
    color: 'white',
    textAlign: 'center',
    padding: '10px 0',
  },
};

export default Footer;
