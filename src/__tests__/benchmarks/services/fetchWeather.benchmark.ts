import { bench, describe } from 'vitest';

import { fetchWeatherData } from '@/weather-update/services/fetchWeather';

// Benchmark performance of fetching weather data
describe('Weather API Performance', () => {
  bench(
    'Fetch weather data',
    async () => {
      await fetchWeatherData();
    },
    { time: 1000 },
  ); // Runs for 1 second to collect performance data
});
