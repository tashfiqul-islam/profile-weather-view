const fs = require("fs");
const path = require("path");

// Function to update the README file with new weather data
function updateReadme(weatherData) {
  const readmePath = path.join(__dirname, "..", "README.md");
  let readmeContent = fs.readFileSync(readmePath, "utf8");

  const [description, temperature, sunrise, sunset, humidity, icon] =
    weatherData.split("|");

  // Construction of the updated weather data section
  const updatedWeatherData = `
<!-- Hourly Weather Update -->
        <td><b>${description}</b><img width="15" src="http://openweathermap.org/img/w/${icon}.png"></td>
        <td><b>${temperature}</b></td>
        <td><b>${sunrise} AM</b></td>
        <td><b>${sunset} PM</b></td>
        <td><b>${humidity}%</b></td>
<!-- End of Hourly Weather Update -->
`;

  // Existing weather data section replacement in the README
  readmeContent = readmeContent.replace(
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/,
    updatedWeatherData,
  );
  fs.writeFileSync(readmePath, readmeContent);
}

// updateReadme function with command line arguments
const weatherData = process.argv[2];
if (weatherData) {
  updateReadme(weatherData);
} else {
  console.error("No weather data provided");
}
