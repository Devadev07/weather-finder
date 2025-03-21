
// Utility functions for weather data

// Convert Kelvin to Celsius
function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

// Convert Kelvin to Fahrenheit
function kelvinToFahrenheit(kelvin) {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
}

// Convert meters per second to kilometers per hour
function metersPerSecToKmPerHour(mps) {
  return Math.round(mps * 3.6);
}

// Convert meters per second to miles per hour
function metersPerSecToMilesPerHour(mps) {
  return Math.round(mps * 2.237);
}

// Get weather type based on icon code
function getWeatherType(iconCode) {
  return WEATHER_MAPPING[iconCode] || WEATHER_TYPES.DEFAULT;
}

// Format weather data
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
    weatherType: weatherType,
    weatherIcon: data.weather[0].icon,
    timezone: data.timezone,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    dateTime: data.dt
  };
}

// Get formatted time
function getFormattedTime(timestamp, timezone) {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  return locationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Get formatted date
function getFormattedDate(timestamp, timezone) {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  return locationTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// Check if it's daytime
function isDayTime(current, sunrise, sunset) {
  return current > sunrise && current < sunset;
}

// Toast function for showing notifications
function showToast(message, isError = false) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  toast.textContent = message;
  
  // Add toast to the DOM
  document.body.appendChild(toast);
  
  // Show the toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Remove the toast after a delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}
