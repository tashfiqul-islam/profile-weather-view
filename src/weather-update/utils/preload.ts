export function ensureEnvironmentVariables(): void {
  const apiKey = Bun.env['OPEN_WEATHER_KEY']?.trim();

  if (!apiKey) {
    console.error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
    throw new Error(
      '[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY',
    );
  }

  console.warn('[preload.ts] ✅ Environment variables loaded successfully');
}
