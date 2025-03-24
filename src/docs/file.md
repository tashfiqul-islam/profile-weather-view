---
layout: home
title: Profile Weather View
titleTemplate: Dynamic Weather for GitHub Profiles
description: Enhance your GitHub profile with automated, real-time weather displays powered by TypeScript and Bun

hero:
  name: 'Profile Weather View'
  text: 'Real-time Weather Integration'
  tagline: 'Elevate your GitHub profile with dynamic, automated weather updates'
  image:
    src: '/icons/weather.svg'
    alt: 'Profile Weather View'
    light: '/icons/weather-light.svg'
    dark: '/icons/weather-dark.svg'
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/tashfiqul-islam/profile-weather-view
    - theme: alt
      text: View Examples
      link: /theme-integration
    - theme: alt
      text: Live Demo
      link: /demo

features:
  - icon: 🚀
    title: 'Zero-Touch Automation'
    details: 'Set up once and forget with GitHub Actions workflows. Configurable schedules ensure your profile always displays fresh weather data without manual updates.'

  - icon: 🌦️
    title: 'Enterprise-Grade Data Integration'
    details: 'Powered by OpenWeather API with comprehensive error handling and fallback mechanisms. Support for 200,000+ locations globally in multiple formats with zero downtime.'

  - icon: 🛡️
    title: 'TypeScript-Powered Reliability'
    details: 'Built with TypeScript 5.8 and Zod schema validation for complete type safety from development to runtime. Ensures data integrity at every step of the process.'

  - icon: 🎨
    title: 'Advanced Customization'
    details: 'Multiple display formats with theme-aware designs that adapt to both light and dark GitHub themes. Custom layouts and style options that integrate seamlessly with any profile.'

  - icon: 📊
    title: '100% Test Coverage'
    details: 'Enterprise-level reliability with comprehensive test suites covering unit, integration, and end-to-end scenarios. Vitest-powered, Bun-optimized testing for consistent performance.'

  - icon: ⚡
    title: 'Bun-Optimized Performance'
    details: 'Leverages Bun runtime for near-instant execution and minimal resource consumption. Up to 30x faster than traditional Node.js approaches.'
---

<div class="mt-12 text-center">
  <h2 class="text-3xl font-bold bg-linear-gradient bg-clip-text text-transparent">Built for Developers, by Developers</h2>
  <p class="text-lg mt-6 mx-auto max-w-2xl">
    Profile Weather View transforms your GitHub profile with elegant, real-time weather displays in just minutes.
  </p>
</div>

<div class="mt-20 mb-20 grid grid-cols-1 gap-8">
  <div class="card">
    <h3 class="text-xl font-semibold mb-3">🧰 Modern Tech Stack</h3>
    <p class="mb-4">Powered by Bun, TypeScript 5.8+, and Zod for type-safe, blazing-fast execution.</p>
    <div class="flex flex-wrap gap-2">
      <span class="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium">Bun</span>
      <span class="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium">TypeScript</span>
      <span class="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium">Zod</span>
      <span class="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium">ESM</span>
    </div>
  </div>

  <div class="card">
    <h3 class="text-xl font-semibold mb-3">🔄 Self-Healing Workflows</h3>
    <p class="mb-4">Intelligent retry strategies with exponential backoff ensure your profile stays up to date even during API outages.</p>
    <div class="flex flex-wrap gap-2">
      <span class="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium">GitHub Actions</span>
      <span class="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium">Automated Recovery</span>
      <span class="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-medium">Scheduled Updates</span>
    </div>
  </div>
</div>

<div class="my-16 p-8 rounded-xl bg-radial-gradient bg-opacity-10">
  <div class="text-center mb-8">
    <h2 class="text-2xl font-bold">See It In Action</h2>
    <p class="mt-2">Real-time weather data displayed directly on your GitHub profile</p>
  </div>

  <div class="flex justify-center">
    <div class="rounded-lg overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-w-2xl w-full">
      <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div class="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <div class="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">readme.md</div>
        </div>
      </div>
      <div class="p-4">
        <table class="mx-auto my-4 border-collapse">
          <thead>
            <tr>
              <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Weather</th>
              <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Temperature</th>
              <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Sunrise</th>
              <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Sunset</th>
              <th class="px-4 py-2 border border-gray-300 dark:border-gray-700">Humidity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-center">
                Sunny <img class="inline w-4 h-4" src="https://openweathermap.org/img/w/01d.png" alt="">
              </td>
              <td class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-center">25°C</td>
              <td class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-center">06:18:00</td>
              <td class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-center">18:02:00</td>
              <td class="px-4 py-2 border border-gray-300 dark:border-gray-700 text-center">55%</td>
            </tr>
          </tbody>
        </table>
        <p class="text-center text-xs text-gray-500 dark:text-gray-400">
          <em>Last refresh: Sunday, March 23, 2025 12:00:00 (UTC+6)</em>
        </p>
      </div>
    </div>
  </div>
</div>

<div class="my-16">
  <div class="text-center mb-8">
    <h2 class="text-2xl font-bold">Why Profile Weather View?</h2>
  </div>

  <div class="grid grid-cols-1 gap-6">
    <div class="text-center p-6">
      <div class="text-4xl mb-4">⚙️</div>
      <h3 class="text-lg font-semibold mb-2">Set It and Forget It</h3>
      <p>Configure once and let our GitHub Actions workflow handle the rest, updating your profile automatically.</p>
    </div>

    <div class="text-center p-6">
      <div class="text-4xl mb-4">🎯</div>
      <h3 class="text-lg font-semibold mb-2">Pixel-Perfect Display</h3>
      <p>Multiple themes and layouts that perfectly match your profile's style, with light/dark mode support.</p>
    </div>

    <div class="text-center p-6">
      <div class="text-4xl mb-4">🔒</div>
      <h3 class="text-lg font-semibold mb-2">Enterprise Security</h3>
      <p>Least-privilege execution, secure API handling, and comprehensive error management.</p>
    </div>

  </div>
</div>

<div class="my-20 text-center">
  <a href="/guide/introduction" class="btn btn-3d">
    Get Started →
  </a>
  <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
    Ready in under 5 minutes. No coding required.
  </p>
</div>

<style>
/* Apply custom font */
:root {
  font-family: var(--font-primary, 'Ropa Sans'), sans-serif;
}
</style>
