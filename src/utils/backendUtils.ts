
import { DailyWeatherData } from './openMeteoUtils';
import { WeatherData } from './weatherUtils';
import { toast } from 'sonner';

// Base URL for the PHP backend
const BACKEND_URL = 'http://localhost/weather-app/backend';

// Function to save weather data to PHP/MySQL backend
export const saveWeatherDataToBackend = async (
  dailyData: DailyWeatherData, 
  location: string,
  latitude: number, 
  longitude: number
): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/save_weather_data.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: dailyData.date,
        location,
        latitude,
        longitude,
        temperature: dailyData.avgTemperature,
        humidity: dailyData.avgHumidity,
        windSpeed: dailyData.avgWindSpeed,
        weatherCode: dailyData.weathercode,
        description: dailyData.weatherDescription,
        icon: dailyData.weatherIcon
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save data: ${errorText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving weather data to backend:', error);
    return false;
  }
};

// Function to save current weather to backend
export const saveCurrentWeatherToBackend = async (weatherData: WeatherData): Promise<boolean> => {
  if (!weatherData.latitude || !weatherData.longitude) {
    console.error('Latitude or longitude missing from weather data');
    return false;
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(`${BACKEND_URL}/save_weather_data.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: today,
        location: weatherData.location,
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        weatherCode: 0, // This would need mapping from OpenWeatherMap to WMO codes
        description: weatherData.description,
        icon: weatherData.weatherIcon
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save data: ${errorText}`);
    }

    const result = await response.json();
    if (result.success) {
      toast.success('Weather data saved to database');
    }
    return result.success;
  } catch (error) {
    console.error('Error saving current weather to backend:', error);
    toast.error('Failed to save weather data to database');
    return false;
  }
};

// Function to batch save multiple days of weather data
export const batchSaveHistoricalData = async (
  dailyData: DailyWeatherData[], 
  location: string,
  latitude: number, 
  longitude: number
): Promise<number> => {
  let successCount = 0;
  
  for (const day of dailyData) {
    const success = await saveWeatherDataToBackend(day, location, latitude, longitude);
    if (success) successCount++;
  }
  
  return successCount;
};
