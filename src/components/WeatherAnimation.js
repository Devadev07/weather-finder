
import React from 'react';

const WeatherAnimation = ({ weatherType, isDay }) => {
  const renderAnimation = () => {
    switch (weatherType) {
      case 'sunny':
        return isDay ? <SunAnimation /> : <MoonStarsAnimation />;
      case 'cloudy':
        return <CloudyAnimation />;
      case 'rainy':
        return <RainAnimation />;
      case 'snowy':
        return <SnowAnimation />;
      case 'stormy':
        return <StormAnimation />;
      case 'foggy':
        return <FogAnimation />;
      default:
        return <DefaultAnimation />;
    }
  };

  return (
    <div className="weather-animation absolute inset-0 overflow-hidden pointer-events-none">
      {renderAnimation()}
    </div>
  );
};

// Sun animation component
const SunAnimation = () => (
  <div className="absolute top-[10%] right-[10%] w-[100px] h-[100px] rounded-full bg-[rgba(255,230,100,0.8)] shadow-[0_0_50px_rgba(255,255,190,0.8)] animate-float" />
);

// Moon and stars animation
const MoonStarsAnimation = () => (
  <>
    <div className="absolute top-[10%] right-[10%] w-[80px] h-[80px] rounded-full bg-[rgba(220,230,255,0.8)] shadow-[0_0_30px_rgba(200,220,255,0.3)] animate-float" />
    {Array.from({ length: 20 }).map((_, i) => (
      <div 
        key={i}
        className="absolute w-[3px] h-[3px] rounded-full bg-white animate-pulse-soft"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          animationDelay: `${Math.random() * 3}s`
        }}
      />
    ))}
  </>
);

// Cloudy animation
const CloudyAnimation = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <div 
        key={i}
        className="cloud absolute w-[150px] h-[60px] rounded-[50px] bg-[rgba(255,255,255,0.8)]"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 50}%`,
          animationDuration: `${20 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 10}s`,
          transform: `scale(${0.5 + Math.random() * 0.5})`
        }}
      />
    ))}
  </>
);

// Rain animation
const RainAnimation = () => (
  <>
    {Array.from({ length: 50 }).map((_, i) => (
      <div 
        key={i}
        className="raindrop absolute w-[2px] h-[15px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(200,220,255,0.5)] animate-rain"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${0.5 + Math.random() * 0.5}s`
        }}
      />
    ))}
  </>
);

// Snow animation
const SnowAnimation = () => (
  <>
    {Array.from({ length: 30 }).map((_, i) => (
      <div 
        key={i}
        className="snowflake absolute w-[8px] h-[8px] rounded-full bg-white animate-snow"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 5}s`,
          transform: `scale(${0.5 + Math.random() * 0.5})`
        }}
      />
    ))}
  </>
);

// Storm animation
const StormAnimation = () => (
  <>
    <div className="lightning absolute inset-0 bg-[rgba(255,255,255,0.1)] animate-lightning-flash" />
    {Array.from({ length: 70 }).map((_, i) => (
      <div 
        key={i}
        className="raindrop raindrop-stormy absolute w-[2px] h-[20px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(200,220,255,0.5)] animate-heavy-rain"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${0.3 + Math.random() * 0.4}s`,
          transform: 'rotate(15deg)'
        }}
      />
    ))}
  </>
);

// Fog animation
const FogAnimation = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <div 
        key={i}
        className="fog-patch absolute w-[200px] h-[100px] rounded-[100px] bg-[rgba(255,255,255,0.2)] filter-blur-[20px] animate-fog"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${i * 15}%`,
          animationDuration: `${15 + Math.random() * 20}s`,
          animationDelay: `${Math.random() * 10}s`,
          opacity: `${0.1 + Math.random() * 0.2}`
        }}
      />
    ))}
  </>
);

// Default animation (light clouds)
const DefaultAnimation = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <div 
        key={i}
        className="cloud absolute w-[150px] h-[60px] rounded-[50px] bg-[rgba(255,255,255,0.8)]"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 50}%`,
          animationDuration: `${20 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 10}s`,
          transform: `scale(${0.5 + Math.random() * 0.5})`,
          opacity: 0.7
        }}
      />
    ))}
  </>
);

export default WeatherAnimation;
