
/**
 * Weather App main script
 */

// API config
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
const GEOCODING_API_URL = "https://api.openweathermap.org/geo/1.0";
const WEATHER_API_KEY_STORAGE_KEY = "weather_api_key";
const DEFAULT_WEATHER_API_KEY = "285e08af8ccf41709804ee8a21753dea";

// DOM Elements
const weatherContainer = document.getElementById('weather-container');
const weatherAnimation = document.getElementById('weather-animation');
const searchInput = document.getElementById('search-input');
const clearButton = document.getElementById('clear-button');
const searchButton = document.getElementById('search-button');
const locationButton = document.getElementById('location-button');
const suggestionsContainer = document.getElementById('suggestions-container');
const suggestionsList = document.getElementById('suggestions-list');
const weatherDisplay = document.getElementById('weather-display');
const loadingIndicator = document.getElementById('loading-indicator');
const weatherCard = document.getElementById('weather-card');
const startMessage = document.getElementById('start-message');
const toastContainer = document.getElementById('toast-container');

// App state
let isLoading = false;
let currentLocation = '';
let isUsingGeolocation = false;
let locationSuggestions = [];
let weatherData = null;
let suggestionDebounceTimer = null;

/**
 * Initialize the application
 */
function initApp() {
  // Set up event listeners
  searchInput.addEventListener('input', handleSearchInputChange);
  searchInput.addEventListener('keyup', handleSearchKeyPress);
  clearButton.addEventListener('click', clearSearchInput);
  searchButton.addEventListener('click', handleSearch);
  locationButton.addEventListener('click', handleUseCurrentLocation);
  
  // Check if we have a saved location
  const savedLocation = localStorage.getItem('last_location');
  if (savedLocation) {
    searchInput.value = savedLocation;
    currentLocation = savedLocation;
    handleSearch();
  }
}

/**
 * Handle input changes in the search box
 */
function handleSearchInputChange(e) {
  const value = e.target.value;
  currentLocation = value;
  
  // Show/hide clear button
  if (value) {
    clearButton.style.display = 'block';
  } else {
    clearButton.style.display = 'none';
  }
  
  // Debounce location suggestions
  clearTimeout(suggestionDebounceTimer);
  if (value.trim().length > 2) {
    suggestionDebounceTimer = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  } else {
    suggestionsContainer.classList.add('hidden');
  }
}

/**
 * Handle key press in search input
 */
function handleSearchKeyPress(e) {
  if (e.key === 'Enter') {
    handleSearch();
  }
}

/**
 * Clear the search input
 */
function clearSearchInput() {
  searchInput.value = '';
  currentLocation = '';
  clearButton.style.display = 'none';
  suggestionsContainer.classList.add('hidden');
  searchInput.focus();
}

/**
 * Handle search button click
 */
function handleSearch() {
  const location = currentLocation.trim();
  if (!location) return;
  
  // Save the location
  localStorage.setItem('last_location', location);
  
  // Hide suggestions
  suggestionsContainer.classList.add('hidden');
  
  // Search for weather data
  searchLocation(location);
}

/**
 * Handle use current location button click
 */
function handleUseCurrentLocation() {
  if (navigator.geolocation) {
    setUsingGeolocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        showToast("Error getting your location. Please try again or search manually.", "error");
        setUsingGeolocation(false);
      }
    );
  } else {
    showToast("Geolocation is not supported by your browser.", "error");
  }
}

/**
 * Set whether we're using geolocation
 */
function setUsingGeolocation(value) {
  isUsingGeolocation = value;
  if (value) {
    locationButton.classList.add('active');
    showLoadingState();
    updateStartMessage("Detecting your location...");
  } else {
    locationButton.classList.remove('active');
    updateStartMessage("Search for a location to see the weather.");
  }
}

/**
 * Fetch location suggestions from the API
 */
async function fetchLocationSuggestions(query) {
  try {
    const apiKey = getApiKey();
    const response = await fetch(
      `${GEOCODING_API_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    locationSuggestions = data.map(item => ({
      name: item.name,
      state: item.state,
      country: item.country
    }));
    
    displaySuggestions();
  } catch (error) {
    console.error("Error fetching location suggestions:", error);
  }
}

/**
 * Display location suggestions
 */
function displaySuggestions() {
  // Clear previous suggestions
  suggestionsList.innerHTML = '';
  
  if (locationSuggestions.length === 0) {
    suggestionsContainer.classList.add('hidden');
    return;
  }
  
  // Add suggestions to the list
  locationSuggestions.forEach(suggestion => {
    const item = document.createElement('li');
    item.classList.add('suggestion-item');
    
    const locationHTML = `
      <div class="suggestion-name">${suggestion.name}</div>
      <div class="suggestion-details">
        ${suggestion.state ? `${suggestion.state}, ` : ''}
        ${suggestion.country}
      </div>
    `;
    
    item.innerHTML = locationHTML;
    item.addEventListener('click', () => handleSuggestionClick(suggestion));
    suggestionsList.appendChild(item);
  });
  
  // Show suggestions container
  suggestionsContainer.classList.remove('hidden');
}

/**
 * Handle suggestion click
 */
function handleSuggestionClick(suggestion) {
  const locationString = suggestion.state 
    ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
    : `${suggestion.name}, ${suggestion.country}`;
  
  searchInput.value = locationString;
  currentLocation = locationString;
  suggestionsContainer.classList.add('hidden');
  
  // Search for this location
  searchLocation(locationString);
}

/**
 * Search for weather data by location name
 */
function searchLocation(location) {
  if (!location) return;
  
  showLoadingState();
  
  const apiKey = getApiKey();
  fetch(`${WEATHER_API_URL}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your API key.");
        } else if (response.status === 404) {
          throw new Error("Location not found. Please try another search.");
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      }
      return response.json();
    })
    .then(data => {
      setUsingGeolocation(false);
      weatherData = formatWeatherData(data);
      updateUI();
    })
    .catch(error => {
      console.error("Error:", error);
      showToast(error.message, "error");
      hideLoadingState();
    });
}

/**
 * Fetch weather data by coordinates
 */
function fetchWeatherByCoordinates(lat, lon) {
  const apiKey = getApiKey();
  fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your API key.");
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      }
      return response.json();
    })
    .then(data => {
      setUsingGeolocation(false);
      weatherData = formatWeatherData(data);
      
      // Update search input with the location name
      const locationName = `${data.name}, ${data.sys.country}`;
      searchInput.value = locationName;
      currentLocation = locationName;
      
      updateUI();
    })
    .catch(error => {
      console.error("Error:", error);
      showToast(error.message, "error");
      setUsingGeolocation(false);
      hideLoadingState();
    });
}

/**
 * Update the UI with weather data
 */
function updateUI() {
  if (!weatherData) return;
  
  // Set weather background
  weatherContainer.className = `weather-container ${weatherData.weatherType}`;
  
  // Update weather card
  renderWeatherCard();
  
  // Create weather animation
  updateWeatherAnimation();
  
  // Show weather card
  hideLoadingState();
  startMessage.classList.add('hidden');
  weatherCard.classList.remove('hidden');
}

/**
 * Render the weather card with current data
 */
function renderWeatherCard() {
  const formattedDate = getFormattedDate(weatherData.dateTime, weatherData.timezone);
  
  weatherCard.innerHTML = `
    <div class="weather-card">
      <div class="weather-card-header">
        <div class="weather-location-temp">
          <div>
            <div class="weather-location">${weatherData.location}, ${weatherData.country}</div>
            <div class="weather-date">${formattedDate}</div>
          </div>
          <div class="weather-temp">${weatherData.temperature}°</div>
        </div>
      </div>
      <div class="weather-card-body">
        <div class="weather-details">
          <div class="weather-description">${weatherData.description}</div>
          
          <div class="separator"></div>
          
          <div class="weather-stats">
            <div class="weather-stat">
              <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9a4 4 0 0 0-2 7.5"/><path d="M12 3v2"/><path d="m6.6 18.4-1.4 1.4"/><path d="M20 4v.01"/><path d="M12 18v2"/><path d="M4 12H2"/><path d="M12 4v4"/><path d="m17.4 6.6 1.4-1.4"/><path d="M20 12h2"/><path d="m17.4 17.4 1.4 1.4"/><path d="M12 13a1 1 0 0 1 0 2"/>
              </svg>
              <div class="stat-label">Feels Like</div>
              <div class="stat-value">${weatherData.feelsLike}°</div>
            </div>
            
            <div class="weather-stat">
              <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
              </svg>
              <div class="stat-label">Humidity</div>
              <div class="stat-value">${weatherData.humidity}%</div>
            </div>
            
            <div class="weather-stat">
              <svg class="stat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
              </svg>
              <div class="stat-label">Wind</div>
              <div class="stat-value">${weatherData.windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update the weather animation based on current weather
 */
function updateWeatherAnimation() {
  // Clear previous animation
  weatherAnimation.innerHTML = '';
  
  // Check if we can create animations
  if (!weatherData) return;
  
  const isDay = isDayTime(
    weatherData.dateTime,
    weatherData.sunrise,
    weatherData.sunset
  );
  
  // Create and append new animation
  const animation = createWeatherAnimation(weatherData.weatherType, isDay);
  weatherAnimation.appendChild(animation);
}

/**
 * Show loading state
 */
function showLoadingState() {
  isLoading = true;
  weatherCard.classList.add('hidden');
  startMessage.classList.add('hidden');
  loadingIndicator.classList.remove('hidden');
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  isLoading = false;
  loadingIndicator.classList.add('hidden');
}

/**
 * Update the start message
 */
function updateStartMessage(message) {
  startMessage.querySelector('p').textContent = message;
  if (weatherCard.classList.contains('hidden') && loadingIndicator.classList.contains('hidden')) {
    startMessage.classList.remove('hidden');
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error)
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  
  toast.innerHTML = `
    <div>${message}</div>
    <button class="toast-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
      </svg>
    </button>
  `;
  
  // Add event listener to close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  // Add to DOM
  toastContainer.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

/**
 * Get API key from localStorage or use default
 */
function getApiKey() {
  return localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Listen for clicks outside the suggestions to close them
document.addEventListener('click', (e) => {
  const isClickInside = suggestionsContainer.contains(e.target) || 
                        searchInput.contains(e.target);
  
  if (!isClickInside && !suggestionsContainer.classList.contains('hidden')) {
    suggestionsContainer.classList.add('hidden');
  }
});
