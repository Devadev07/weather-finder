
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  fetchHistoricalWeather, 
  processHourlyToDailyData,
  convertToWeatherHistoryRecord
} from '@/utils/openMeteoUtils';
import type { WeatherHistoryRecord } from '@/utils/weatherHistoryUtils';

interface UseHistoricalWeatherProps {
  latitude?: number;
  longitude?: number;
  location?: string;
}

export const useHistoricalWeather = ({ latitude, longitude, location }: UseHistoricalWeatherProps = {}) => {
  const [historicalData, setHistoricalData] = useState<WeatherHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async (lat: number, lon: number, loc: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchHistoricalWeather(lat, lon);
      const dailyData = processHourlyToDailyData(data);
      const historyRecords = convertToWeatherHistoryRecord(dailyData);
      
      // Add location to each record
      const recordsWithLocation = historyRecords.map(record => ({
        ...record,
        location: loc
      }));
      
      setHistoricalData(recordsWithLocation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch historical weather data';
      setError(errorMessage);
      toast.error('Error retrieving historical weather data', {
        description: errorMessage
      });
      console.error('Historical weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude && location) {
      fetchHistoricalData(latitude, longitude, location);
    }
  }, [latitude, longitude, location]);

  return {
    historicalData,
    isLoading,
    error,
    fetchHistoricalData
  };
};
