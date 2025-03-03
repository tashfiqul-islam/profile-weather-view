import fs from 'node:fs';
import path from 'node:path';

/**
 * ✅ Updates the README file with new weather data.
 * @param {string} weatherData - Formatted weather data (e.g., "description|temperature|sunrise|sunset|humidity|icon").
 */
export function updateReadme(weatherData: string): void {
  const readmePath = path.resolve(process.cwd(), 'README.md');

  let readmeContent: string;
  try {
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  } catch (error) {
    console.error('❌ Error reading README file:', error);

    return;
  }

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherData.split('|');

  // Get current UTC+6 time in readable format
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleString('en-US', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long',
    second: '2-digit',
    weekday: 'long',
    year: 'numeric',
  });

  const lastRefreshTime = `${formattedTime} UTC+6`;

  // ✅ Construct new weather section
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

  // ✅ Replace existing weather data section
  readmeContent = readmeContent.replace(
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Dhaka's weather table -->/,
    updatedWeatherData,
  );

  try {
    fs.writeFileSync(readmePath, readmeContent);
    console.warn('✅ README updated successfully.');
  } catch (error) {
    console.error('❌ Error writing to README file:', error);
  }
}
