
import { formatWeatherData, WeatherData } from "./weatherUtils";

// Interface for storing daily weather records
export interface WeatherHistoryRecord {
  date: string;
  condition: string;
  temperature: number;
  icon: string;
  location: string;
}

// Storage key for weather history in localStorage
const WEATHER_HISTORY_STORAGE_KEY = "weather_history_data";

// Function to save weather data to history
export const saveWeatherHistory = (weatherData: WeatherData): void => {
  try {
    // Get existing history from localStorage
    const existingHistory = getWeatherHistory();
    
    // Format today's date as YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Check if we already have an entry for today for this location
    const existingEntryIndex = existingHistory.findIndex(
      entry => entry.date === dateString && entry.location === weatherData.location
    );
    
    // Create the new record
    const newRecord: WeatherHistoryRecord = {
      date: dateString,
      condition: weatherData.description,
      temperature: weatherData.temperature,
      icon: weatherData.weatherIcon,
      location: weatherData.location
    };
    
    // Either update existing record or add a new one
    if (existingEntryIndex >= 0) {
      existingHistory[existingEntryIndex] = newRecord;
    } else {
      existingHistory.push(newRecord);
    }
    
    // Save back to localStorage
    localStorage.setItem(WEATHER_HISTORY_STORAGE_KEY, JSON.stringify(existingHistory));
    
  } catch (error) {
    console.error("Error saving weather history:", error);
  }
};

// Function to get all weather history
export const getWeatherHistory = (): WeatherHistoryRecord[] => {
  try {
    const historyData = localStorage.getItem(WEATHER_HISTORY_STORAGE_KEY);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error("Error retrieving weather history:", error);
    return [];
  }
};

// Function to get weather history for a specific location
export const getLocationWeatherHistory = (location: string): WeatherHistoryRecord[] => {
  const allHistory = getWeatherHistory();
  return allHistory.filter(record => record.location === location);
};

// Function to get weather for a specific date and location
export const getWeatherForDate = (date: string, location: string): WeatherHistoryRecord | null => {
  const allHistory = getWeatherHistory();
  return allHistory.find(record => record.date === date && record.location === location) || null;
};

// Function to check if we need to fetch weather data today
export const shouldFetchWeatherToday = (location: string): boolean => {
  // Get today's date as string
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we already have an entry for today
  const todaysEntry = getWeatherForDate(today, location);
  
  // Return true if we don't have today's entry yet
  return !todaysEntry;
};
