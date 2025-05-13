
// Types for Open-Meteo API responses
export interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
    weathercode: number[];
  };
  hourly_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
    weathercode: string;
  };
}

export interface DailyWeatherData {
  date: string;
  avgTemperature: number;
  avgHumidity: number;
  avgWindSpeed: number;
  weathercode: number;
  weatherDescription: string;
  weatherIcon: string;
}

// Weather code mappings according to WMO standards
export const weatherCodeToDescription: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Slight thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

// Weather code to icon mapping
export const weatherCodeToIcon: Record<number, string> = {
  0: "01d", // Clear sky
  1: "01d", // Mainly clear
  2: "02d", // Partly cloudy
  3: "04d", // Overcast
  45: "50d", // Fog
  48: "50d", // Depositing rime fog
  51: "09d", // Light drizzle
  53: "09d", // Moderate drizzle
  55: "09d", // Dense drizzle
  56: "09d", // Light freezing drizzle
  57: "09d", // Dense freezing drizzle
  61: "10d", // Slight rain
  63: "10d", // Moderate rain
  65: "10d", // Heavy rain
  66: "10d", // Light freezing rain
  67: "10d", // Heavy freezing rain
  71: "13d", // Slight snow fall
  73: "13d", // Moderate snow fall
  75: "13d", // Heavy snow fall
  77: "13d", // Snow grains
  80: "09d", // Slight rain showers
  81: "09d", // Moderate rain showers
  82: "09d", // Violent rain showers
  85: "13d", // Slight snow showers
  86: "13d", // Heavy snow showers
  95: "11d", // Slight thunderstorm
  96: "11d", // Thunderstorm with slight hail
  99: "11d", // Thunderstorm with heavy hail
};

// Function to fetch historical weather data from Open-Meteo API
export const fetchHistoricalWeather = async (latitude: number, longitude: number, pastDays: number = 60): Promise<OpenMeteoHistoricalResponse> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&past_days=${pastDays}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch historical weather data: ${response.statusText}`);
  }
  
  return await response.json();
};

// Process hourly data into daily averages
export const processHourlyToDailyData = (data: OpenMeteoHistoricalResponse): DailyWeatherData[] => {
  const dailyData: Record<string, {
    temperatures: number[];
    humidities: number[];
    windSpeeds: number[];
    weathercodes: number[];
  }> = {};
  
  // Group hourly data by day
  for (let i = 0; i < data.hourly.time.length; i++) {
    const timestamp = data.hourly.time[i];
    const date = timestamp.split('T')[0]; // Extract date part from ISO string
    
    if (!dailyData[date]) {
      dailyData[date] = {
        temperatures: [],
        humidities: [],
        windSpeeds: [],
        weathercodes: [],
      };
    }
    
    dailyData[date].temperatures.push(data.hourly.temperature_2m[i]);
    dailyData[date].humidities.push(data.hourly.relative_humidity_2m[i]);
    dailyData[date].windSpeeds.push(data.hourly.wind_speed_10m[i]);
    dailyData[date].weathercodes.push(data.hourly.weathercode[i]);
  }
  
  // Calculate daily averages
  return Object.entries(dailyData).map(([date, values]) => {
    // Calculate average temperature
    const avgTemperature = values.temperatures.reduce((sum, temp) => sum + temp, 0) / values.temperatures.length;
    
    // Calculate average humidity
    const avgHumidity = values.humidities.reduce((sum, humidity) => sum + humidity, 0) / values.humidities.length;
    
    // Calculate average wind speed
    const avgWindSpeed = values.windSpeeds.reduce((sum, speed) => sum + speed, 0) / values.windSpeeds.length;
    
    // Get the most common weather code for the day
    const weatherCodeCounts: Record<number, number> = {};
    values.weathercodes.forEach(code => {
      weatherCodeCounts[code] = (weatherCodeCounts[code] || 0) + 1;
    });
    
    let mostCommonWeatherCode = values.weathercodes[0];
    let highestCount = 0;
    
    Object.entries(weatherCodeCounts).forEach(([code, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostCommonWeatherCode = parseInt(code);
      }
    });
    
    return {
      date,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgHumidity: Math.round(avgHumidity),
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      weathercode: mostCommonWeatherCode,
      weatherDescription: weatherCodeToDescription[mostCommonWeatherCode] || "Unknown",
      weatherIcon: weatherCodeToIcon[mostCommonWeatherCode] || "01d"
    };
  });
};

// Function to convert weather data format for compatibility with existing app
export const convertToWeatherHistoryRecord = (dailyData: DailyWeatherData[]): import('./weatherHistoryUtils').WeatherHistoryRecord[] => {
  return dailyData.map(day => ({
    date: day.date,
    condition: day.weatherDescription,
    temperature: Math.round(day.avgTemperature),
    icon: day.weatherIcon,
    location: "" // Will be filled in by the caller
  }));
};
