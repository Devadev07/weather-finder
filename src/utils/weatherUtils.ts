
import { WEATHER_MAPPING, WEATHER_TYPES } from "@/lib/constants";

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  weatherType: string;
  weatherIcon: string;
  timezone: number;
  sunrise: number;
  sunset: number;
  dateTime: number;
  latitude?: number;
  longitude?: number;
}

export const kelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

export const kelvinToFahrenheit = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
};

export const metersPerSecToKmPerHour = (mps: number): number => {
  return Math.round(mps * 3.6);
};

export const metersPerSecToMilesPerHour = (mps: number): number => {
  return Math.round(mps * 2.237);
};

export const getWeatherType = (iconCode: string): string => {
  return WEATHER_MAPPING[iconCode] || WEATHER_TYPES.DEFAULT;
};

export const formatWeatherData = (data: any): WeatherData => {
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
    dateTime: data.dt,
    latitude: data.coord?.lat,
    longitude: data.coord?.lon
  };
};

export const getFormattedTime = (timestamp: number, timezone: number): string => {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  return locationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getFormattedDate = (timestamp: number, timezone: number): string => {
  // Create a date using UTC time
  const date = new Date(timestamp * 1000);
  
  // Calculate the UTC time in milliseconds
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  
  // Add the location's timezone offset (in seconds converted to milliseconds)
  const locationTime = new Date(utcTime + (timezone * 1000));
  
  return locationTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

export const isDayTime = (current: number, sunrise: number, sunset: number): boolean => {
  return current > sunrise && current < sunset;
};
