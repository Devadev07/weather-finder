
// API keys and URLs for weather data
export const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
export const GEO_API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";
export const WEATHER_API_KEY_STORAGE_KEY = "weather_api_key";
export const DEFAULT_LOCATION = "London";
export const DEFAULT_WEATHER_API_KEY = "1635890035cbba097fd5c26c8ea672a1";

export const GEO_API_OPTIONS = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '4f0dcce84bmshac9e329bd55fd14p17ec6fjsnff18b2e256e2',
    'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
  }
};

// Weather types mappings
export const WEATHER_TYPES = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  SNOWY: "snowy",
  STORMY: "stormy",
  FOGGY: "foggy",
  DEFAULT: "default"
};

// Map OpenWeather icon codes to our weather types
export const WEATHER_MAPPING = {
  "01d": WEATHER_TYPES.SUNNY,
  "01n": WEATHER_TYPES.SUNNY,
  "02d": WEATHER_TYPES.CLOUDY,
  "02n": WEATHER_TYPES.CLOUDY,
  "03d": WEATHER_TYPES.CLOUDY,
  "03n": WEATHER_TYPES.CLOUDY,
  "04d": WEATHER_TYPES.CLOUDY,
  "04n": WEATHER_TYPES.CLOUDY,
  "09d": WEATHER_TYPES.RAINY,
  "09n": WEATHER_TYPES.RAINY,
  "10d": WEATHER_TYPES.RAINY,
  "10n": WEATHER_TYPES.RAINY,
  "11d": WEATHER_TYPES.STORMY,
  "11n": WEATHER_TYPES.STORMY,
  "13d": WEATHER_TYPES.SNOWY,
  "13n": WEATHER_TYPES.SNOWY,
  "50d": WEATHER_TYPES.FOGGY,
  "50n": WEATHER_TYPES.FOGGY
};
