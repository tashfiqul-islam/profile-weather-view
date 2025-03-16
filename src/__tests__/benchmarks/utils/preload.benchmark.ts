import { bench, describe } from 'vitest';

import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';

// Benchmark performance of environment variable validation
describe('Preload Utility Performance', () => {
  bench(
    'Ensure environment variables are loaded',
    () => {
      ensureEnvironmentVariables();
    },
    { time: 1000 },
  ); // Runs for 1 second to measure execution speed
});
