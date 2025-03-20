
/**
 * Weather utilities
 */

// Weather types constants
const WEATHER_TYPES = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  SNOWY: "snowy",
  STORMY: "stormy",
  FOGGY: "foggy",
  DEFAULT: "default"
};

// Weather icon code to weather type mapping
const WEATHER_MAPPING = {
  // Clear
  "01d": WEATHER_TYPES.SUNNY,
  "01n": WEATHER_TYPES.SUNNY,
  
  // Few clouds, scattered clouds
  "02d": WEATHER_TYPES.CLOUDY,
  "02n": WEATHER_TYPES.CLOUDY,
  "03d": WEATHER_TYPES.CLOUDY,
  "03n": WEATHER_TYPES.CLOUDY,
  
  // Broken clouds, overcast
  "04d": WEATHER_TYPES.CLOUDY,
  "04n": WEATHER_TYPES.CLOUDY,
  
  // Shower rain, rain
  "09d": WEATHER_TYPES.RAINY,
  "09n": WEATHER_TYPES.RAINY,
  "10d": WEATHER_TYPES.RAINY,
  "10n": WEATHER_TYPES.RAINY,
  
  // Thunderstorm
  "11d": WEATHER_TYPES.STORMY,
  "11n": WEATHER_TYPES.STORMY,
  
  // Snow
  "13d": WEATHER_TYPES.SNOWY,
  "13n": WEATHER_TYPES.SNOWY,
  
  // Mist, fog, etc.
  "50d": WEATHER_TYPES.FOGGY,
  "50n": WEATHER_TYPES.FOGGY,
};

// Default location if none is provided
const DEFAULT_LOCATION = "London";

// API settings
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
const WEATHER_API_KEY_STORAGE_KEY = "weather_api_key";
const DEFAULT_WEATHER_API_KEY = "285e08af8ccf41709804ee8a21753dea";

/**
 * Converts temperature from Kelvin to Celsius
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {number} - Temperature in Celsius (rounded)
 */
function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

/**
 * Converts wind speed from meters per second to kilometers per hour
 * @param {number} mps - Wind speed in meters per second
 * @returns {number} - Wind speed in kilometers per hour (rounded)
 */
function metersPerSecToKmPerHour(mps) {
  return Math.round(mps * 3.6);
}

/**
 * Gets the weather type based on the OpenWeatherMap icon code
 * @param {string} iconCode - OpenWeatherMap icon code
 * @returns {string} - Weather type
 */
function getWeatherType(iconCode) {
  return WEATHER_MAPPING[iconCode] || WEATHER_TYPES.DEFAULT;
}

/**
 * Formats the raw weather data from the API into a simpler object
 * @param {Object} data - Raw weather data from OpenWeatherMap API
 * @returns {Object} - Formatted weather data
 */
function formatWeatherData(data) {
  const weatherType = getWeatherType(data.weather[0].icon);
  
  return {
    location: data.name,
    country: data.sys.country,
    temperature: kelvinToCelsius(data.main.temp),
    feelsLike: kelvinToCelsius(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: metersPerSecToKmPerHour(data.wind.speed),
    description: data.weather[0].description,
    weatherType,
    weatherIcon: data.weather[0].icon,
    timezone: data.timezone,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    dateTime: data.dt
  };
}

/**
 * Gets a formatted date string based on timestamp and timezone
 * @param {number} timestamp - Unix timestamp
 * @param {number} timezone - Timezone offset in seconds
 * @returns {string} - Formatted date string (e.g., "Monday, January 1")
 */
function getFormattedDate(timestamp, timezone) {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  // Format options for date
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return locationTime.toLocaleDateString(undefined, options);
}

/**
 * Checks if it's daytime based on current time, sunrise, and sunset
 * @param {number} current - Current Unix timestamp
 * @param {number} sunrise - Sunrise Unix timestamp
 * @param {number} sunset - Sunset Unix timestamp
 * @returns {boolean} - True if it's daytime, false otherwise
 */
function isDayTime(current, sunrise, sunset) {
  return current > sunrise && current < sunset;
}

/**
 * Creates weather animation elements based on weather type
 * @param {string} weatherType - Type of weather
 * @param {boolean} isDay - Whether it's daytime
 * @returns {HTMLElement} - Animation container element
 */
function createWeatherAnimation(weatherType, isDay) {
  const container = document.createElement('div');
  container.classList.add('weather-animation');
  
  switch (weatherType) {
    case WEATHER_TYPES.SUNNY:
      if (isDay) {
        // Create sun animation
        const sun = document.createElement('div');
        sun.classList.add('sun');
        sun.style.cssText = `
          position: absolute;
          top: 10%;
          left: 10%;
          width: 120px;
          height: 120px;
          background: #FFD86E;
          border-radius: 50%;
          box-shadow: 0 0 50px #FFD86E, 0 0 100px #FFD86E;
          animation: float 5s ease-in-out infinite, pulse-soft 5s ease-in-out infinite;
        `;
        container.appendChild(sun);
      } else {
        // Create moon animation
        const moon = document.createElement('div');
        moon.classList.add('moon');
        moon.style.cssText = `
          position: absolute;
          top: 10%;
          left: 10%;
          width: 100px;
          height: 100px;
          background: #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 0 20px #FFFFFF, 0 0 40px rgba(255, 255, 255, 0.3);
          animation: float 6s ease-in-out infinite;
        `;
        container.appendChild(moon);
      }
      break;
      
    case WEATHER_TYPES.CLOUDY:
      // Create multiple cloud elements
      for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');
        const size = 60 + Math.random() * 60;
        const top = 5 + Math.random() * 30;
        const left = 10 + Math.random() * 80;
        cloud.style.cssText = `
          position: absolute;
          top: ${top}%;
          left: ${left}%;
          width: ${size}px;
          height: ${size * 0.6}px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50px;
          animation: float ${4 + Math.random() * 3}s ease-in-out infinite;
          animation-delay: ${Math.random() * 2}s;
        `;
        
        // Add cloud details
        const beforePseudo = document.createElement('div');
        beforePseudo.style.cssText = `
          content: '';
          position: absolute;
          top: -50%;
          left: 25%;
          width: 60%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
        `;
        cloud.appendChild(beforePseudo);
        
        const afterPseudo = document.createElement('div');
        afterPseudo.style.cssText = `
          content: '';
          position: absolute;
          top: -30%;
          right: 25%;
          width: 40%;
          height: 80%;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
        `;
        cloud.appendChild(afterPseudo);
        
        container.appendChild(cloud);
      }
      break;
      
    case WEATHER_TYPES.RAINY:
      // Create cloud
      const rainCloud = document.createElement('div');
      rainCloud.style.cssText = `
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 140px;
        height: 80px;
        background: rgba(200, 214, 235, 0.8);
        border-radius: 50px;
        animation: float 4s ease-in-out infinite;
      `;
      const cloudBefore = document.createElement('div');
      cloudBefore.style.cssText = `
        content: '';
        position: absolute;
        top: -50%;
        left: 25%;
        width: 60%;
        height: 100%;
        background: rgba(200, 214, 235, 0.8);
        border-radius: 50%;
      `;
      rainCloud.appendChild(cloudBefore);
      
      const cloudAfter = document.createElement('div');
      cloudAfter.style.cssText = `
        content: '';
        position: absolute;
        top: -30%;
        right: 25%;
        width: 40%;
        height: 80%;
        background: rgba(200, 214, 235, 0.8);
        border-radius: 50%;
      `;
      rainCloud.appendChild(cloudAfter);
      container.appendChild(rainCloud);
      
      // Create raindrops
      for (let i = 0; i < 20; i++) {
        const raindrop = document.createElement('div');
        raindrop.classList.add('raindrop');
        const left = 20 + Math.random() * 60;
        const delay = Math.random() * 2;
        const duration = 0.8 + Math.random() * 0.7;
        
        raindrop.style.cssText = `
          position: absolute;
          top: 25%;
          left: ${left}%;
          width: 2px;
          height: 20px;
          background: rgba(220, 240, 255, 0.6);
          border-radius: 0 0 5px 5px;
          animation: rain ${duration}s linear infinite;
          animation-delay: ${delay}s;
        `;
        container.appendChild(raindrop);
      }
      break;
      
    case WEATHER_TYPES.SNOWY:
      // Create cloud
      const snowCloud = document.createElement('div');
      snowCloud.style.cssText = `
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 140px;
        height: 80px;
        background: rgba(220, 230, 245, 0.8);
        border-radius: 50px;
        animation: float 4s ease-in-out infinite;
      `;
      const snowCloudBefore = document.createElement('div');
      snowCloudBefore.style.cssText = `
        content: '';
        position: absolute;
        top: -50%;
        left: 25%;
        width: 60%;
        height: 100%;
        background: rgba(220, 230, 245, 0.8);
        border-radius: 50%;
      `;
      snowCloud.appendChild(snowCloudBefore);
      
      const snowCloudAfter = document.createElement('div');
      snowCloudAfter.style.cssText = `
        content: '';
        position: absolute;
        top: -30%;
        right: 25%;
        width: 40%;
        height: 80%;
        background: rgba(220, 230, 245, 0.8);
        border-radius: 50%;
      `;
      snowCloud.appendChild(snowCloudAfter);
      container.appendChild(snowCloud);
      
      // Create snowflakes
      for (let i = 0; i < 20; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = 5 + Math.random() * 5;
        const left = 20 + Math.random() * 60;
        const delay = Math.random() * 5;
        const duration = 7 + Math.random() * 5;
        
        snowflake.style.cssText = `
          position: absolute;
          top: 25%;
          left: ${left}%;
          width: ${size}px;
          height: ${size}px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
          animation: snow ${duration}s linear infinite;
          animation-delay: ${delay}s;
        `;
        container.appendChild(snowflake);
      }
      break;
      
    case WEATHER_TYPES.STORMY:
      // Create dark cloud
      const stormCloud = document.createElement('div');
      stormCloud.style.cssText = `
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 160px;
        height: 90px;
        background: rgba(80, 83, 97, 0.8);
        border-radius: 50px;
        animation: float 3s ease-in-out infinite;
      `;
      const stormCloudBefore = document.createElement('div');
      stormCloudBefore.style.cssText = `
        content: '';
        position: absolute;
        top: -50%;
        left: 25%;
        width: 60%;
        height: 100%;
        background: rgba(80, 83, 97, 0.8);
        border-radius: 50%;
      `;
      stormCloud.appendChild(stormCloudBefore);
      
      const stormCloudAfter = document.createElement('div');
      stormCloudAfter.style.cssText = `
        content: '';
        position: absolute;
        top: -30%;
        right: 25%;
        width: 40%;
        height: 80%;
        background: rgba(80, 83, 97, 0.8);
        border-radius: 50%;
      `;
      stormCloud.appendChild(stormCloudAfter);
      container.appendChild(stormCloud);
      
      // Create lightning
      const lightning = document.createElement('div');
      lightning.style.cssText = `
        position: absolute;
        top: 25%;
        left: 48%;
        width: 4px;
        height: 200px;
        background: rgba(255, 255, 220, 0.9);
        transform-origin: top;
        animation: lightning-strike 10s linear infinite;
      `;
      container.appendChild(lightning);
      
      // Create lightning flash
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 220, 0.1);
        animation: lightning-flash 10s linear infinite;
      `;
      container.appendChild(flash);
      
      // Create rain for storm
      for (let i = 0; i < 30; i++) {
        const heavyRain = document.createElement('div');
        heavyRain.classList.add('heavy-rain');
        const left = 20 + Math.random() * 60;
        const delay = Math.random() * 1.5;
        
        heavyRain.style.cssText = `
          position: absolute;
          top: 25%;
          left: ${left}%;
          width: 3px;
          height: 25px;
          background: rgba(200, 220, 240, 0.6);
          transform: rotate(15deg);
          animation: heavy-rain 0.8s linear infinite;
          animation-delay: ${delay}s;
        `;
        container.appendChild(heavyRain);
      }
      break;
      
    case WEATHER_TYPES.FOGGY:
      // Create fog elements
      for (let i = 0; i < 5; i++) {
        const fog = document.createElement('div');
        fog.classList.add('fog');
        const top = 10 + i * 15;
        const delay = i * 4;
        
        fog.style.cssText = `
          position: absolute;
          top: ${top}%;
          left: 0;
          width: 200%;
          height: 40px;
          background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
          animation: fog 20s linear infinite;
          animation-delay: ${delay}s;
        `;
        container.appendChild(fog);
      }
      break;
      
    default:
      // No specific animation for default
      break;
  }
  
  return container;
}
