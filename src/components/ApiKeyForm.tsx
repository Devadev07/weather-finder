
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WEATHER_API_KEY_STORAGE_KEY } from '@/lib/constants';
import { toast } from 'sonner';

interface ApiKeyFormProps {
  onApiKeySubmit: () => void;
}

const ApiKeyForm = ({ onApiKeySubmit }: ApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || apiKey.trim().length < 10) {
      toast.error('Please enter a valid API key');
      return;
    }

    // Save API key to localStorage
    localStorage.setItem(WEATHER_API_KEY_STORAGE_KEY, apiKey.trim());
    toast.success('API key saved successfully');
    onApiKeySubmit();
  };

  return (
    <div className="glass-card p-8 rounded-xl w-full max-w-md animate-fade-in">
      <h2 className="text-2xl font-semibold text-white mb-4">OpenWeatherMap API Key Required</h2>
      <p className="mb-6 text-white/80">
        To use Aether Weather, you need an OpenWeatherMap API key. 
        Get your free API key by signing up at{' '}
        <a 
          href="https://openweathermap.org/api" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-300 hover:text-blue-200 underline"
        >
          OpenWeatherMap
        </a>.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="bg-white/20 border-white/30 placeholder:text-white/50 text-white"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-white/30 hover:bg-white/50 text-white"
        >
          Save API Key
        </Button>
      </form>
      
      <p className="mt-4 text-sm text-white/60">
        Your API key is stored locally in your browser and never sent to our servers.
      </p>
    </div>
  );
};

export default ApiKeyForm;
