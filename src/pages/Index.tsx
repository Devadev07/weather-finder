
import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import WeatherAnimation from "@/components/WeatherAnimation";
import { isDayTime } from "@/utils/weatherUtils";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { 
    weatherData, 
    isLoading, 
    searchLocation, 
    useCurrentLocation,
    isUsingGeolocation,
    location,
    locationSuggestions,
    fetchLocationSuggestions
  } = useWeather();
  const [isDay, setIsDay] = useState(true);
  
  useEffect(() => {
    if (weatherData) {
      setIsDay(isDayTime(weatherData.dateTime, weatherData.sunrise, weatherData.sunset));
    }
  }, [weatherData]);

  return (
    <div className={`weather-container ${weatherData?.weatherType || 'default'}`}>
      {weatherData && (
        <WeatherAnimation weatherType={weatherData.weatherType} isDay={isDay} />
      )}
      
      <div className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold mb-12 text-white drop-shadow-md animate-fade-in">
          Weather
        </h1>
        
        <div className="w-full max-w-2xl flex flex-col items-center gap-8">
          <SearchBar 
            onSearch={searchLocation}
            onUseCurrentLocation={useCurrentLocation}
            isLoading={isLoading}
            defaultValue={location}
            isUsingGeolocation={isUsingGeolocation}
            suggestions={locationSuggestions}
            onInputChange={fetchLocationSuggestions}
          />
          
          {isLoading ? (
            <div className="w-full max-w-md animate-fade-in">
              <Skeleton className="h-[280px] w-full rounded-xl bg-white/20" />
            </div>
          ) : weatherData ? (
            <WeatherCard weatherData={weatherData} />
          ) : (
            <div className="glass-card p-8 rounded-xl text-center animate-fade-in">
              <p className="text-xl text-white/80">
                {isUsingGeolocation 
                  ? "Detecting your location..." 
                  : "Search for a location to see the weather."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
