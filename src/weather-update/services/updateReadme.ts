import { join } from 'node:path';

/**
 * Helper function to extract content from a regex match with null safety
 * @param content The content to search in
 * @param regex The regex pattern to search with
 * @returns The matched content or empty string
 */
export function getSectionContent(content: string, regex: RegExp): string {
  return regex.exec(content)?.[0] ?? '';
}

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
  console.warn(`📝 Using README path: ${readmePath}`);

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

  // Read the file content to analyze the current format
  const readmeContent = await readmeFile.text();
  console.warn(`📄 README file size: ${readmeContent.length} bytes`);

  // Check if the weather section exists
  const weatherSectionRegex =
    /<!-- Hourly Weather Update -->[\s\S]*?<!-- End of Hourly Weather Update -->/;

  if (!weatherSectionRegex.test(readmeContent)) {
    console.error(
      '❌ Error: Weather section not found in README. Searched for: <!-- Hourly Weather Update -->',
    );

    return false;
  }

  // Extract the current weather section to analyze its format
  const currentSection = getSectionContent(readmeContent, weatherSectionRegex);
  console.warn(
    `🔍 Current weather section structure:\n${currentSection.slice(0, 150)}...`,
  );

  // Create an updated weather section that matches the existing format,
  // supporting multiple potential formats with more flexible structure
  let updatedWeatherData = '';

  // Check if the current format uses table cells (td)
  if (currentSection.includes('<td')) {
    updatedWeatherData = `<!-- Hourly Weather Update -->
        <td align="center">${description} <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt=""></td>
        <td align="center">${temperature}°C</td>
        <td align="center">${sunrise}</td>
        <td align="center">${sunset}</td>
        <td align="center">${humidity}%</td>
        <!-- End of Hourly Weather Update -->`;
  }
  // Check if it's using a div-based format
  else if (currentSection.includes('<div')) {
    updatedWeatherData = `<!-- Hourly Weather Update -->
<div style="text-align: center;">
  <img src="https://openweathermap.org/img/wn/${icon}@2x.png" style="width: 100px;" alt="${description}">
  <h3>${temperature}°C | ${description}</h3>
  <p>Sunrise: ${sunrise} | Sunset: ${sunset} | Humidity: ${humidity}%</p>
</div>
<!-- End of Hourly Weather Update -->`;
  }
  // Default fallback format
  else {
    updatedWeatherData = `<!-- Hourly Weather Update -->
${description} <img width="15" src="https://openweathermap.org/img/w/${icon}.png" alt="">
${temperature}°C
Sunrise: ${sunrise}
Sunset: ${sunset}
Humidity: ${humidity}%
<!-- End of Hourly Weather Update -->`;
  }

  console.warn(
    `📝 Generated new weather section: ${updatedWeatherData.slice(0, 100)}...`,
  );

  // Update the content
  const oldContent = readmeContent;
  const updatedContent = readmeContent.replace(
    weatherSectionRegex,
    updatedWeatherData,
  );

  // Update the last refresh time separately if it exists
  let updatedWithRefreshTime = updatedContent;
  const refreshTimeRegex = /<em>Last refresh:.*?<\/em>/;

  if (refreshTimeRegex.test(updatedContent)) {
    updatedWithRefreshTime = updatedContent.replace(
      refreshTimeRegex,
      `<em>Last refresh: ${lastRefreshTime}</em>`,
    );
    console.warn('✅ Last refresh time updated');
  } else {
    console.warn('⚠️ Last refresh time section not found in README');
  }

  // Check if there are actually any changes to make
  if (updatedWithRefreshTime === oldContent) {
    const isForceUpdate = process.env['FORCE_UPDATE'] === 'true';

    if (isForceUpdate) {
      console.warn(
        '⚠️ No changes detected, but forcing update due to FORCE_UPDATE flag',
      );
      // Continue with the update anyway
    } else {
      console.warn('ℹ️ No changes needed to README.');

      return false;
    }
  }

  try {
    // Use Bun's write API
    await Bun.write(readmePath, updatedWithRefreshTime);
    console.warn(`✅ README updated successfully at: ${readmePath}`);

    // For GitHub Actions, report that changes were detected
    if (process.env['GITHUB_ACTIONS'] === 'true') {
      console.warn('CHANGES_DETECTED=true');
    }

    return true;
  } catch (error) {
    console.error('❌ Error writing to README file:', error);

    return false;
  }
}
