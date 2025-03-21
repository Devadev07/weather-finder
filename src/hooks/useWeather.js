
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  
  const API_KEY = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
  
  const fetchWeatherData = async (location) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${WEATHER_API_URL}/weather?q=${location}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error("Weather data not found");
      }
      
      const data = await response.json();
      const formattedData = formatWeatherData(data);
      setWeatherData(formattedData);
      
      // Save recent search
      saveRecentSearch(location);
      
      return formattedData;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch weather data",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const searchLocation = async (locationToSearch) => {
    if (!locationToSearch) return;
    
    setLocation(locationToSearch);
    await fetchWeatherData(locationToSearch);
  };
  
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(
        `${GEO_API_URL}/cities?namePrefix=${query}&limit=5`,
        GEO_API_OPTIONS
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch location suggestions");
      }
      
      const data = await response.json();
      setLocationSuggestions(data.data || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setLocationSuggestions([]);
    }
  };
  
  const useCurrentLocation = async () => {
    setIsUsingGeolocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsUsingGeolocation(false);
      return;
    }
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      
      setIsLoading(true);
      const response = await fetch(
        `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error("Weather data not found");
      }
      
      const data = await response.json();
      const formattedData = formatWeatherData(data);
      setWeatherData(formattedData);
      setLocation(data.name);
      
    } catch (error) {
      toast({
        title: "Error",
        description: 
          error.message === "User denied Geolocation"
            ? "Location access denied. Please enable location services."
            : "Failed to get current location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUsingGeolocation(false);
    }
  };
  
  const saveRecentSearch = (location) => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    
    // Add the new search if it's not already in the list
    if (!recentSearches.includes(location)) {
      // Add to the beginning of the array and limit to 5 items
      const updatedSearches = [location, ...recentSearches].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  };
  
  const getRecentSearches = () => {
    return JSON.parse(localStorage.getItem("recentSearches") || "[]");
  };
  
  return {
    weatherData,
    isLoading,
    searchLocation,
    useCurrentLocation,
    isUsingGeolocation,
    location,
    locationSuggestions,
    fetchLocationSuggestions,
    getRecentSearches
  };
};
