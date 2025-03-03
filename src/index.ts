import { updateReadme } from '@/services/updateReadme';
import { fetchWeatherData } from '@/services/fetchWeather';

await (async () => {
  try {
    const weatherData = await fetchWeatherData();
    updateReadme(weatherData);
  } catch (error) {
    console.error('❌ Failed to update weather data:', error);
  }
})();
