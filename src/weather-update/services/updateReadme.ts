import { join } from 'node:path';

/**
 * ✅ Updates the README file with new weather data.
 * @param weatherData The formatted weather data string
 * @param customReadmePath Optional path to a README file in a different location
 */
export async function updateReadme(
  weatherData: string,
  customReadmePath?: string,
): Promise<boolean> {
  const readmePath = customReadmePath ?? join(process.cwd(), 'README.md');
  const readmeFile = Bun.file(readmePath);

  if (!(await readmeFile.exists())) {
    console.error(`❌ Error: README.md file not found at path: ${readmePath}`);

    return false;
  }

  const weatherSegments = weatherData.split('|');
  if (weatherSegments.length !== 6) {
    console.error(
      '❌ Error: Invalid weather data format. Expected 6 segments.',
    );

    return false;
  }

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherSegments;

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long',
    second: '2-digit',
    timeZone: 'Asia/Dhaka',
    weekday: 'long',
    year: 'numeric',
  }).format(new Date());

  const lastRefreshTime = `${formattedTime} (UTC+6)`;

  // Updated weather section to *exactly* match the README format
  const updatedWeatherData = `<!-- Hourly Weather Update -->
        <td align="center">${description} <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt=""></td>
        <td align="center">${temperature}°C</td>
        <td align="center">${sunrise}</td>
        <td align="center">${sunset}</td>
        <td align="center">${humidity}%</td>
        <!-- End of Hourly Weather Update -->`;

  const readmeContent = await readmeFile.text();
  const oldContent = readmeContent;

  const weatherSectionRegex =
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;

  if (!weatherSectionRegex.test(readmeContent)) {
    console.warn(
      '⚠️ Warning: Weather section not found in README. Skipping update.',
    );

    return false;
  }

  const updatedContent = readmeContent.replace(
    weatherSectionRegex,
    updatedWeatherData,
  );

  // Update the last refresh time separately
  const updatedWithRefreshTime = updatedContent.replace(
    /<em>Last refresh:.*?<\/em>/,
    `<em>Last refresh: ${lastRefreshTime}</em>`,
  );

  // Check if there are actually any changes to make
  if (updatedWithRefreshTime === oldContent) {
    console.warn('ℹ️ No changes needed to README.');

    return false;
  }

  try {
    // Use Bun's write API
    await Bun.write(readmePath, updatedWithRefreshTime);
    console.warn(`✅ README updated successfully at: ${readmePath}`);

    return true;
  } catch (error) {
    console.error('❌ Error writing to README file:', error);

    return false;
  }
}
