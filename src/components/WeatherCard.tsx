
import { WeatherData, getFormattedDate, getFormattedTime, isDayTime } from "@/utils/weatherUtils";
import { Droplets, Wind, ThermometerSun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WeatherCardProps {
  weatherData: WeatherData;
}

const WeatherCard = ({ weatherData }: WeatherCardProps) => {
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
  const formattedTime = getFormattedTime(dateTime, timezone);
  const sunriseTime = getFormattedTime(sunrise, timezone);
  const sunsetTime = getFormattedTime(sunset, timezone);
  const isDay = isDayTime(dateTime, sunrise, sunset);

  return (
    <Card className="w-full max-w-md glass-card animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">{location}, {country}</CardTitle>
            <CardDescription className="text-lg font-medium mt-1">
              {formattedDate}, {formattedTime}
            </CardDescription>
          </div>
          <div className="text-5xl font-bold">{temperature}°</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-medium capitalize">{description}</div>
            <div className="flex items-center text-sm gap-2">
              <span>Sunrise: {sunriseTime}</span>
              <span>•</span>
              <span>Sunset: {sunsetTime}</span>
            </div>
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col items-center">
              <ThermometerSun className="h-6 w-6 mb-1 text-foreground/80" />
              <div className="text-sm font-medium text-foreground/80">Feels Like</div>
              <div className="text-xl font-semibold">{feelsLike}°</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Droplets className="h-6 w-6 mb-1 text-foreground/80" />
              <div className="text-sm font-medium text-foreground/80">Humidity</div>
              <div className="text-xl font-semibold">{humidity}%</div>
            </div>
            
            <div className="flex flex-col items-center">
              <Wind className="h-6 w-6 mb-1 text-foreground/80" />
              <div className="text-sm font-medium text-foreground/80">Wind</div>
              <div className="text-xl font-semibold">{windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
