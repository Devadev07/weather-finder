
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin } from "lucide-react";

const SearchBar = ({ 
  onSearch, 
  onUseCurrentLocation, 
  isLoading = false,
  defaultValue = "",
  isUsingGeolocation = false,
  suggestions = [],
  onInputChange = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    setSearchTerm(defaultValue);
  }, [defaultValue]);
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onInputChange(value);
    
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion) => {
    const locationName = suggestion.city;
    setSearchTerm(locationName);
    onSearch(locationName);
    setShowSuggestions(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1" ref={inputRef}>
          <Input
            type="search"
            placeholder="Search location..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim().length > 0 && setShowSuggestions(true)}
            className="pl-3 pr-10 h-11 bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus-visible:ring-white/50"
          />
        </div>
        
        <Button 
          type="submit" 
          size="icon" 
          variant="secondary" 
          className="h-11 w-11 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30"
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-white" />
          )}
        </Button>
        
        <Button 
          type="button" 
          size="icon" 
          variant="secondary" 
          className="h-11 w-11 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30"
          onClick={onUseCurrentLocation}
          disabled={isLoading || isUsingGeolocation}
        >
          {isUsingGeolocation ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <MapPin className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>
      
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-md rounded-md shadow-lg overflow-hidden z-10 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id || suggestion.city} 
              className="px-4 py-2 hover:bg-black/5 cursor-pointer transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium">{suggestion.city}</div>
              <div className="text-sm text-gray-500">
                {suggestion.countryCode}, {suggestion.region || suggestion.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
