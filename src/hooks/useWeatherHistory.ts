
import { useState, useEffect } from 'react';
import { WeatherData } from '@/utils/weatherUtils';
import { 
  WeatherHistoryRecord, 
  getWeatherHistory, 
  saveWeatherHistory, 
  getLocationWeatherHistory,
  shouldFetchWeatherToday
} from '@/utils/weatherHistoryUtils';

interface UseWeatherHistoryProps {
  weatherData: WeatherData | null;
}

export const useWeatherHistory = ({ weatherData }: UseWeatherHistoryProps) => {
  const [historyData, setHistoryData] = useState<WeatherHistoryRecord[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState<boolean>(false);
  
  // Load history data when the hook initializes
  useEffect(() => {
    const loadHistory = () => {
      const allHistory = getWeatherHistory();
      setHistoryData(allHistory);
      setIsHistoryLoaded(true);
    };
    
    loadHistory();
  }, []);
  
  // Save today's weather data if we have it and haven't saved it yet
  useEffect(() => {
    if (weatherData && isHistoryLoaded) {
      const shouldSave = shouldFetchWeatherToday(weatherData.location);
      
      if (shouldSave) {
        saveWeatherHistory(weatherData);
        // Update local state with the new data
        setHistoryData(getWeatherHistory());
      }
    }
  }, [weatherData, isHistoryLoaded]);
  
  // Get history for a specific location
  const getHistoryForLocation = (location: string): WeatherHistoryRecord[] => {
    return getLocationWeatherHistory(location);
  };
  
  // Reload history data (useful after any manual updates)
  const reloadHistory = (): void => {
    setHistoryData(getWeatherHistory());
  };
  
  return {
    historyData,
    getHistoryForLocation,
    reloadHistory,
    isHistoryLoaded
  };
};
