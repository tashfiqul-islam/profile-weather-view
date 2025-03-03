import dotenv from 'dotenv';
import path from 'node:path';

const environmentPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: environmentPath });

/**
 * Ensures all required environment variables are set.
 * Throws an error if any required variable is missing.
 */
export function ensureEnvironmentVariables(): void {
  if (
    !process.env.OPEN_WEATHER_KEY ||
    process.env.OPEN_WEATHER_KEY.trim() === ''
  ) {
    console.error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
    throw new Error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  console.warn('[preload.ts] ✅ Environment variables loaded successfully');
}

// Run the function immediately
ensureEnvironmentVariables();
