const fs = require('fs');
const path = require('path');

/**
 * Updates the README file with the new weather data.
 * @param {string} weatherData - Weather data string in the format: description|temperature|sunrise|sunset|humidity|icon.
 */
function updateReadme(weatherData) {
  const readmePath = path.join(__dirname, '..', 'README.md');
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherData.split('|');

  // Construct updated weather data section for README
  const updatedWeatherData = `
<!-- Hourly Weather Update -->
        <td><b>${description}</b><img width="15" src="http://openweathermap.org/img/w/${icon}.png"></td>
        <td><b>${temperature}</b></td>
        <td><b>${sunrise} AM</b></td>
        <td><b>${sunset} PM</b></td>
        <td><b>${humidity}%</b></td>
<!-- End of Hourly Weather Update -->
`;

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
