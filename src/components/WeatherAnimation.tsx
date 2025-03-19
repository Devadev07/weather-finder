
import { WEATHER_TYPES } from '@/lib/constants';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudFog, 
  CloudLightning, 
  Sun, 
  Moon 
} from 'lucide-react';

interface WeatherAnimationProps {
  weatherType: string;
  isDay: boolean;
}

const WeatherAnimation = ({ weatherType, isDay }: WeatherAnimationProps) => {
  const renderAnimation = () => {
    switch (weatherType) {
      case WEATHER_TYPES.SUNNY:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {isDay ? (
              <Sun className="absolute text-weather-sunny h-32 w-32 top-10 right-10 animate-pulse-soft" />
            ) : (
              <Moon className="absolute text-white h-24 w-24 top-12 right-12 animate-pulse-soft" />
            )}
            <div className="absolute opacity-30 bg-gradient-to-b from-yellow-200 to-transparent rounded-full h-64 w-64 top-0 right-0 blur-3xl animate-pulse-soft"></div>
          </div>
        );
        
      case WEATHER_TYPES.CLOUDY:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Cloud className="absolute text-white/80 h-20 w-20 top-16 right-20 animate-float" />
            <Cloud className="absolute text-white/70 h-16 w-16 top-32 right-60 animate-float" style={{ animationDelay: '1.5s' }} />
            <Cloud className="absolute text-white/60 h-12 w-12 top-24 right-40 animate-float" style={{ animationDelay: '1s' }} />
          </div>
        );
        
      case WEATHER_TYPES.RAINY:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <CloudRain className="absolute text-white/80 h-20 w-20 top-16 right-20 animate-float" />
            <CloudRain className="absolute text-white/70 h-16 w-16 top-32 right-60 animate-float" style={{ animationDelay: '1.5s' }} />
            
            {/* Rain drops */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-blue-100/70 w-0.5 h-6 rounded-full animate-rain"
                style={{ 
                  top: -24, 
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${0.5 + Math.random() * 1.5}s`
                }}
              />
            ))}
          </div>
        );
        
      case WEATHER_TYPES.SNOWY:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <CloudSnow className="absolute text-white/80 h-20 w-20 top-16 right-20 animate-float" />
            <CloudSnow className="absolute text-white/70 h-16 w-16 top-32 right-60 animate-float" style={{ animationDelay: '1.5s' }} />
            
            {/* Snowflakes */}
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white rounded-full animate-snow"
                style={{ 
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  top: -10, 
                  left: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${5 + Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        );
        
      case WEATHER_TYPES.STORMY:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <CloudLightning className="absolute text-white/80 h-20 w-20 top-16 right-20 animate-float" />
            <CloudLightning className="absolute text-white/70 h-16 w-16 top-32 right-60 animate-float" style={{ animationDelay: '1.5s' }} />
            
            {/* Lightning */}
            <div className="absolute w-full h-full bg-white/10 animate-lightning"></div>
            
            {/* Rain */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-blue-100/70 w-0.5 h-10 rounded-full animate-rain"
                style={{ 
                  top: -30, 
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${0.5 + Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        );
        
      case WEATHER_TYPES.FOGGY:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <CloudFog className="absolute text-white/80 h-20 w-20 top-16 right-20 animate-float" />
            <CloudFog className="absolute text-white/70 h-16 w-16 top-32 right-60 animate-float" style={{ animationDelay: '1.5s' }} />
            
            {/* Fog layers */}
            <div className="absolute h-20 w-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 top-40 animate-fog" style={{ animationDelay: '0s' }}></div>
            <div className="absolute h-16 w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 top-60 animate-fog" style={{ animationDelay: '5s' }}></div>
            <div className="absolute h-24 w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 top-80 animate-fog" style={{ animationDelay: '10s' }}></div>
          </div>
        );
        
      default:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Cloud className="absolute text-white/80 h-20 w-20 top-16 right-20 animate-float" />
            {isDay ? (
              <Sun className="absolute text-weather-sunny h-24 w-24 top-10 right-10 animate-pulse-soft" />
            ) : (
              <Moon className="absolute text-white h-20 w-20 top-12 right-12 animate-pulse-soft" />
            )}
          </div>
        );
    }
  };

  return renderAnimation();
};

export default WeatherAnimation;
