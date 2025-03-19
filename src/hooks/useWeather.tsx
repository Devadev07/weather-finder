
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WEATHER_API_KEY, WEATHER_API_URL, DEFAULT_LOCATION } from '@/lib/constants';
import { formatWeatherData, WeatherData } from '@/utils/weatherUtils';
import { toast } from 'sonner';

interface UseWeatherProps {
  initialLocation?: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

export const useWeather = ({ initialLocation = DEFAULT_LOCATION }: UseWeatherProps = {}) => {
  const [location, setLocation] = useState<string>(initialLocation);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isUsingGeolocation, setIsUsingGeolocation] = useState<boolean>(false);

  // Function to fetch weather by city name
  const fetchWeatherByCity = async (locationQuery: string): Promise<WeatherData> => {
    const response = await fetch(`${WEATHER_API_URL}/weather?q=${locationQuery}&appid=${WEATHER_API_KEY}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    
    const data = await response.json();
    return formatWeatherData(data);
  };

  // Function to fetch weather by coordinates
  const fetchWeatherByCoordinates = async (coords: Coordinates): Promise<WeatherData> => {
    const response = await fetch(
      `${WEATHER_API_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    
    const data = await response.json();
    return formatWeatherData(data);
  };

  // Detect user's location
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsUsingGeolocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setCoordinates(coords);
        toast.success('Location detected successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to retrieve your location');
        setIsUsingGeolocation(false);
      }
    );
  };

  // Query for city-based weather data
  const cityQuery = useQuery({
    queryKey: ['weather', 'city', location],
    queryFn: () => fetchWeatherByCity(location),
    enabled: !!location && !isUsingGeolocation,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Query for coordinate-based weather data
  const coordinatesQuery = useQuery({
    queryKey: ['weather', 'coordinates', coordinates?.lat, coordinates?.lon],
    queryFn: () => fetchWeatherByCoordinates(coordinates!),
    enabled: !!coordinates && isUsingGeolocation,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Determine current query state based on which mode is active
  const activeQuery = isUsingGeolocation ? coordinatesQuery : cityQuery;
  const { data, isLoading, isError, error, refetch } = activeQuery;

  // Use effect to initialize geolocation on component mount
  useEffect(() => {
    detectUserLocation();
  }, []);

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
    
    setIsUsingGeolocation(false);
    setLocation(newLocation);
  };

  // Function to switch to using geolocation
  const useCurrentLocation = () => {
    detectUserLocation();
  };

  return {
    weatherData,
    isLoading,
    isError,
    error,
    searchLocation,
    useCurrentLocation,
    isUsingGeolocation,
    refetch,
    location
  };
};
