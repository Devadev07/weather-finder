
// You need to replace this with your actual API key from OpenWeatherMap
// Sign up at https://openweathermap.org/api and generate a key
export const WEATHER_API_KEY = "insert_your_api_key_here"; 

export const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

export const WEATHER_TYPES = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  SNOWY: "snowy",
  STORMY: "stormy",
  FOGGY: "foggy",
  DEFAULT: "default"
};

export const WEATHER_MAPPING: Record<string, string> = {
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

export const DEFAULT_LOCATION = "London";
