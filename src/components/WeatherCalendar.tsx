import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { WeatherHistoryRecord } from "@/utils/weatherHistoryUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherCalendarProps {
  historyData: WeatherHistoryRecord[];
  location: string;
  isLoading?: boolean;
  coordinates?: { lat: number; lon: number } | null;
}

interface DayContentProps {
  date: Date;
  historyData: WeatherHistoryRecord[];
  location: string;
}

// Component to render the content of each day cell
const DayContent = ({ date, historyData, location }: DayContentProps) => {
  // Format the date to match our stored format
  const dateString = format(date, "yyyy-MM-dd");
  
  // Find if we have weather data for this date and location
  const dayWeather = historyData.find(
    item => item.date === dateString && item.location === location
  );
  
  if (!dayWeather) {
    return <div className="text-black">{date.getDate()}</div>;
  }
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="text-black">{date.getDate()}</div>
      <img 
        src={`https://openweathermap.org/img/wn/${dayWeather.icon}.png`} 
        alt={dayWeather.condition}
        className="w-6 h-6" 
      />
    </div>
  );
};

const WeatherCalendar = ({ historyData, location, isLoading = false, coordinates }: WeatherCalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDayWeather, setSelectedDayWeather] = useState<WeatherHistoryRecord | null>(null);
  
  useEffect(() => {
    if (date) {
      const dateString = format(date, "yyyy-MM-dd");
      const dayWeather = historyData.find(
        item => item.date === dateString && item.location === location
      );
      
      setSelectedDayWeather(dayWeather || null);
    }
  }, [date, historyData, location]);
  
  return (
    <div className="w-full max-w-md backdrop-blur-md bg-white/20 border border-white/30 rounded-xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Weather History</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white/90">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              components={{
                DayContent: ({ date: dayDate, ...props }) => (
                  <DayContent 
                    date={dayDate} 
                    historyData={historyData} 
                    location={location} 
                    {...props} 
                  />
                )
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {isLoading ? (
        <div className="bg-white/30 rounded-lg p-4">
          <Skeleton className="h-24 w-full" />
        </div>
      ) : selectedDayWeather ? (
        <div className="bg-white/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-medium text-white">{format(new Date(selectedDayWeather.date), "MMMM d, yyyy")}</p>
            <img 
              src={`https://openweathermap.org/img/wn/${selectedDayWeather.icon}@2x.png`} 
              alt={selectedDayWeather.condition}
              className="w-12 h-12" 
            />
          </div>
          <p className="text-white capitalize">{selectedDayWeather.condition}</p>
          <p className="text-white text-2xl font-bold">{selectedDayWeather.temperature}°C</p>
        </div>
      ) : (
        <div className="bg-white/30 rounded-lg p-4 text-center">
          <p className="text-white">No weather data available for this date.</p>
        </div>
      )}
      
      {coordinates && (
        <div className="mt-4 text-xs text-white/70">
          <p>Data provided by Open-Meteo API</p>
          <p>Lat: {coordinates.lat.toFixed(4)}, Lon: {coordinates.lon.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherCalendar;
