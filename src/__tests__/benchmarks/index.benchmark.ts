import { bench, describe } from 'vitest';

import { main } from '@/weather-update';

// Benchmark performance of the entire weather update process
describe('Full Weather Update Process Performance', () => {
  bench(
    'Process and update weather data',
    async () => {
      await main();
    },
    { time: 1000 }, // Runs for 1 second to track execution speed
  );
});
