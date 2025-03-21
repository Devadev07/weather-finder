
// Main weather application code
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const locationButton = document.getElementById('locationButton');
  const suggestionsContainer = document.getElementById('suggestions');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const weatherCardContainer = document.getElementById('weatherCardContainer');
  const initialMessage = document.getElementById('initialMessage');
  const messageText = document.getElementById('messageText');
  const weatherContainer = document.querySelector('.weather-container');
  const weatherAnimation = document.getElementById('weatherAnimation');

  // State variables
  let isUsingGeolocation = false;
  let locationSuggestions = [];
  let weatherData = null;
  let currentLocation = '';

  // Initialize application
  init();

  // Function to initialize the application
  function init() {
    // Add event listeners
    searchInput.addEventListener('input', handleSearchInput);
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
    locationButton.addEventListener('click', useCurrentLocation);

    // Try to use geolocation on initial load
    useCurrentLocation();
  }

  // Function to handle search input changes
  function handleSearchInput(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
      fetchLocationSuggestions(query);
    } else {
      suggestionsContainer.classList.add('hidden');
      locationSuggestions = [];
    }
  }

  // Function to handle search button click
  function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
      isUsingGeolocation = false;
      locationButton.classList.remove('active');
      searchLocation(query);
    } else {
      showToast('Please enter a location', true);
    }
  }

  // Function to use current location
  function useCurrentLocation() {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', true);
      return;
    }

    isUsingGeolocation = true;
    locationButton.classList.add('active');
    messageText.textContent = 'Detecting your location...';
    initialMessage.classList.remove('hidden');
    weatherCardContainer.classList.add('hidden');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        fetchWeatherByCoordinates(coords);
        showToast('Location detected successfully');
      },
      (error) => {
        console.error('Geolocation error:', error);
        showToast('Unable to retrieve your location', true);
        isUsingGeolocation = false;
        locationButton.classList.remove('active');
        messageText.textContent = 'Search for a location to see the weather.';
      }
    );
  }

  // Function to search for a location
  function searchLocation(query) {
    if (!query) {
      showToast('Please enter a location', true);
      return;
    }
    
    currentLocation = query;
    showLoading();
    fetchWeatherByCity(query);
  }

  // Function to fetch location suggestions
  function fetchLocationSuggestions(query) {
    if (query.length < 3) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    const apiKey = getApiKey();
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch location suggestions');
        }
        return response.json();
      })
      .then(data => {
        // Format the suggestions
        locationSuggestions = data.map(item => ({
          name: item.name,
          country: item.country,
          state: item.state,
          lat: item.lat,
          lon: item.lon
        }));
        
        renderSuggestions(locationSuggestions);
      })
      .catch(error => {
        console.error('Error fetching location suggestions:', error);
        suggestionsContainer.classList.add('hidden');
      });
  }

  // Function to render location suggestions
  function renderSuggestions(suggestions) {
    if (suggestions.length === 0) {
      suggestionsContainer.classList.add('hidden');
      return;
    }
    
    suggestionsContainer.innerHTML = '';
    const ul = document.createElement('ul');
    
    suggestions.forEach(suggestion => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      
      const locationString = suggestion.state 
        ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
        : `${suggestion.name}, ${suggestion.country}`;
      
      li.innerHTML = `
        <div class="suggestion-item-name">${suggestion.name}</div>
        <div class="suggestion-item-location">
          ${suggestion.state ? `${suggestion.state}, ` : ''}
          ${suggestion.country}
        </div>
      `;
      
      li.addEventListener('click', () => {
        searchInput.value = locationString;
        suggestionsContainer.classList.add('hidden');
        searchLocation(locationString);
      });
      
      ul.appendChild(li);
    });
    
    suggestionsContainer.appendChild(ul);
    suggestionsContainer.classList.remove('hidden');
  }

  // Function to get the API key
  function getApiKey() {
    return localStorage.getItem(WEATHER_API_KEY_STORAGE_KEY) || DEFAULT_WEATHER_API_KEY;
  }

  // Function to fetch weather by city name
  function fetchWeatherByCity(locationQuery) {
    const apiKey = getApiKey();
    
    fetch(`${WEATHER_API_URL}/weather?q=${locationQuery}&appid=${apiKey}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || 'Failed to fetch weather data');
          });
        }
        return response.json();
      })
      .then(data => {
        weatherData = formatWeatherData(data);
        renderWeatherData(weatherData);
        hideLoading();
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        showToast(`Error: ${error.message}`, true);
        hideLoading();
        initialMessage.classList.remove('hidden');
        weatherCardContainer.classList.add('hidden');
      });
  }

  // Function to fetch weather by coordinates
  function fetchWeatherByCoordinates(coords) {
    const apiKey = getApiKey();
    
    fetch(`${WEATHER_API_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || 'Failed to fetch weather data');
          });
        }
        return response.json();
      })
      .then(data => {
        weatherData = formatWeatherData(data);
        renderWeatherData(weatherData);
        searchInput.value = weatherData.location + ', ' + weatherData.country;
        hideLoading();
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        showToast(`Error: ${error.message}`, true);
        hideLoading();
        initialMessage.classList.remove('hidden');
        weatherCardContainer.classList.add('hidden');
      });
  }

  // Function to show loading state
  function showLoading() {
    loadingIndicator.classList.remove('hidden');
    initialMessage.classList.add('hidden');
    weatherCardContainer.classList.add('hidden');
  }

  // Function to hide loading state
  function hideLoading() {
    loadingIndicator.classList.add('hidden');
  }

  // Function to render weather data
  function renderWeatherData(data) {
    if (!data) return;
    
    const { 
      location, 
      country, 
      temperature, 
      feelsLike, 
      humidity, 
      windSpeed, 
      description, 
      weatherType,
      dateTime,
      timezone,
      sunrise,
      sunset
    } = data;
    
    // Change container background based on weather type
    weatherContainer.className = `weather-container ${weatherType}`;
    
    // Create the formatted date
    const formattedDate = getFormattedDate(dateTime, timezone);
    
    // Check if it's daytime
    const isDay = isDayTime(dateTime, sunrise, sunset);
    
    // Render weather animations
    renderWeatherAnimation(weatherType, isDay);
    
    // Create the weather card HTML
    const weatherCardHTML = `
      <div class="weather-card">
        <div class="weather-card-header">
          <div class="weather-card-location">
            <div class="location-info">
              <h3>${location}, ${country}</h3>
              <p class="location-date">${formattedDate}</p>
            </div>
            <div class="temperature">${temperature}°</div>
          </div>
        </div>
        <div class="weather-card-body">
          <div class="weather-description">${description}</div>
          
          <div class="weather-separator"></div>
          
          <div class="weather-details">
            <div class="weather-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-detail-icon"><path d="M12 9a4 4 0 0 0-2 7.5"></path><path d="M12 3v2"></path><path d="m6.6 18.4-1.4 1.4"></path><path d="M20 4v.5"></path><path d="M20 10v.5"></path><path d="M20 17v.5"></path><path d="M20 17v.5"></path><path d="M17 20h.5"></path><path d="M11 20h.5"></path><path d="M4 20h.5"></path><path d="M4 13h.5"></path><path d="M4 6h.5"></path><path d="M17 6h-3"></path><path d="M14 14h.5"></path><path d="M14 18h.5"></path><path d="M17 18h.5"></path><path d="M18 6h.5"></path><path d="M6 13h.5"></path><path d="M11 13h.5"></path><path d="m11 3 1-1 1 1-1 1z"></path><path d="m19 6-1 1 1 1 1-1z"></path><path d="m19 19-1-1-1 1 1 1z"></path><path d="m6 19-1-1-1 1 1 1z"></path><path d="m11 13-1 1 1 1 1-1z"></path><path d="m6 6-1 1 1 1 1-1z"></path><path d="M12 14v6"></path></svg>
              <div class="weather-detail-label">Feels Like</div>
              <div class="weather-detail-value">${feelsLike}°</div>
            </div>
            
            <div class="weather-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-detail-icon"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"></path></svg>
              <div class="weather-detail-label">Humidity</div>
              <div class="weather-detail-value">${humidity}%</div>
            </div>
            
            <div class="weather-detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-detail-icon"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>
              <div class="weather-detail-label">Wind</div>
              <div class="weather-detail-value">${windSpeed} km/h</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Update the weather card container
    weatherCardContainer.innerHTML = weatherCardHTML;
    weatherCardContainer.classList.remove('hidden');
    initialMessage.classList.add('hidden');
  }

  // Function to render weather animations
  function renderWeatherAnimation(weatherType, isDay) {
    weatherAnimation.innerHTML = '';
    
    switch (weatherType) {
      case WEATHER_TYPES.SUNNY:
        if (isDay) {
          weatherAnimation.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            <div class="sun-glow"></div>
          `;
        } else {
          weatherAnimation.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
          `;
        }
        break;
        
      case WEATHER_TYPES.CLOUDY:
        weatherAnimation.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
        `;
        break;
        
      case WEATHER_TYPES.RAINY:
        weatherAnimation.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M14.5 14.5 17 17"></path><path d="M8 13v4"></path><path d="m5 16 1 1"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M14.5 14.5 17 17"></path><path d="M8 13v4"></path><path d="m5 16 1 1"></path></svg>
        `;
        
        // Add rain drops
        for (let i = 0; i < 20; i++) {
          const rainDrop = document.createElement('div');
          rainDrop.className = 'rain-drop';
          rainDrop.style.left = `${20 + Math.random() * 60}%`;
          rainDrop.style.animationDelay = `${Math.random() * 5}s`;
          rainDrop.style.animationDuration = `${0.5 + Math.random() * 1.5}s`;
          weatherAnimation.appendChild(rainDrop);
        }
        break;
        
      case WEATHER_TYPES.SNOWY:
        weatherAnimation.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
        `;
        
        // Add snowflakes
        for (let i = 0; i < 30; i++) {
          const snowflake = document.createElement('div');
          snowflake.className = 'snowflake';
          snowflake.style.width = `${2 + Math.random() * 4}px`;
          snowflake.style.height = `${2 + Math.random() * 4}px`;
          snowflake.style.left = `${10 + Math.random() * 80}%`;
          snowflake.style.animationDelay = `${Math.random() * 10}s`;
          snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
          weatherAnimation.appendChild(snowflake);
        }
        break;
        
      case WEATHER_TYPES.STORMY:
        weatherAnimation.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M11.5 15.5 9 19"></path><path d="m15 15-2 2"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M11.5 15.5 9 19"></path><path d="m15 15-2 2"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><path d="M11.5 15.5 9 19"></path><path d="m15 15-2 2"></path></svg>
        `;
        
        // Add lightning
        const lightning1 = document.createElement('div');
        lightning1.className = 'lightning';
        lightning1.style.width = '2px';
        lightning1.style.height = '160px';
        lightning1.style.top = '10%';
        lightning1.style.right = '30%';
        lightning1.style.animationDelay = '1.2s';
        weatherAnimation.appendChild(lightning1);
        
        const lightning2 = document.createElement('div');
        lightning2.className = 'lightning';
        lightning2.style.width = '3px';
        lightning2.style.height = '240px';
        lightning2.style.top = '5%';
        lightning2.style.right = '20%';
        lightning2.style.animationDelay = '4.5s';
        weatherAnimation.appendChild(lightning2);
        
        // Lightning flash
        const flash1 = document.createElement('div');
        flash1.className = 'lightning-flash';
        weatherAnimation.appendChild(flash1);
        
        const flash2 = document.createElement('div');
        flash2.className = 'lightning-flash';
        flash2.style.animationDelay = '4.5s';
        weatherAnimation.appendChild(flash2);
        
        // Thunder ripples
        const thunder1 = document.createElement('div');
        thunder1.className = 'thunder-ripple';
        thunder1.style.width = '80px';
        thunder1.style.height = '80px';
        thunder1.style.top = '20%';
        thunder1.style.right = '25%';
        thunder1.style.animationDelay = '1.5s';
        weatherAnimation.appendChild(thunder1);
        
        // Rain drops for storm
        for (let i = 0; i < 30; i++) {
          const rainDrop = document.createElement('div');
          rainDrop.className = 'rain-drop';
          rainDrop.style.width = '2px';
          rainDrop.style.height = '40px';
          rainDrop.style.left = `${10 + Math.random() * 80}%`;
          rainDrop.style.animationName = 'heavy-rain';
          rainDrop.style.animationDelay = `${Math.random() * 5}s`;
          rainDrop.style.animationDuration = `${0.3 + Math.random() * 0.7}s`;
          weatherAnimation.appendChild(rainDrop);
        }
        break;
        
      case WEATHER_TYPES.FOGGY:
        weatherAnimation.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 17H7"></path><path d="M17 21H9"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 17H7"></path><path d="M17 21H9"></path></svg>
        `;
        
        // Add fog layers
        const fog1 = document.createElement('div');
        fog1.className = 'fog-layer';
        fog1.style.top = '160px';
        weatherAnimation.appendChild(fog1);
        
        const fog2 = document.createElement('div');
        fog2.className = 'fog-layer';
        fog2.style.top = '240px';
        fog2.style.animationDelay = '5s';
        weatherAnimation.appendChild(fog2);
        
        const fog3 = document.createElement('div');
        fog3.className = 'fog-layer';
        fog3.style.top = '320px';
        fog3.style.animationDelay = '10s';
        weatherAnimation.appendChild(fog3);
        break;
        
      default:
        if (isDay) {
          weatherAnimation.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="cloud cloud-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>
          `;
        } else {
          weatherAnimation.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
          `;
        }
    }
  }
});

// CSS for toast component
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      z-index: 1000;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateY(-20px);
      opacity: 0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .toast.toast-success {
      background-color: rgba(46, 175, 109, 0.9);
    }
    
    .toast.toast-error {
      background-color: rgba(234, 56, 76, 0.9);
    }
    
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
  </style>
`);
