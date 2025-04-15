import { bench, describe } from 'vitest';

import type { WeatherData } from '@/weather-update/services/fetchWeather';

import { updateReadme } from '@/weather-update/services/updateReadme';

// Benchmark performance of updating the README file
const mockWeatherData: WeatherData = {
  current: {
    humidity: 60,
    sunrise: 1710000000,
    sunset: 1710050000,
    temp: 25,
    weather: [{ icon: '01d', main: 'Sunny' }],
  },
};

describe('Update README Performance', () => {
  bench(
    'Update GitHub profile README',
    async () => {
      await updateReadme(JSON.stringify(mockWeatherData));
    },
    { time: 1000 },
  ); // Runs for 1 second to track execution speed
});
