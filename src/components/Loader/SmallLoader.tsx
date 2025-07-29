import React from 'react'

const SmallLoader = () => {
  return (
     <svg width="40" height="16" viewBox="0 0 40 16" xmlns="http://www.w3.org/2000/svg">
  <g fill="currentColor">
    <circle cx="4" cy="8" r="4">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0s"/>
    </circle>
    <circle cx="16" cy="8" r="4">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.2s"/>
    </circle>
    <circle cx="28" cy="8" r="4">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" begin="0.4s"/>
    </circle>
  </g>
</svg>
  )
}

export default SmallLoader
