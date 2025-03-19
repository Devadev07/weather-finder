
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WEATHER_API_KEY, WEATHER_API_URL, DEFAULT_LOCATION } from '@/lib/constants';
import { formatWeatherData, WeatherData } from '@/utils/weatherUtils';
import { toast } from 'sonner';

interface UseWeatherProps {
  initialLocation?: string;
}

export const useWeather = ({ initialLocation = DEFAULT_LOCATION }: UseWeatherProps = {}) => {
  const [location, setLocation] = useState<string>(initialLocation);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const fetchWeatherData = async (locationQuery: string): Promise<WeatherData> => {
    const response = await fetch(`${WEATHER_API_URL}/weather?q=${locationQuery}&appid=${WEATHER_API_KEY}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    
    const data = await response.json();
    return formatWeatherData(data);
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['weather', location],
    queryFn: () => fetchWeatherData(location),
    enabled: !!location,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (data) {
      setWeatherData(data);
    }
  }, [data]);

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(`Error: ${error.message}`, {
        description: 'Please check the location and try again.',
      });
    }
  }, [isError, error]);

  const searchLocation = (newLocation: string) => {
    if (!newLocation.trim()) {
      toast.error('Please enter a location');
      return;
    }
    
    setLocation(newLocation);
  };

  return {
    weatherData,
    isLoading,
    isError,
    error,
    searchLocation,
    refetch,
    location
  };
};
