
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  WEATHER_API_URL, 
  WEATHER_API_KEY_STORAGE_KEY, 
  DEFAULT_WEATHER_API_KEY,
  DEFAULT_LOCATION
} from '@/lib/constants';
import { formatWeatherData } from '@/utils/weatherUtils';

export const useWeather = () => {
  const [apiKey, setApiKey] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false);

  // Get API key from localStorage or use default
  useEffect(() => {
    const storedApiKey = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setApiKey(DEFAULT_WEATHER_API_KEY);
    }
  }, []);

  // Fetch weather data
  const fetchWeatherData = async (loc) => {
    if (!loc) return null;
    
    try {
      const response = await fetch(
        `${WEATHER_API_URL}/weather?q=${loc}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch weather data');
      }
      
      const data = await response.json();
      return formatWeatherData(data);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      throw error;
    }
  };

  // React Query hook for weather data
  const { data: weatherData, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', location, apiKey],
    queryFn: () => fetchWeatherData(location || DEFAULT_LOCATION),
    enabled: !!apiKey && !!location,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Search for a location
  const searchLocation = (loc) => {
    setLocation(loc);
    setIsUsingGeolocation(false);
    refetch();
  };

  // Use geolocation
  const useCurrentLocation = () => {
    setIsUsingGeolocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const response = await fetch(
            `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }
          
          const data = await response.json();
          setLocation(data.name);
          refetch();
        } catch (error) {
          toast.error(`Error: ${error.message}`);
          setIsUsingGeolocation(false);
        }
      },
      (error) => {
        toast.error(`Geolocation error: ${error.message}`);
        setIsUsingGeolocation(false);
      }
    );
  };

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${WEATHER_API_URL}/find?q=${query}&appid=${apiKey}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      const suggestions = data.list.map(item => ({
        name: item.name,
        country: item.sys.country
      }));
      
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setLocationSuggestions([]);
    }
  };

  return {
    weatherData,
    isLoading,
    error,
    searchLocation,
    useCurrentLocation,
    isUsingGeolocation,
    location,
    locationSuggestions,
    fetchLocationSuggestions
  };
};
