import { updateReadme } from '@/weather-update/services/updateReadme';
import { fetchWeatherData } from '@/weather-update/services/fetchWeather';
import { ensureEnvironmentVariables } from '@/weather-update/utils/preload';

/**
 * Main function to fetch weather data and update the README.
 */
export async function main(): Promise<void> {
  try {
    // Ensure required environment variables are present
    ensureEnvironmentVariables();

    console.warn('🌍 Starting weather update process...');

    // Fetch current weather data
    const weatherData = await fetchWeatherData();
    console.warn('✅ Weather data fetched successfully:', weatherData);

    // Update the README with the new weather data
    const updateSuccess = await updateReadme(weatherData);
    if (updateSuccess) {
      console.warn('✅ README updated successfully with new weather data.');
    } else {
      console.warn('⚠️ No changes were made to the README.');
    }

    console.warn('🎉 Weather update process completed successfully.');
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Log specific error messages for known errors
      if (error.message.includes('fetchWeatherData')) {
        console.error('❌ Error during weather data fetch:', error.message);
      } else if (error.message.includes('updateReadme')) {
        console.error('❌ Error during README update:', error.message);
      } else if (error.message.includes('Missing environment variable')) {
        console.error(
          '❌ Error during environment variable validation:',
          error.message,
        );
      } else {
        // Log unhandled errors with a specific message
        console.error('❌ Unhandled error in main function:', error.message);
      }
    } else {
      // Log unknown errors
      console.error('❌ Unhandled error in main function:', error);
    }
    process.exit(1); // Ensure process.exit(1) is called on error
  }
}

// Execute the main function
void main();
