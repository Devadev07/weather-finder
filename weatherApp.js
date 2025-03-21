
// Main Weather App JavaScript

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const suggestions = document.getElementById('suggestions');
const loadingIndicator = document.getElementById('loadingIndicator');
const weatherCardContainer = document.getElementById('weatherCardContainer');
const initialMessage = document.getElementById('initialMessage');
const messageText = document.getElementById('messageText');
const weatherAnimation = document.getElementById('weatherAnimation');

// State
let weatherData = null;
let isLoading = false;
let locationSuggestions = [];
let debounceTimer;
let isUsingGeolocation = false;

// Initialize app
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Add event listeners
  searchButton.addEventListener('click', handleSearch);
  locationButton.addEventListener('click', useCurrentLocation);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else {
      handleInputChange(e.target.value);
    }
  });

  // Check for previously searched location in localStorage
  const lastLocation = localStorage.getItem('lastLocation');
  if (lastLocation) {
    searchInput.value = lastLocation;
    handleSearch();
  }
}

// Handle search
function handleSearch() {
  const query = searchInput.value.trim();
  if (query) {
    searchWeather(query);
    hideSuggestions();
    localStorage.setItem('lastLocation', query);
  }
}

// Search weather by location name
async function searchWeather(location) {
  showLoading();
  isUsingGeolocation = false;
  
  try {
    const apiKey = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
    const response = await fetch(`${WEATHER_API_URL}/weather?q=${location}&appid=${apiKey}`);
    
    if (!response.ok) {
      throw new Error('Location not found');
    }
    
    const data = await response.json();
    weatherData = formatWeatherData(data);
    
    updateWeatherDisplay();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Use current location
function useCurrentLocation() {
  if (navigator.geolocation) {
    showLoading();
    isUsingGeolocation = true;
    messageText.textContent = 'Detecting your location...';
    initialMessage.classList.remove('hidden');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        searchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        isUsingGeolocation = false;
        hideLoading();
        showError('Could not get your location. Please search manually.');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    showError('Geolocation is not supported by your browser');
  }
}

// Search weather by coordinates
async function searchWeatherByCoords(lat, lon) {
  try {
    const apiKey = localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
    const response = await fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    
    if (!response.ok) {
      throw new Error('Could not fetch weather data');
    }
    
    const data = await response.json();
    weatherData = formatWeatherData(data);
    
    // Update search input with location name
    searchInput.value = `${data.name}, ${data.sys.country}`;
    localStorage.setItem('lastLocation', searchInput.value);
    
    updateWeatherDisplay();
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
    isUsingGeolocation = false;
  }
}

// Handle input change for suggestions
function handleInputChange(value) {
  clearTimeout(debounceTimer);
  
  if (value.length < 3) {
    hideSuggestions();
    return;
  }
  
  debounceTimer = setTimeout(() => {
    fetchLocationSuggestions(value);
  }, 500);
}

// Fetch location suggestions
async function fetchLocationSuggestions(query) {
  try {
    const response = await fetch(`${GEO_API_URL}/cities?namePrefix=${query}&limit=5`, GEO_API_OPTIONS);
    
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    
    const data = await response.json();
    locationSuggestions = data.data.map(city => ({
      name: city.name,
      country: city.country,
      state: city.regionCode
    }));
    
    displaySuggestions();
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    locationSuggestions = [];
    hideSuggestions();
  }
}

// Display location suggestions
function displaySuggestions() {
  if (locationSuggestions.length === 0) {
    hideSuggestions();
    return;
  }
  
  suggestions.innerHTML = '';
  
  locationSuggestions.forEach((suggestion, index) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `
      <div class="suggestion-name">${suggestion.name}</div>
      <div class="suggestion-location">
        ${suggestion.state ? `${suggestion.state}, ` : ''}
        ${suggestion.country}
      </div>
    `;
    
    item.addEventListener('click', () => {
      const locationString = suggestion.state 
        ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
        : `${suggestion.name}, ${suggestion.country}`;
      
      searchInput.value = locationString;
      handleSearch();
    });
    
    suggestions.appendChild(item);
  });
  
  suggestions.classList.remove('hidden');
}

// Hide suggestions
function hideSuggestions() {
  suggestions.classList.add('hidden');
}

// Update weather display
function updateWeatherDisplay() {
  if (!weatherData) return;
  
  // Update container background
  document.querySelector('.weather-container').className = `weather-container ${weatherData.weatherType}`;
  
  // Create weather card
  weatherCardContainer.innerHTML = createWeatherCard(weatherData);
  weatherCardContainer.classList.remove('hidden');
  initialMessage.classList.add('hidden');
  
  // Update weather animation
  updateWeatherAnimation(weatherData.weatherType);
}

// Create weather card HTML
function createWeatherCard(data) {
  const formattedDate = getFormattedDate(data.dateTime, data.timezone);
  const isDay = isDayTime(data.dateTime, data.sunrise, data.sunset);
  
  return `
    <div class="weather-card">
      <div class="weather-card-header">
        <div class="location-row">
          <div class="location-info">
            <h3>${data.location}, ${data.country}</h3>
            <p>${formattedDate}</p>
          </div>
          <div class="temperature">${data.temperature}°</div>
        </div>
      </div>
      <div class="weather-card-body">
        <div class="weather-description">${data.description}</div>
        
        <div class="separator"></div>
        
        <div class="weather-details">
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>
            <div class="detail-label">Feels Like</div>
            <div class="detail-value">${data.feelsLike}°</div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path></svg>
            <div class="detail-label">Humidity</div>
            <div class="detail-value">${data.humidity}%</div>
          </div>
          
          <div class="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
            <div class="detail-label">Wind</div>
            <div class="detail-value">${data.windSpeed} km/h</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update weather animation
function updateWeatherAnimation(weatherType) {
  const isDay = isDayTime(weatherData.dateTime, weatherData.sunrise, weatherData.sunset);
  weatherAnimation.innerHTML = '';
  
  let animationHTML = '';
  
  switch (weatherType) {
    case WEATHER_TYPES.SUNNY:
      animationHTML = `
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          ${isDay 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-10 right-10 animate-pulse-soft"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-12 right-12 animate-pulse-soft"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`
          }
          <div class="absolute opacity-30 bg-gradient-to-b from-yellow-200 to-transparent rounded-full h-64 w-64 top-0 right-0 blur-3xl animate-pulse-soft"></div>
        </div>
      `;
      break;
      
    case WEATHER_TYPES.CLOUDY:
      animationHTML = `
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-16 right-20 animate-float"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-32 right-60 animate-float" style="animation-delay: 1.5s"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-24 right-40 animate-float" style="animation-delay: 1s"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
        </div>
      `;
      break;
      
    case WEATHER_TYPES.RAINY:
      animationHTML = `
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-16 right-20 animate-float"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M11 13v2"></path><path d="M14 13v4"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-32 right-60 animate-float" style="animation-delay: 1.5s"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M11 13v2"></path><path d="M14 13v4"></path></svg>
          
          ${Array.from({ length: 20 }).map((_, i) => {
            const left = 20 + Math.random() * 60;
            const delay = Math.random() * 5;
            const duration = 0.5 + Math.random() * 1.5;
            return `<div 
              class="absolute bg-blue-100/70 w-0.5 h-6 rounded-full animate-rain"
              style="top: -24px; left: ${left}%; animation-delay: ${delay}s; animation-duration: ${duration}s"
            ></div>`;
          }).join('')}
        </div>
      `;
      break;
      
    case WEATHER_TYPES.SNOWY:
      animationHTML = `
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-16 right-20 animate-float"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M11 13v2"></path><path d="M14 13v4"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-32 right-60 animate-float" style="animation-delay: 1.5s"><path d="M2 12h20"></path><path d="M12 2v20"></path><path d="m4.93 4.93 14.14 14.14"></path><path d="m19.07 4.93-14.14 14.14"></path></svg>
          
          ${Array.from({ length: 30 }).map((_, i) => {
            const size = 2 + Math.random() * 4;
            const left = 10 + Math.random() * 80;
            const delay = Math.random() * 10;
            const duration = 5 + Math.random() * 10;
            return `<div 
              class="absolute bg-white rounded-full animate-snow"
              style="width: ${size}px; height: ${size}px; top: -10px; left: ${left}%; animation-delay: ${delay}s; animation-duration: ${duration}s"
            ></div>`;
          }).join('')}
        </div>
      `;
      break;
      
    case WEATHER_TYPES.STORMY:
      animationHTML = `
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="storm-clouds">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-16 right-20 animate-float"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M13 9v4"></path><path d="m15 13-2 2"></path><path d="m11 15-2 2"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-32 right-60 animate-float" style="animation-delay: 1.5s"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M13 9v4"></path><path d="m15 13-2 2"></path><path d="m11 15-2 2"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-12 right-40 animate-float" style="animation-delay: 2.2s"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M13 9v4"></path><path d="m15 13-2 2"></path><path d="m11 15-2 2"></path></svg>
          </div>
          
          <div class="lightning-container absolute inset-0">
            <div class="lightning absolute opacity-0 w-[2px] h-40 bg-white top-[10%] right-[30%] animate-lightning-strike" style="animation-delay: 1.2s"></div>
            <div class="lightning absolute opacity-0 w-[3px] h-60 bg-white top-[5%] right-[20%] animate-lightning-strike" style="animation-delay: 4.5s"></div>
            <div class="lightning absolute opacity-0 w-[2px] h-50 bg-white top-[8%] right-[40%] animate-lightning-strike" style="animation-delay: 7.8s"></div>
            
            <div class="lightning-flash absolute inset-0 bg-white/5 opacity-0 animate-lightning-flash"></div>
            <div class="lightning-flash absolute inset-0 bg-white/5 opacity-0 animate-lightning-flash" style="animation-delay: 4.5s"></div>
            <div class="lightning-flash absolute inset-0 bg-white/5 opacity-0 animate-lightning-flash" style="animation-delay: 7.8s"></div>
          </div>
          
          <div class="thunder-ripple absolute w-20 h-20 rounded-full bg-white/5 opacity-0 top-[20%] right-[25%] animate-thunder-ripple" style="animation-delay: 1.5s"></div>
          <div class="thunder-ripple absolute w-30 h-30 rounded-full bg-white/5 opacity-0 top-[15%] right-[35%] animate-thunder-ripple" style="animation-delay: 4.8s"></div>
        </div>
      `;
      break;
      
    case WEATHER_TYPES.FOGGY:
      animationHTML = `
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-16 right-20 animate-float"><path d="M4 14.899A7 7 0 1 1 15.71 8h2.79a4.5 4.5 0 1 1 0 9h-1.5"></path><path d="M16 17H7"></path><path d="M17 21H9"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute top-32 right-60 animate-float" style="animation-delay: 1.5s"><path d="M4 14.899A7 7 0 1 1 15.71 8h2.79a4.5 4.5 0 1 1 0 9h-1.5"></path><path d="M16 17H7"></path><path d="M17 21H9"></path></svg>
          
          <div class="absolute w-full h-20 bg-white/10 top-40 blur-md"></div>
          <div class="absolute w-full h-16 bg-white/10 top-60 blur-md" style="animation-delay: 1s"></div>
          <div class="absolute w-full h-24 bg-white/10 top-80 blur-md" style="animation-delay: 2s"></div>
        </div>
      `;
      break;
      
    default:
      animationHTML = '';
  }
  
  weatherAnimation.innerHTML = animationHTML;
}

// Show loading indicator
function showLoading() {
  isLoading = true;
  loadingIndicator.classList.remove('hidden');
  weatherCardContainer.classList.add('hidden');
  initialMessage.classList.add('hidden');
}

// Hide loading indicator
function hideLoading() {
  isLoading = false;
  loadingIndicator.classList.add('hidden');
  
  if (!weatherData) {
    initialMessage.classList.remove('hidden');
    messageText.textContent = 'Search for a location to see the weather.';
  }
}

// Show error
function showError(message) {
  weatherCardContainer.classList.add('hidden');
  initialMessage.classList.remove('hidden');
  messageText.textContent = message;
  showToast(message, true);
}
