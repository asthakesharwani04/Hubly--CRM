import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', fullScreen = false, text = '' }) => {
  const loader = (
    <div className={`loader-container ${fullScreen ? 'loader-fullscreen' : ''}`}>
      <div className={`loader loader-${size}`}>
        <div className="loader-spinner"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  return loader;
};

export default Loader;