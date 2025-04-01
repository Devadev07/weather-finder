
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LocationSuggestion {
  name: string;
  country: string;
  state?: string;
}

interface SearchBarProps {
  onSearch: (location: string) => void;
  onUseCurrentLocation: () => void;
  onInputChange?: (query: string) => void;
  isLoading: boolean;
  defaultValue?: string;
  isUsingGeolocation?: boolean;
  suggestions?: LocationSuggestion[];
}

const SearchBar = ({ 
  onSearch, 
  onUseCurrentLocation, 
  onInputChange,
  isLoading, 
  defaultValue = '',
  isUsingGeolocation = false,
  suggestions = []
}: SearchBarProps) => {
  const [query, setQuery] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (onInputChange && value.trim().length > 2) {
      onInputChange(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationString = suggestion.state 
      ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
      : `${suggestion.name}, ${suggestion.country}`;
    
    setQuery(locationString);
    onSearch(locationString);
    setShowSuggestions(false);
  };

  const clearInput = () => {
    setQuery('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container w-full max-w-lg relative">
      <div className="search-bar flex w-full items-center space-x-2 glass-morphism p-1.5 rounded-full animate-fade-in">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search location..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyUp={handleKeyPress}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground/70 pr-10"
          />
          {query && (
            <button 
              onClick={clearInput}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground/70 hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading} 
          className="bg-white/30 hover:bg-white/50 text-foreground/90 rounded-full w-10 h-10 p-0"
        >
          <Search className="h-5 w-5" />
        </Button>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onUseCurrentLocation} 
              disabled={isLoading}
              variant={isUsingGeolocation ? "default" : "outline"} 
              className={`rounded-full w-10 h-10 p-0 ${isUsingGeolocation ? 'bg-white/50 hover:bg-white/70' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Use current location</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Location suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="suggestions absolute z-20 mt-2 w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          <ul className="divide-y divide-gray-100">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className="px-4 py-2 hover:bg-white/50 cursor-pointer transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.name}</div>
                <div className="text-sm text-gray-600">
                  {suggestion.state ? `${suggestion.state}, ` : ''}
                  {suggestion.country}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
