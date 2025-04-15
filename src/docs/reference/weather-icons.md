<div style="text-align: center;">
  <h1>Weather Icons Gallery</h1>
</div>

<br>

<div style="text-align: center; display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <Badge type="danger" text="OpenWeather Icons"></Badge>
  <Badge type="info" text="Usage Reference"></Badge>
</div>

## Overview

Profile Weather View uses the OpenWeather API's icon set to visually represent current weather conditions. This reference guide showcases all available weather icons and their corresponding condition codes to help you understand what will be displayed for different weather conditions.

## How Icons Are Used

When you fetch weather data, the OpenWeather API returns an icon code (e.g., `01d`, `10n`) that corresponds to the current weather condition and time of day (day/night). Profile Weather View uses this code to display the appropriate icon in your GitHub profile README.

The icons are displayed using the following URL pattern:

```
https://openweathermap.org/img/w/{icon_code}.png
```

Where `{icon_code}` is the code returned by the API.

## Icon Gallery

Here's a complete gallery of available weather icons and their corresponding conditions:

### Clear Sky

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/01d.png" alt="Clear sky day" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 01d<br>
      <strong>Condition:</strong> Clear sky (day)<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/01d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/01n.png" alt="Clear sky night" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 01n<br>
      <strong>Condition:</strong> Clear sky (night)<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/01n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Few Clouds

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/02d.png" alt="Few clouds day" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 02d<br>
      <strong>Condition:</strong> Few clouds (day)<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/02d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/02n.png" alt="Few clouds night" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 02n<br>
      <strong>Condition:</strong> Few clouds (night)<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/02n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Scattered Clouds

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/03d.png" alt="Scattered clouds" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 03d<br>
      <strong>Condition:</strong> Scattered clouds<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/03d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/03n.png" alt="Scattered clouds" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 03n<br>
      <strong>Condition:</strong> Scattered clouds<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/03n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Broken Clouds

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/04d.png" alt="Broken clouds" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 04d<br>
      <strong>Condition:</strong> Broken clouds<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/04d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/04n.png" alt="Broken clouds" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 04n<br>
      <strong>Condition:</strong> Broken clouds<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/04n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Shower Rain

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/09d.png" alt="Shower rain" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 09d<br>
      <strong>Condition:</strong> Shower rain<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/09d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/09n.png" alt="Shower rain" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 09n<br>
      <strong>Condition:</strong> Shower rain<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/09n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Rain

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/10d.png" alt="Rain day" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 10d<br>
      <strong>Condition:</strong> Rain (day)<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/10d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/10n.png" alt="Rain night" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 10n<br>
      <strong>Condition:</strong> Rain (night)<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/10n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Thunderstorm

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/11d.png" alt="Thunderstorm" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 11d<br>
      <strong>Condition:</strong> Thunderstorm<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/11d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/11n.png" alt="Thunderstorm" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 11n<br>
      <strong>Condition:</strong> Thunderstorm<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/11n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Snow

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/13d.png" alt="Snow" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 13d<br>
      <strong>Condition:</strong> Snow<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/13d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/13n.png" alt="Snow" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 13n<br>
      <strong>Condition:</strong> Snow<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/13n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

### Mist

<div class="icon-row">
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/50d.png" alt="Mist" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 50d<br>
      <strong>Condition:</strong> Mist<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/50d.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
  <div class="icon-card">
    <img src="https://openweathermap.org/img/w/50n.png" alt="Mist" style="width: 50px;">
    <div class="icon-details">
      <strong>Code:</strong> 50n<br>
      <strong>Condition:</strong> Mist<br>
      <strong>Usage:</strong> <code>&lt;img src="https://openweathermap.org/img/w/50n.png" style="width: 15px;" alt=""&gt;</code>
    </div>
  </div>
</div>

## Using Custom Icons

If you prefer not to use OpenWeather's default icons, you have several alternatives:

### 1. Weather Emoji

You can replace the OpenWeather icons with emoji for a more consistent look across platforms:

| Weather Condition | Emoji | Example Usage                                              |
| ----------------- | ----- | ---------------------------------------------------------- |
| Clear sky (day)   | ☀️    | `<td style="text-align: center;">Clear ☀️</td>`            |
| Clear sky (night) | 🌙    | `<td style="text-align: center;">Clear 🌙</td>`            |
| Few clouds        | 🌤️    | `<td style="text-align: center;">Few clouds 🌤️</td>`       |
| Scattered clouds  | ⛅    | `<td style="text-align: center;">Scattered clouds ⛅</td>` |
| Broken clouds     | 🌥️    | `<td style="text-align: center;">Broken clouds 🌥️</td>`    |
| Shower rain       | 🌦️    | `<td style="text-align: center;">Shower rain 🌦️</td>`      |
| Rain              | 🌧️    | `<td style="text-align: center;">Rain 🌧️</td>`             |
| Thunderstorm      | ⛈️    | `<td style="text-align: center;">Thunderstorm ⛈️</td>`     |
| Snow              | ❄️    | `<td style="text-align: center;">Snow ❄️</td>`             |
| Mist              | 🌫️    | `<td style="text-align: center;">Mist 🌫️</td>`             |

### 2. Weather Icons Font

You can integrate [Weather Icons](https://erikflowers.github.io/weather-icons/) which provides a comprehensive set of weather icons:

```html
<!-- Add the CSS in your README if supported -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.10/css/weather-icons.min.css"
/>

<!-- Example usage -->
<td style="text-align: center;">Clear <i class="wi wi-day-sunny"></i></td>
```

### 3. Custom SVG Icons

For advanced customization, you could create your own SVG icons and include them directly:

```html
<td style="text-align: center;">
  Rain
  <svg
    style="width: 20px; height: 20px;"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 15L8 19M12 14L14 18M6 13L4 17"
      stroke="#3B82F6"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path d="M3 10H17C17 6.5 14.5 4 11 4C7.5 4 5 6.5 5 10H3Z" fill="#9CA3AF" />
  </svg>
</td>
```

## Icon Mapping to Weather Codes

If you need to programmatically determine which icon to display based on OpenWeather's internal condition codes, here's a reference table:

| Weather ID | Description                  | Icon Code |
| ---------- | ---------------------------- | --------- |
| 200-232    | Thunderstorm                 | 11d/11n   |
| 300-321    | Drizzle                      | 09d/09n   |
| 500-504    | Rain                         | 10d/10n   |
| 511        | Freezing rain                | 13d/13n   |
| 520-531    | Shower rain                  | 09d/09n   |
| 600-622    | Snow                         | 13d/13n   |
| 701-781    | Atmosphere (mist, fog, etc.) | 50d/50n   |
| 800        | Clear sky                    | 01d/01n   |
| 801        | Few clouds                   | 02d/02n   |
| 802        | Scattered clouds             | 03d/03n   |
| 803-804    | Broken/Overcast clouds       | 04d/04n   |

## Custom Styling Tips

To further enhance the appearance of your weather icons:

1. **Add shadow effects**:

   ```html
   <img
     src="https://openweathermap.org/img/w/01d.png"
     style="width: 25px; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));"
     alt=""
   />
   ```

2. **Make icons larger**:

   ```html
   <img
     src="https://openweathermap.org/img/w/01d.png"
     style="width: 40px;"
     alt=""
   />
   ```

3. **Add a decorative background**:
   ```html
   <span
     style="display: inline-block; background-color: #f0f8ff; border-radius: 50%; padding: 5px;"
   >
     <img
       src="https://openweathermap.org/img/w/01d.png"
       style="width: 25px;"
       alt=""
     />
   </span>
   ```

<style>
.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 30px;
}

.icon-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  min-width: 300px;
}

.icon-details {
  font-size: 0.9rem;
}
</style>

---

<div style="text-align: center;">
  <p>
    <strong>Profile Weather View</strong> | Weather Icons Gallery
  </p>
  <p>
    <small>Icons provided by <a href="https://openweathermap.org/api" target="_blank">OpenWeather API</a></small>
  </p>
</div>
