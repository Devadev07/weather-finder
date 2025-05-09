
import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { useWeatherHistory } from "@/hooks/useWeatherHistory";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import WeatherAnimation from "@/components/WeatherAnimation";
import WeatherCalendar from "@/components/WeatherCalendar";
import { isDayTime } from "@/utils/weatherUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  const { historyData } = useWeatherHistory({ weatherData });
  const [isDay, setIsDay] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  
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
          
          <div className="flex w-full justify-center">
            <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full bg-white/20">
                <TabsTrigger value="current" className="text-white data-[state=active]:bg-white/30">
                  Current Weather
                </TabsTrigger>
                <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/30">
                  Weather History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="mt-4 flex justify-center">
                {isLoading ? (
                  <div className="w-full max-w-md animate-fade-in flex justify-center">
                    <Skeleton className="h-[280px] w-full rounded-xl bg-white/20" />
                  </div>
                ) : weatherData ? (
                  <WeatherCard weatherData={weatherData} />
                ) : (
                  <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-xl text-center animate-fade-in">
                    <p className="text-xl text-white/80">
                      {isUsingGeolocation 
                        ? "Detecting your location..." 
                        : "Search for a location to see the weather."}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="mt-4 flex justify-center">
                {weatherData ? (
                  <WeatherCalendar 
                    historyData={historyData}
                    location={weatherData.location}
                  />
                ) : (
                  <div className="backdrop-blur-md bg-white/20 border border-white/30 p-8 rounded-xl text-center animate-fade-in">
                    <p className="text-xl text-white/80">
                      Search for a location to see weather history.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
