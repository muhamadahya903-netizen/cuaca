// Weather Pro - Premium Weather Dashboard JavaScript
class WeatherPro {
    constructor() {
        this.apiKey = 'YOUR_API_KEY'; // Get from OpenWeatherMap
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.defaultCity = 'Jakarta';
        this.units = 'metric';
        this.lang = 'id';
        this.currentWeather = null;
        this.isDarkMode = false;
        
        this.init();
    }

    async init() {
        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });

        // Initialize Swipers
        this.initializeSwipers();
        
        // Load weather data
        await this.loadWeatherData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update datetime
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
        
        // Auto refresh weather data
        setInterval(() => this.loadWeatherData(), 600000); // 10 minutes
        
        // Hide loading skeleton
        setTimeout(() => {
            this.hideLoadingSkeleton();
        }, 2000);
    }

    initializeSwipers() {
        // Forecast Slider
        new Swiper('.forecast-slider', {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1024: {
                    slidesPerView: 4,
                    spaceBetween: 40,
                },
            },
        });

        // Hourly Timeline
        new Swiper('.hourly-timeline', {
            slidesPerView: 'auto',
            spaceBetween: 15,
            scrollbar: {
                el: '.swiper-scrollbar',
                hide: false,
            },
            breakpoints: {
                640: {
                    spaceBetween: 20,
                },
                768: {
                    spaceBetween: 25,
                },
            },
        });
    }

    setupEventListeners() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async loadWeatherData() {
        try {
            await this.getCurrentLocationWeather();
            await this.getForecast();
            await this.getHourlyForecast();
            this.generateAIRecommendations();
        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showDefaultWeather();
        }
    }

    async getCurrentLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await this.getWeatherByCoords(latitude, longitude);
                },
                async (error) => {
                    console.log('Location access denied, using default city');
                    await this.getWeatherByCity(this.defaultCity);
                }
            );
        } else {
            await this.getWeatherByCity(this.defaultCity);
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            // Use mock data for demo since API key is not set
            if (this.apiKey === 'YOUR_API_KEY') {
                console.log('Using mock data - please set your OpenWeatherMap API key');
                const mockData = this.generateMockWeatherData();
                this.updateMainDashboard(mockData);
                this.currentWeather = mockData;
                return;
            }

            const response = await fetch(
                `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`
            );
            
            if (!response.ok) throw new Error('Weather data not available');
            
            const data = await response.json();
            this.updateMainDashboard(data);
            this.currentWeather = data;
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            // Fallback to mock data
            const mockData = this.generateMockWeatherData();
            this.updateMainDashboard(mockData);
            this.currentWeather = mockData;
        }
    }

    async getWeatherByCity(city) {
        try {
            // Use mock data for demo since API key is not set
            if (this.apiKey === 'YOUR_API_KEY') {
                console.log('Using mock data - please set your OpenWeatherMap API key');
                const mockData = this.generateMockWeatherData();
                this.updateMainDashboard(mockData);
                this.currentWeather = mockData;
                return;
            }

            const response = await fetch(
                `${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=${this.units}&lang=${this.lang}`
            );
            
            if (!response.ok) throw new Error('Weather data not available');
            
            const data = await response.json();
            this.updateMainDashboard(data);
            this.currentWeather = data;
            
        } catch (error) {
            console.error('Error fetching weather:', error);
            // Fallback to mock data
            const mockData = this.generateMockWeatherData();
            this.updateMainDashboard(mockData);
            this.currentWeather = mockData;
        }
    }

    generateMockWeatherData() {
        const weatherConditions = [
            { main: 'Clouds', description: 'Berawan Tebal' },
            { main: 'Clouds', description: 'Berawan' },
            { main: 'Rain', description: 'Hujan Ringan' },
            { main: 'Clear', description: 'Cerah' }
        ];
        
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        return {
            name: 'Jakarta',
            sys: { 
                country: 'ID', 
                sunrise: Date.now() / 1000 - 3600 * 6, 
                sunset: Date.now() / 1000 + 3600 * 6 
            },
            main: { 
                temp: 25 + Math.floor(Math.random() * 5), 
                feels_like: 26 + Math.floor(Math.random() * 3), 
                humidity: 85 + Math.floor(Math.random() * 15), 
                pressure: 1010 + Math.floor(Math.random() * 10) 
            },
            weather: [randomCondition],
            wind: { 
                speed: 2 + Math.random() * 5,
                deg: 270 // West
            },
            clouds: { all: 60 + Math.floor(Math.random() * 30) },
            visibility: 8000 + Math.floor(Math.random() * 2000)
        };
    }

    updateMainDashboard(data) {
        // Update location and datetime
        this.updateLocation(data.name, data.sys.country);
        
        // Update main temperature and condition
        this.updateMainWeather(data);
        
        // Update weather details
        this.updateWeatherDetails(data);
        
        // Update sun times
        this.updateSunTimes(data);
        
        // Update air quality (mock data for now)
        this.updateAirQuality();
    }

    updateLocation(city, country) {
        const locationElement = document.getElementById('main-location');
        if (locationElement) {
            locationElement.querySelector('span').textContent = `${city}, ${country}`;
        }
    }

    updateMainWeather(data) {
        // Temperature
        const tempElement = document.getElementById('main-temp');
        if (tempElement) {
            tempElement.textContent = Math.round(data.main.temp) + '°';
        }

        // Weather condition
        const conditionElement = document.getElementById('weather-condition');
        if (conditionElement) {
            conditionElement.textContent = data.weather[0].description;
        }

        // Feels like
        const feelsLikeElement = document.getElementById('feels-like');
        if (feelsLikeElement) {
            feelsLikeElement.textContent = Math.round(data.main.feels_like) + '°';
        }

        // Weather icon
        const iconElement = document.getElementById('main-weather-icon');
        if (iconElement) {
            iconElement.className = this.getWeatherIcon(data.weather[0].main);
        }
    }

    updateWeatherDetails(data) {
        const elements = {
            'wind-speed': Math.round(data.wind.speed * 3.6) + ' km/h', // Convert m/s to km/h
            'humidity': data.main.humidity + '%',
            'uv-index': this.calculateUVIndex(data),
            'visibility': (data.visibility || 10000) / 1000 + ' km' // Convert m to km
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    updateSunTimes(data) {
        const sunriseElement = document.getElementById('sunrise');
        const sunsetElement = document.getElementById('sunset');
        
        if (sunriseElement && data.sys.sunrise) {
            sunriseElement.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        if (sunsetElement && data.sys.sunset) {
            sunsetElement.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    updateAirQuality() {
        // Mock AQI data - in production, use Air Quality API
        const aqiValue = Math.floor(Math.random() * 100) + 20;
        const aqiElement = document.querySelector('.aqi-good, .aqi-moderate, .aqi-unhealthy-sensitive');
        if (aqiElement) {
            const aqiText = aqiElement.querySelector('.text-3xl');
            const aqiDesc = aqiElement.querySelector('.text-white\\/70');
            if (aqiText) aqiText.textContent = this.getAQILevel(aqiValue);
            if (aqiDesc) aqiDesc.textContent = `AQI: ${aqiValue}`;
        }
    }

    calculateUVIndex(data) {
        // Simple UV index calculation based on cloud cover and time of day
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour <= 18;
        
        if (!isDaytime) return 0;
        
        const cloudCover = data.clouds ? data.clouds.all : 0;
        const baseUV = 8; // Base UV for clear sky
        const uvIndex = Math.max(1, Math.round(baseUV * (1 - cloudCover / 100)));
        
        return Math.min(uvIndex, 11);
    }

    getAQILevel(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }

    async getForecast() {
        try {
            // Mock forecast data - in production, use forecast API
            const forecastData = this.generateForecastData();
            this.updateForecastCards(forecastData);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }

    generateForecastData() {
        const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const conditions = [
            { main: 'Clear', desc: 'Cerah', icon: 'fa-sun', tempRange: [28, 35], rainChance: 0 },
            { main: 'Clouds', desc: 'Berawan', icon: 'fa-cloud', tempRange: [25, 32], rainChance: 20 },
            { main: 'Rain', desc: 'Hujan', icon: 'fa-cloud-rain', tempRange: [22, 28], rainChance: 80 }
        ];

        return days.map((day, index) => {
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const temp = Math.floor(Math.random() * (condition.tempRange[1] - condition.tempRange[0] + 1)) + condition.tempRange[0];
            
            return {
                day,
                date: this.getDateFromDayIndex(index),
                condition,
                temp,
                rainChance: condition.rainChance
            };
        });
    }

    updateForecastCards(forecastData) {
        const container = document.getElementById('forecast-container');
        if (!container) return;

        container.innerHTML = '';

        forecastData.forEach((day, index) => {
            const card = document.createElement('div');
            const isActive = index === 0;
            card.className = `clean-card-strong p-4 text-center cursor-pointer min-w-[140px] ${isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`;
            card.innerHTML = `
                <div class="text-sm font-semibold mb-2 ${isActive ? 'text-blue-600' : 'text-gray-800'}">${day.day}</div>
                <div class="text-xs text-gray-500 mb-3">${day.date}</div>
                <div class="text-3xl mb-3 ${isActive ? 'text-blue-600' : 'text-gray-700'}">
                    <i class="fas ${day.condition.icon}"></i>
                </div>
                <div class="text-xl font-bold mb-2 ${isActive ? 'text-blue-600' : 'text-gray-800'}">${day.temp}°</div>
                <div class="text-sm ${isActive ? 'text-blue-500' : 'text-gray-600'} mb-2">${day.condition.desc}</div>
                <div class="flex items-center justify-center text-xs ${isActive ? 'text-blue-500' : 'text-gray-600'}">
                    <i class="fas fa-tint mr-1"></i>
                    <span>${day.rainChance}%</span>
                </div>
            `;
            
            card.addEventListener('click', () => {
                document.querySelectorAll('#forecast-container > div').forEach(c => {
                    c.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
                    c.classList.add('clean-card-strong');
                });
                card.classList.remove('clean-card-strong');
                card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
            });
            
            container.appendChild(card);
        });
    }

    async getHourlyForecast() {
        try {
            // Mock hourly data - in production, use hourly API
            const hourlyData = this.generateHourlyData();
            this.updateHourlyCards(hourlyData);
        } catch (error) {
            console.error('Error fetching hourly forecast:', error);
        }
    }

    generateHourlyData() {
        const currentHour = new Date().getHours();
        const hours = [];
        
        for (let i = 0; i < 24; i++) {
            const hour = (currentHour + i) % 24;
            const timeOfDay = this.getTimeOfDay(hour);
            const condition = this.getConditionForTime(hour);
            
            hours.push({
                hour: hour.toString().padStart(2, '0') + ':00',
                timeOfDay,
                condition,
                temp: Math.round(25 + Math.random() * 10),
                humidity: Math.round(60 + Math.random() * 30),
                windSpeed: Math.round(5 + Math.random() * 15)
            });
        }
        
        return hours;
    }

    updateHourlyCards(hourlyData) {
        const container = document.getElementById('hourly-container');
        if (!container) return;

        container.innerHTML = '';

        hourlyData.forEach(hour => {
            const card = document.createElement('div');
            card.className = `hourly-card glass-strong rounded-2xl p-4 text-center ${hour.timeOfDay}`;
            card.innerHTML = `
                <div class="text-sm font-semibold mb-3">${hour.hour}</div>
                <div class="text-2xl mb-3">
                    <i class="fas ${hour.condition.icon}"></i>
                </div>
                <div class="text-lg font-bold mb-2">${hour.temp}°</div>
                <div class="text-xs text-white/80 mb-1">${hour.condition.desc}</div>
                <div class="text-xs text-white/70">
                    <i class="fas fa-tint mr-1"></i>${hour.humidity}%
                </div>
                <div class="text-xs text-white/70">
                    <i class="fas fa-wind mr-1"></i>${hour.windSpeed}
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    getTimeOfDay(hour) {
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'evening';
        return 'night';
    }

    getConditionForTime(hour) {
        const timeOfDay = this.getTimeOfDay(hour);
        const random = Math.random();
        
        if (timeOfDay === 'night') {
            return random > 0.7 ? 
                { main: 'Clouds', desc: 'Berawan', icon: 'fa-cloud-moon' } :
                { main: 'Clear', desc: 'Cerah', icon: 'fa-moon' };
        }
        
        if (random > 0.8) {
            return { main: 'Rain', desc: 'Hujan', icon: 'fa-cloud-rain' };
        }
        
        if (random > 0.5) {
            return { main: 'Clouds', desc: 'Berawan', icon: 'fa-cloud-sun' };
        }
        
        return { main: 'Clear', desc: 'Cerah', icon: 'fa-sun' };
    }

    generateAIRecommendations() {
        const recommendations = this.getWeatherBasedRecommendations();
        this.updateAIRecommendations(recommendations);
    }

    getWeatherBasedRecommendations() {
        if (!this.currentWeather) return this.getDefaultRecommendations();

        const temp = this.currentWeather.main.temp;
        const weather = this.currentWeather.weather[0].main;
        const humidity = this.currentWeather.main.humidity;
        const windSpeed = this.currentWeather.wind.speed;

        const recommendations = [];

        // Temperature-based recommendations
        if (temp > 30) {
            recommendations.push({
                icon: 'fa-temperature-high',
                title: 'Cuaca Panas',
                description: 'Hindari aktivitas outdoor di siang hari. Gunakan sunscreen SPF 30+ dan minum air putih minimal 2 liter.',
                color: 'from-red-500 to-orange-500'
            });
        } else if (temp < 20) {
            recommendations.push({
                icon: 'fa-temperature-low',
                title: 'Cuaca Dingin',
                description: 'Gunakan pakaian hangat berlapis. Minum minuman hangat untuk menjaga suhu tubuh.',
                color: 'from-blue-500 to-cyan-500'
            });
        }

        // Weather-based recommendations
        if (weather === 'Rain' || weather === 'Drizzle') {
            recommendations.push({
                icon: 'fa-umbrella',
                title: 'Hujan Terprediksi',
                description: 'Bawa payung atau jas hujan. Waktu tempuh perjalanan bisa 2x lebih lama.',
                color: 'from-blue-600 to-indigo-600'
            });
        }

        if (weather === 'Clear' && temp > 25) {
            recommendations.push({
                icon: 'fa-sun',
                title: 'Cerah & Ceria',
                description: 'Waktu yang sempurna untuk aktivitas outdoor. Jangan lupa topi dan kacamata hitam.',
                color: 'from-yellow-500 to-orange-500'
            });
        }

        // Wind-based recommendations
        if (windSpeed > 10) {
            recommendations.push({
                icon: 'fa-wind',
                title: 'Angin Kencang',
                description: 'Hati-hati dengan benda-benda yang bisa terbang. Hindari aktivitas di ketinggian.',
                color: 'from-teal-500 to-green-500'
            });
        }

        // Humidity-based recommendations
        if (humidity > 80) {
            recommendations.push({
                icon: 'fa-tint',
                title: 'Kelembaban Tinggi',
                description: 'Udara terasa lebih panas. Pertahankan hidrasi dan gunakan pakaian breathable.',
                color: 'from-cyan-500 to-blue-500'
            });
        }

        // Add default recommendations if needed
        if (recommendations.length < 3) {
            recommendations.push(...this.getDefaultRecommendations().slice(0, 3 - recommendations.length));
        }

        return recommendations.slice(0, 3);
    }

    getDefaultRecommendations() {
        return [
            {
                icon: 'fa-heart',
                title: 'Kesehatan',
                description: 'Periksa kondisi cuaca sebelum berolahraga outdoor untuk menghindari heat stroke.',
                color: 'from-pink-500 to-rose-500'
            },
            {
                icon: 'fa-car',
                title: 'Perjalanan',
                description: 'Rencanakan perjalanan dengan memperhatikan kondisi lalu lintas dan cuaca.',
                color: 'from-purple-500 to-indigo-500'
            },
            {
                icon: 'fa-home',
                title: 'Di Rumah',
                description: 'Sempurna untuk membaca buku atau menonton film dengan secangkir kopi.',
                color: 'from-amber-500 to-yellow-500'
            }
        ];
    }

    updateAIRecommendations(recommendations) {
        const container = document.getElementById('ai-recommendations');
        if (!container) return;

        container.innerHTML = '';

        recommendations.forEach((rec, index) => {
            const card = document.createElement('div');
            card.className = 'ai-recommendation-card rounded-2xl p-6';
            card.setAttribute('data-aos', 'fade-up');
            card.setAttribute('data-aos-delay', (index * 100).toString());
            
            card.innerHTML = `
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br ${rec.color} rounded-xl flex items-center justify-center mr-4">
                        <i class="fas ${rec.icon} text-white text-xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold">${rec.title}</h3>
                </div>
                <p class="text-white/80 text-sm leading-relaxed">${rec.description}</p>
            `;
            
            container.appendChild(card);
        });
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const dateStr = now.toLocaleDateString('id-ID', options);
        const datetimeElement = document.getElementById('current-datetime');
        if (datetimeElement) {
            datetimeElement.textContent = dateStr;
        }
        
        // Update last update time
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            const minutesAgo = Math.floor(Math.random() * 10) + 1;
            lastUpdateElement.textContent = `Updated ${minutesAgo} min ago`;
        }
    }

    getDateFromDayIndex(index) {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }

    getWeatherIcon(weatherMain) {
        const iconMap = {
            'Clear': 'fas fa-sun text-yellow-400',
            'Clouds': 'fas fa-cloud text-gray-300',
            'Rain': 'fas fa-cloud-rain text-blue-400',
            'Drizzle': 'fas fa-cloud-rain text-blue-300',
            'Thunderstorm': 'fas fa-bolt text-purple-400',
            'Snow': 'fas fa-snowflake text-white',
            'Mist': 'fas fa-smog text-gray-400',
            'Smoke': 'fas fa-smog text-gray-500',
            'Haze': 'fas fa-smog text-yellow-200',
            'Dust': 'fas fa-smog text-yellow-600',
            'Fog': 'fas fa-smog text-gray-300',
            'Sand': 'fas fa-smog text-yellow-700',
            'Ash': 'fas fa-smog text-gray-600',
            'Squall': 'fas fa-wind text-blue-300',
            'Tornado': 'fas fa-tornado text-gray-700'
        };

        return iconMap[weatherMain] || 'fas fa-cloud text-gray-300';
    }

    showDefaultWeather() {
        const defaultData = {
            name: 'Jakarta',
            sys: { country: 'ID', sunrise: Date.now() / 1000 - 3600 * 6, sunset: Date.now() / 1000 + 3600 * 6 },
            main: { temp: 28, feels_like: 30, humidity: 75, pressure: 1013 },
            weather: [{ main: 'Clouds', description: 'Berawan' }],
            wind: { speed: 3.5 },
            clouds: { all: 40 },
            visibility: 10000
        };

        this.updateMainDashboard(defaultData);
        this.currentWeather = defaultData;
    }

    hideLoadingSkeleton() {
        const loadingElement = document.getElementById('loading-skeleton');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }
}

// Global functions for HTML onclick handlers
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('dark-mode-icon');
    if (icon) {
        icon.className = document.documentElement.classList.contains('dark') ? 
            'fas fa-sun text-white' : 'fas fa-moon text-white';
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
        menu.classList.toggle('mobile-menu-enter');
    }
}

function searchCity() {
    const input = document.getElementById('city-search');
    if (input && input.value.trim()) {
        window.weatherPro.getWeatherByCity(input.value.trim());
        input.value = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherPro = new WeatherPro();
});

// Handle Enter key in search input
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('city-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCity();
            }
        });
    }
});
