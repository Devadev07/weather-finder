
// API key will be stored in localStorage
const WEATHER_API_KEY_STORAGE_KEY = "weather_api_key";

// Default API key
const DEFAULT_WEATHER_API_KEY = "285e08af8ccf41709804ee8a21753dea";

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

const WEATHER_TYPES = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  SNOWY: "snowy",
  STORMY: "stormy",
  FOGGY: "foggy",
  DEFAULT: "default"
};

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

const DEFAULT_LOCATION = "London";
