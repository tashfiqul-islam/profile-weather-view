const fs = require('node:fs');
const path = require('node:path');

/**
 * Updates the README file with the new weather data.
 * @param {string} weatherData - Weather data string in the format: description|temperature|sunrise|sunset|humidity|icon.
 */
function updateReadme(weatherData) {
  const readmePath = path.join(
    __dirname,
    '..',
    '..',
    'tashfiqul-islam',
    'README.md',
  );

  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherData.split('|');

  // Get current time in UTC+6
  const currentTime = new Date();
  currentTime.setHours(currentTime.getHours());

  // Custom formatting for the date and time
  const options = {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'long',
    second: '2-digit',
    weekday: 'long',
    year: 'numeric',
  };

  const lastRefreshTime = `${currentTime.toLocaleString('en-US', options)} UTC`;

  // Construct updated weather data section for gh-profile README.md
  const updatedWeatherData = `<!-- Hourly Weather Update -->
  <td align="center">${description} <img width="15" src="http://openweathermap.org/img/w/${icon}.png"></td>
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

  // Replace existing weather data section in README
  readmeContent = readmeContent.replace(
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Dhaka's weather table -->/,
    updatedWeatherData,
  );

  fs.writeFileSync(readmePath, readmeContent);
}

// Run updateReadme function with command line arguments
const weatherData = process.argv[2];
if (weatherData) {
  updateReadme(weatherData);
} else {
  console.error('No weather data provided');
}

// Exporting the function
module.exports = {
  updateReadme,
};
