
// Weather Application - Main JS File

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const suggestions = document.getElementById('suggestions');
const loadingIndicator = document.getElementById('loadingIndicator');
const weatherCardContainer = document.getElementById('weatherCardContainer');
const initialMessage = document.getElementById('initialMessage');
const weatherAnimation = document.getElementById('weatherAnimation');
const messageText = document.getElementById('messageText');

// State
let isLoading = false;
let isUsingGeolocation = false;
let locationSuggestions = [];
let currentWeatherData = null;

// Initialize application
function initApp() {
  // Add event listeners
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') handleSearch();
    else handleInputChange(event);
  });
  locationButton.addEventListener('click', useCurrentLocation);
  
  // Check for API key in localStorage
  const apiKey = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY);
  if (!apiKey) {
    // Set default API key if not found
    localStorage.setItem(WEATHER_API_KEY_STORAGE_KEY, DEFAULT_WEATHER_API_KEY);
  }
}

// Handle search input changes
let debounceTimer;
function handleInputChange(event) {
  const query = event.target.value.trim();
  
  // Clear previous timer
  clearTimeout(debounceTimer);
  
  // Hide suggestions if query is empty
  if (query.length < 2) {
    suggestions.classList.add('hidden');
    locationSuggestions = [];
    return;
  }
  
  // Set a new timer for 300ms
  debounceTimer = setTimeout(() => {
    fetchLocationSuggestions(query);
  }, 300);
}

// Fetch location suggestions
async function fetchLocationSuggestions(query) {
  if (!query || query.length < 2) {
    suggestions.classList.add('hidden');
    return;
  }
  
  try {
    const response = await fetch(
      `${GEO_API_URL}/cities?namePrefix=${query}&limit=5`,
      GEO_API_OPTIONS
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch location suggestions");
    }
    
    const data = await response.json();
    locationSuggestions = data.data || [];
    
    // Display suggestions
    renderSuggestions();
    
  } catch (error) {
    console.error("Error fetching location suggestions:", error);
    suggestions.classList.add('hidden');
  }
}

// Render location suggestions
function renderSuggestions() {
  // Clear previous suggestions
  suggestions.innerHTML = '';
  
  if (locationSuggestions.length === 0) {
    suggestions.classList.add('hidden');
    return;
  }
  
  // Create suggestion items
  locationSuggestions.forEach(suggestion => {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'suggestion-item';
    suggestionItem.innerHTML = `
      <div class="suggestion-name">${suggestion.city}</div>
      <div class="suggestion-location">${suggestion.countryCode}, ${suggestion.region || suggestion.country}</div>
    `;
    
    // Add click handler
    suggestionItem.addEventListener('click', () => {
      searchInput.value = suggestion.city;
      suggestions.classList.add('hidden');
      handleSearch();
    });
    
    suggestions.appendChild(suggestionItem);
  });
  
  // Show suggestions
  suggestions.classList.remove('hidden');
}

// Handle search
function handleSearch() {
  const locationToSearch = searchInput.value.trim();
  if (!locationToSearch) return;
  
  fetchWeatherData(locationToSearch);
}

// Fetch weather data
async function fetchWeatherData(location) {
  const API_KEY = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
  
  try {
    setLoading(true);
    
    // Hide suggestions
    suggestions.classList.add('hidden');
    
    const response = await fetch(
      `${WEATHER_API_URL}/weather?q=${location}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error("Weather data not found");
    }
    
    const data = await response.json();
    const formattedData = formatWeatherData(data);
    
    // Save current weather data
    currentWeatherData = formattedData;
    
    // Render weather data
    renderWeatherData(formattedData);
    
    // Save recent search
    saveRecentSearch(location);
    
    // Set weather animation
    updateWeatherAnimation(formattedData.weatherType, isDayTime(
      formattedData.dateTime, 
      formattedData.sunrise, 
      formattedData.sunset
    ));
    
    return formattedData;
    
  } catch (error) {
    showToast(error.message || "Failed to fetch weather data", true);
    initialMessage.classList.remove('hidden');
    weatherCardContainer.classList.add('hidden');
    messageText.textContent = "Location not found. Please try again.";
    
    return null;
    
  } finally {
    setLoading(false);
  }
}

// Use current location
function useCurrentLocation() {
  if (isLoading) return;
  
  isUsingGeolocation = true;
  updateLoadingState();
  
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser", true);
    isUsingGeolocation = false;
    updateLoadingState();
    return;
  }
  
  initialMessage.classList.remove('hidden');
  weatherCardContainer.classList.add('hidden');
  messageText.textContent = "Detecting your location...";
  
  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        const { latitude, longitude } = position.coords;
        const API_KEY = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
        
        setLoading(true);
        
        const response = await fetch(
          `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error("Weather data not found");
        }
        
        const data = await response.json();
        const formattedData = formatWeatherData(data);
        
        // Save current weather data
        currentWeatherData = formattedData;
        
        // Render weather data
        renderWeatherData(formattedData);
        
        // Update search input with location name
        searchInput.value = data.name;
        
        // Set weather animation
        updateWeatherAnimation(formattedData.weatherType, isDayTime(
          formattedData.dateTime, 
          formattedData.sunrise, 
          formattedData.sunset
        ));
        
      } catch (error) {
        showToast(error.message || "Failed to get weather data for your location", true);
        initialMessage.classList.remove('hidden');
        weatherCardContainer.classList.add('hidden');
        messageText.textContent = "Failed to get weather data. Please try searching instead.";
      } finally {
        isUsingGeolocation = false;
        updateLoadingState();
      }
    },
    error => {
      isUsingGeolocation = false;
      updateLoadingState();
      
      let errorMessage = "Failed to get your location";
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = "Location access denied. Please enable location services.";
      }
      
      showToast(errorMessage, true);
      initialMessage.classList.remove('hidden');
      weatherCardContainer.classList.add('hidden');
      messageText.textContent = "Location access failed. Please try searching instead.";
    }
  );
}

// Render weather data
function renderWeatherData(weatherData) {
  if (!weatherData) return;
  
  // Update container class for background
  document.querySelector('.weather-container').className = `weather-container ${weatherData.weatherType}`;
  
  // Hide message and show weather card
  initialMessage.classList.add('hidden');
  weatherCardContainer.classList.remove('hidden');
  
  // Create weather card HTML
  weatherCardContainer.innerHTML = `
    <div class="weather-card">
      <div class="weather-card-header">
        <div class="location-row">
          <div class="location-info">
            <h3>${weatherData.location}</h3>
            <p>${weatherData.country}</p>
          </div>
          <div class="temperature">
            ${weatherData.temperature}°C
          </div>
        </div>
      </div>
      
      <div class="weather-card-body">
        <div class="weather-description">
          ${weatherData.description}
        </div>
        
        <div class="separator"></div>
        
        <div style="margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.25rem; color: rgba(255, 255, 255, 0.8);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span style="font-size: 0.875rem;">
              ${getFormattedDate(weatherData.dateTime, weatherData.timezone)}
            </span>
          </div>
        </div>
        
        <div class="weather-details">
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
            </svg>
            <div class="detail-label">Feels Like</div>
            <div class="detail-value">${weatherData.feelsLike}°</div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
              <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path>
            </svg>
            <div class="detail-label">Humidity</div>
            <div class="detail-value">${weatherData.humidity}%</div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
              <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
              <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
            </svg>
            <div class="detail-label">Wind</div>
            <div class="detail-value">${weatherData.windSpeed} km/h</div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v8"></path>
              <path d="m4.93 10.93 1.41 1.41"></path>
              <path d="M2 18h2"></path>
              <path d="M20 18h2"></path>
              <path d="m19.07 10.93-1.41 1.41"></path>
              <path d="M22 22H2"></path>
              <path d="m8 6 4-4 4 4"></path>
              <path d="M16 18a4 4 0 0 0-8 0"></path>
            </svg>
            <div class="detail-label">Sunrise</div>
            <div class="detail-value">
              ${getFormattedTime(weatherData.sunrise, weatherData.timezone)}
            </div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 10v2"></path>
              <path d="m4.93 10.93 1.41 1.41"></path>
              <path d="M2 18h2"></path>
              <path d="M20 18h2"></path>
              <path d="m19.07 10.93-1.41 1.41"></path>
              <path d="M22 22H2"></path>
              <path d="m16 6-4 4-4-4"></path>
              <path d="M16 18a4 4 0 0 0-8 0"></path>
            </svg>
            <div class="detail-label">Sunset</div>
            <div class="detail-value">
              ${getFormattedTime(weatherData.sunset, weatherData.timezone)}
            </div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
            <div class="detail-label">Status</div>
            <div class="detail-value">${weatherData.weatherType}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update loading state
function setLoading(loading) {
  isLoading = loading;
  updateLoadingState();
}

function updateLoadingState() {
  if (isLoading || isUsingGeolocation) {
    loadingIndicator.classList.remove('hidden');
    searchButton.disabled = true;
    locationButton.disabled = true;
  } else {
    loadingIndicator.classList.add('hidden');
    searchButton.disabled = false;
    locationButton.disabled = false;
  }
}

// Save recent searches
function saveRecentSearch(location) {
  const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]");
  
  // Add the new search if it's not already in the list
  if (!recentSearches.includes(location)) {
    // Add to the beginning of the array and limit to 5 items
    const updatedSearches = [location, ...recentSearches].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  }
}

// Update weather animation
function updateWeatherAnimation(weatherType, isDay) {
  // Update container class
  document.querySelector('.weather-container').className = `weather-container ${weatherType || 'default'}`;
  
  // Clear previous animation
  weatherAnimation.innerHTML = '';
  
  // Based on weather type, create different animation elements
  let animationHTML = '';
  
  switch (weatherType) {
    case 'sunny':
      if (isDay) {
        // Sun rays
        animationHTML = `<div class="sun-animation"></div>`;
      } else {
        // Moon and stars
        animationHTML = `
          <div class="moon-animation"></div>
          ${Array(20).fill().map(() => `<div class="star" style="
            left: ${Math.random() * 100}%; 
            top: ${Math.random() * 60}%;
            animation-delay: ${Math.random() * 3}s;
          "></div>`).join('')}
        `;
      }
      break;
      
    case 'cloudy':
      // Floating clouds
      animationHTML = Array(5).fill().map(() => `
        <div class="cloud" style="
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 50}%;
          animation-duration: ${20 + Math.random() * 10}s;
          animation-delay: ${Math.random() * 10}s;
          transform: scale(${0.5 + Math.random() * 0.5});
        "></div>
      `).join('');
      break;
      
    case 'rainy':
      // Rain drops
      animationHTML = Array(50).fill().map(() => `
        <div class="raindrop" style="
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 2}s;
          animation-duration: ${0.5 + Math.random() * 0.5}s;
        "></div>
      `).join('');
      break;
      
    case 'snowy':
      // Snowflakes
      animationHTML = Array(30).fill().map(() => `
        <div class="snowflake" style="
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation-delay: ${Math.random() * 3}s;
          animation-duration: ${3 + Math.random() * 5}s;
          transform: scale(${0.5 + Math.random() * 0.5});
        "></div>
      `).join('');
      break;
      
    case 'stormy':
      // Lightning
      animationHTML = `
        <div class="lightning"></div>
        ${Array(70).fill().map(() => `
          <div class="raindrop raindrop-stormy" style="
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${0.3 + Math.random() * 0.4}s;
          "></div>
        `).join('')}
      `;
      break;
      
    case 'foggy':
      // Fog patches
      animationHTML = Array(8).fill().map((_, i) => `
        <div class="fog-patch" style="
          left: ${Math.random() * 100}%;
          top: ${i * 15}%;
          animation-duration: ${15 + Math.random() * 20}s;
          animation-delay: ${Math.random() * 10}s;
          opacity: ${0.1 + Math.random() * 0.2};
        "></div>
      `).join('');
      break;
      
    default:
      // Light clouds for default
      animationHTML = Array(3).fill().map(() => `
        <div class="cloud" style="
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 50}%;
          animation-duration: ${20 + Math.random() * 10}s;
          animation-delay: ${Math.random() * 10}s;
          transform: scale(${0.5 + Math.random() * 0.5});
          opacity: 0.7;
        "></div>
      `).join('');
  }
  
  // Set animation HTML
  weatherAnimation.innerHTML = animationHTML;
}

// Add CSS for weather animations
function addAnimationStyles() {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Sun animation */
    .sun-animation {
      position: absolute;
      top: 10%;
      right: 10%;
      width: 100px;
      height: 100px;
      background: rgba(255, 230, 100, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 50px rgba(255, 255, 190, 0.8);
      animation: pulse-soft 4s infinite, float 8s infinite;
    }
    
    /* Moon animation */
    .moon-animation {
      position: absolute;
      top: 10%;
      right: 10%;
      width: 80px;
      height: 80px;
      background: rgba(220, 230, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 30px rgba(200, 220, 255, 0.3);
      animation: float 8s infinite;
    }
    
    /* Star */
    .star {
      position: absolute;
      width: 3px;
      height: 3px;
      background: white;
      border-radius: 50%;
      animation: pulse-soft 3s infinite;
    }
    
    /* Cloud */
    .cloud {
      position: absolute;
      width: 150px;
      height: 60px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50px;
      animation: float-horizontal linear infinite;
    }
    
    .cloud:before {
      content: '';
      position: absolute;
      width: 90px;
      height: 90px;
      top: -30px;
      left: 15px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }
    
    .cloud:after {
      content: '';
      position: absolute;
      width: 70px;
      height: 70px;
      top: -20px;
      right: 15px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }
    
    /* Raindrop */
    .raindrop {
      position: absolute;
      width: 2px;
      height: 15px;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(200, 220, 255, 0.5));
      animation: rain linear infinite;
    }
    
    .raindrop-stormy {
      height: 20px;
      transform: rotate(15deg);
    }
    
    /* Snowflake */
    .snowflake {
      position: absolute;
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: snow linear infinite;
    }
    
    /* Lightning */
    .lightning {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      animation: lightning-flash 5s infinite;
    }
    
    /* Fog patch */
    .fog-patch {
      position: absolute;
      width: 200px;
      height: 100px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 100px;
      filter: blur(20px);
      animation: float-horizontal linear infinite;
    }
    
    /* Horizontal floating animation */
    @keyframes float-horizontal {
      0% {
        transform: translateX(-200px);
      }
      100% {
        transform: translateX(calc(100vw + 200px));
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  addAnimationStyles();
});
