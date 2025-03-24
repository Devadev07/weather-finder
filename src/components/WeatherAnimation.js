
import React from 'react';

const WeatherAnimation = ({ weatherType, isDay = true }) => {
  return (
    <div className={`weather-animation ${weatherType} ${isDay ? 'day' : 'night'}`}>
      {/* Weather animation elements will be rendered through CSS */}
      <div className="animation-layer"></div>
    </div>
  );
};

export default WeatherAnimation;
