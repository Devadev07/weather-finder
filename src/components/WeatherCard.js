
import React from 'react';
import { getFormattedDate, isDayTime } from "../utils/weatherUtils.js";
import { Droplets, Wind, ThermometerSun } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const WeatherCard = ({ weatherData }) => {
  const {
    location,
    country,
    temperature,
    feelsLike,
    humidity,
    windSpeed,
    description,
    dateTime,
    timezone,
    sunrise,
    sunset
  } = weatherData;

  const formattedDate = getFormattedDate(dateTime, timezone);
  const isDay = isDayTime(dateTime, sunrise, sunset);

  return (
    <div className="w-full max-w-md backdrop-blur-md bg-white/20 border border-white/30 rounded-xl shadow-lg animate-fade-in">
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{location}, {country}</h3>
            <p className="text-lg font-medium mt-1 text-white/80">
              {formattedDate}
            </p>
          </div>
          <div className="text-5xl font-bold text-white">{temperature}°</div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <div className="text-xl font-medium capitalize text-white">{description}</div>
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col items-center">
              <ThermometerSun className="h-6 w-6 mb-1 text-white/80" />
              <div className="text-sm font-medium text-white/80">Feels Like</div>
              <div className="text-xl font-semibold text-white">{feelsLike}°</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Droplets className="h-6 w-6 mb-1 text-white/80" />
              <div className="text-sm font-medium text-white/80">Humidity</div>
              <div className="text-xl font-semibold text-white">{humidity}%</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Wind className="h-6 w-6 mb-1 text-white/80" />
              <div className="text-sm font-medium text-white/80">Wind</div>
              <div className="text-xl font-semibold text-white">{windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
