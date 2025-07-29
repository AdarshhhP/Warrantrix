import React from 'react';

const Loader = () => {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="25"
        cy="25"
        r="20"
        stroke="#0000ff"
        strokeWidth="3"
        fill="none"
        strokeDasharray="37.7 37.7"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default Loader;
