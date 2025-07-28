import React from 'react'

const Loader = () => {
  return (
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="none">
  <circle cx="25" cy="25" r="20" stroke="#6366f1" stroke-width="5" opacity="0.25"/>
  <path fill="#6366f1" d="M25 5a20 20 0 0 1 0 40v-5a15 15 0 0 0 0-30V5z">
    <animateTransform 
      attributeName="transform" 
      type="rotate"
      from="0 25 25"
      to="360 25 25"
      dur="1s"
      repeatCount="indefinite" />
  </path>
</svg>

  )
}

export default Loader
