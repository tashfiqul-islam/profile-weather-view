const fs = require('fs');
const path = require('path');

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
    'README.md'
  );

  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherData.split('|');

  // Construct updated weather data section for gh-profile README.md
  const updatedWeatherData = `<!-- Hourly Weather Update -->
  <td align="center">${description} <img width="15" src="http://openweathermap.org/img/w/${icon}.png"></td>
  <td align="center">${temperature}°C</td>
  <td align="center">${sunrise}</td>
  <td align="center">${sunset}</td>
  <td align="center">${humidity}%</td>
  <!-- End of Hourly Weather Update -->
</tr>`;

  // Replace existing weather data section in README
  readmeContent = readmeContent.replace(
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/,
    updatedWeatherData
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
