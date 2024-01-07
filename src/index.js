// eslint-disable-next-line node/no-unpublished-require
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Open Weather API Key and location data
const API_KEY = process.env.OPENWEATHER_API_KEY;
const LAT = '23.8759'; // Latitude for Uttara
const LON = '90.3795'; // Longitude for Uttara

// Function to convert to Dhaka timezone
function convertToAstanaDhakaTime(utcDate) {
  const astanaDhakaTimezone = 'Asia/Dhaka'; // Timezone for Astana/Dhaka
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: astanaDhakaTimezone,
  };
  return new Intl.DateTimeFormat('en-US', timeOptions).format(utcDate);
}

// Asynchronous function to fetch and log weather data
async function fetchWeatherData() {
  try {
    // API request URL construction
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`;

    // GET request to fetch data from OpenWeatherMap API
    const response = await axios.get(url);
    const currentWeather = response.data.current;

    // Temperature round up to the nearest integer
    const roundedTemperature = Math.round(currentWeather.temp);

    // Unix timestamp conversion to human-readable time
    const sunriseUtc = new Date(currentWeather.sunrise * 1000);
    const sunsetUtc = new Date(currentWeather.sunset * 1000);

    const sunrise = convertToAstanaDhakaTime(sunriseUtc);
    const sunset = convertToAstanaDhakaTime(sunsetUtc);

    // Extract the icon code
    const iconCode = currentWeather.weather[0].icon;

    // Weather detail logs
    console.log(
      `${currentWeather.weather[0].main}|${roundedTemperature}|${sunrise}|${sunset}|${currentWeather.humidity}|${iconCode}`
    );
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

fetchWeatherData();
