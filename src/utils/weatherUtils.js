
import { WEATHER_MAPPING, WEATHER_TYPES } from "../lib/constants.js";

// Convert Kelvin to Celsius
export function kelvinToCelsius(kelvin) {
  return Math.round(kelvin - 273.15);
}

// Convert Kelvin to Fahrenheit
export function kelvinToFahrenheit(kelvin) {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
}

// Convert meters per second to kilometers per hour
export function metersPerSecToKmPerHour(mps) {
  return Math.round(mps * 3.6);
}

// Get weather type based on icon code
export function getWeatherType(iconCode) {
  return WEATHER_MAPPING[iconCode] || WEATHER_TYPES.DEFAULT;
}

// Format weather data
export function formatWeatherData(data) {
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
export function getFormattedTime(timestamp, timezone) {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  return locationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Get formatted date
export function getFormattedDate(timestamp, timezone) {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  return locationTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// Check if it's daytime
export function isDayTime(current, sunrise, sunset) {
  return current > sunrise && current < sunset;
}
