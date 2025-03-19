
import { useState, KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (location: string) => void;
  isLoading: boolean;
  defaultValue?: string;
}

const SearchBar = ({ onSearch, isLoading, defaultValue = '' }: SearchBarProps) => {
  const [query, setQuery] = useState(defaultValue);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar flex w-full max-w-lg items-center space-x-2 glass-morphism p-1.5 rounded-full animate-fade-in">
      <Input
        type="search"
        placeholder="Search location..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyUp={handleKeyPress}
        className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground/70"
      />
      <Button 
        onClick={handleSearch} 
        disabled={isLoading} 
        className="bg-white/30 hover:bg-white/50 text-foreground/90 rounded-full w-10 h-10 p-0"
      >
        <Search className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SearchBar;
