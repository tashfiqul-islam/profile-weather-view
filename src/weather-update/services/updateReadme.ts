import { join } from 'node:path';

/**
 * ✅ Updates the README file with new weather data.
 */
export async function updateReadme(weatherData: string): Promise<boolean> {
  const readmePath = join(process.cwd(), 'README.md');
  const readmeFile = Bun.file(readmePath);

  if (!(await readmeFile.exists())) {
    console.error('❌ Error: README.md file not found.');

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

  const lastRefreshTime = `${formattedTime} UTC+6`;

  const updatedWeatherData = `<!-- Hourly Weather Update -->
  <td align="center">${description} <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt=""></td>
  <td align="center">${temperature}°C</td>
  <td align="center">${sunrise}</td>
  <td align="center">${sunset}</td>
  <td align="center">${humidity}%</td>
  <!-- End of Hourly Weather Update -->
  </tr>
  </table>
  <div align="center">
    <h6>
      <em>Last refresh: ${lastRefreshTime}</em>
    </h6>
  </div>
  <!-- End of Dhaka's weather table -->`;

  const readmeContent = await readmeFile.text();

  const weatherSectionRegex =
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Dhaka's weather table -->/;

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

  try {
    await Bun.write(readmePath, updatedContent);
    console.warn('✅ README updated successfully.');

    return true;
  } catch (error) {
    console.error('❌ Error writing to README file:', error);

    return false;
  }
}
