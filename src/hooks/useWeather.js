
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  WEATHER_API_KEY_STORAGE_KEY, 
  WEATHER_API_URL, 
  DEFAULT_LOCATION,
  DEFAULT_WEATHER_API_KEY 
} from '../lib/constants.js';
import { formatWeatherData } from '../utils/weatherUtils.js';
import { toast } from 'sonner';

export const useWeather = ({ initialLocation = DEFAULT_LOCATION } = {}) => {
  const [location, setLocation] = useState(initialLocation);
  const [weatherData, setWeatherData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  useEffect(() => {
    checkForApiKey();
  }, []);

  // Check for API key updates
  const checkForApiKey = () => {
    setHasApiKey(true);
  };

  // Function to get the API key from localStorage or use the default
  const getApiKey = () => {
    return localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
  };

  // Function to fetch location suggestions
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    
    try {
      const apiKey = getApiKey();
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }
      
      const data = await response.json();
      
      // Format the suggestions
      const suggestions = data.map((item) => ({
        name: item.name,
        country: item.country,
        state: item.state,
        lat: item.lat,
        lon: item.lon
      }));
      
      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
    }
  };

  // Function to fetch weather by city name
  const fetchWeatherByCity = async (locationQuery) => {
    const apiKey = getApiKey();
    
    const response = await fetch(`${WEATHER_API_URL}/weather?q=${locationQuery}&appid=${apiKey}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data');
    }
    
    const data = await response.json();
    return formatWeatherData(data);
  };

  // Function to fetch weather by coordinates
  const fetchWeatherByCoordinates = async (coords) => {
    const apiKey = getApiKey();
    
    const response = await fetch(
      `${WEATHER_API_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`
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
    queryKey: ['weather', 'city', location, hasApiKey],
    queryFn: () => fetchWeatherByCity(location),
    enabled: !!location && !isUsingGeolocation,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Query for coordinate-based weather data
  const coordinatesQuery = useQuery({
    queryKey: ['weather', 'coordinates', coordinates?.lat, coordinates?.lon, hasApiKey],
    queryFn: () => fetchWeatherByCoordinates(coordinates),
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

  const searchLocation = (newLocation) => {
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
    location,
    hasApiKey,
    checkForApiKey,
    locationSuggestions,
    fetchLocationSuggestions
  };
};
