import React from 'react';

const SmallLoader = () => {
  return (
   <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" stroke="#ffffff" stroke-width="2" fill="none" stroke-dasharray="12 12">
    <animateTransform attributeName="transform" type="rotate" from="0 10 10" to="360 10 10" dur="1s" repeatCount="indefinite"/>
  </circle>
</svg>
  );
};

export default SmallLoader;
