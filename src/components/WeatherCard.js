
import { 
  Cloud, 
  Droplets, 
  Thermometer, 
  Wind, 
  Sunrise, 
  Sunset, 
  CalendarDays 
} from "lucide-react";
import { getFormattedTime, getFormattedDate } from "@/utils/weatherUtils";

const WeatherCard = ({ weatherData }) => {
  if (!weatherData) return null;
  
  return (
    <div className="weather-card animate-fade-in">
      <div className="weather-card-header">
        <div className="location-row">
          <div className="location-info">
            <h3>{weatherData.location}</h3>
            <p>{weatherData.country}</p>
          </div>
          <div className="temperature">
            {weatherData.temperature}°C
          </div>
        </div>
      </div>
      
      <div className="weather-card-body">
        <div className="weather-description">
          {weatherData.description}
        </div>
        
        <div className="separator"></div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-white/80">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm">
              {getFormattedDate(weatherData.dateTime, weatherData.timezone)}
            </span>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <Thermometer className="detail-icon h-4 w-4" />
            <div className="detail-label">Feels Like</div>
            <div className="detail-value">{weatherData.feelsLike}°</div>
          </div>
          
          <div className="detail-item">
            <Droplets className="detail-icon h-4 w-4" />
            <div className="detail-label">Humidity</div>
            <div className="detail-value">{weatherData.humidity}%</div>
          </div>
          
          <div className="detail-item">
            <Wind className="detail-icon h-4 w-4" />
            <div className="detail-label">Wind</div>
            <div className="detail-value">{weatherData.windSpeed} km/h</div>
          </div>
          
          <div className="detail-item">
            <Sunrise className="detail-icon h-4 w-4" />
            <div className="detail-label">Sunrise</div>
            <div className="detail-value">
              {getFormattedTime(weatherData.sunrise, weatherData.timezone)}
            </div>
          </div>
          
          <div className="detail-item">
            <Sunset className="detail-icon h-4 w-4" />
            <div className="detail-label">Sunset</div>
            <div className="detail-value">
              {getFormattedTime(weatherData.sunset, weatherData.timezone)}
            </div>
          </div>
          
          <div className="detail-item">
            <Cloud className="detail-icon h-4 w-4" />
            <div className="detail-label">Status</div>
            <div className="detail-value">{weatherData.weatherType}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
