<!-- Banner Section -->
<p align="center">
  <img src="https://user-images.githubusercontent.com/12345678/your-logo.png" width="120" alt="Project Logo">
</p>

<h1 align="center">🌦️ Profile Weather View</h1>
<p align="center">
  <strong>Real-time weather updates on your GitHub profile README — fully automated.</strong>
</p>
<p align="center">
  <a href="https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/update-readme.yml">
    <img src="https://github.com/tashfiqul-islam/profile-weather-view/actions/workflows/update-readme.yml/badge.svg" alt="Readme Weather Update">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="https://github.com/tashfiqul-islam">
    <img src="https://img.shields.io/github/followers/tashfiqul-islam?style=social" alt="GitHub Followers">
  </a>
</p>

---

## **📌 Overview**
💡 **Profile Weather View** automatically fetches and updates your GitHub profile with live weather data using **Bun**, **OpenWeather API**, and **GitHub Actions**.  
💡 This ensures your **README stays dynamic** with the latest weather details — completely hands-free.

---

## **🏰 Features**
✅ **Real-time Weather Updates** — Fetches and displays live weather every 8 hours  
✅ **Automated GitHub Profile Updates** — Uses GitHub Actions to modify your README  
✅ **Lightning-Fast Performance** — Powered by **Bun** instead of Node.js  
✅ **Pre-commit Hooks (Husky)** — Enforces linting, formatting, type checking, and tests  
✅ **Effortless CI/CD Integration** — Works seamlessly with GitHub Workflows

---

## **⚡ Quick Start**
Get up and running in just a few steps:

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/tashfiqul-islam/profile-weather-view.git
cd profile-weather-view
```

### **2️⃣ Install Dependencies (Bun)**
```sh
bun install
```

### **3️⃣ Configure Environment Variables**
Create a `.env` file in the root directory:
```sh
OPEN_WEATHER_KEY=your_openweather_api_key
```

### **4️⃣ Run the Application Locally**
```sh
bun run src/index.ts
```
This will fetch and display the latest weather details.

### **5️⃣ Manually Update Your README**
```sh
bun run src/updateReadme.ts
```
This updates your GitHub profile README with the latest weather data.

---

## **🔄 Automated Updates with GitHub Actions**
This project uses **GitHub Actions** to update your README every **8 hours**.

### **GitHub Workflow Setup**
The following **workflow is already configured** and runs automatically:
```yaml
on:
  schedule:
    - cron: '0 */8 * * *' # Runs every 8 hours
  workflow_dispatch: # Allows manual execution

jobs:
  update-readme-weather:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install Dependencies
        run: bun install --frozen-lockfile

      - name: Fetch Weather Data
        run: |
          WEATHER_DATA=$(bun run src/index.ts)
          echo "WEATHER_DATA=$WEATHER_DATA" >> $GITHUB_ENV

      - name: Update README
        run: bun run src/updateReadme.ts "${{ env.WEATHER_DATA }}"

      - name: Commit & Push Changes
        run: |
          git add README.md
          git commit -m "chore(weather): update profile weather"
          git push origin master
```
✅ **No manual effort required.** Your README stays updated **automatically**.

---

## **💻 Tech Stack**
<p align="center">
  <img src="https://img.shields.io/badge/Bun-1.1.9-black?style=for-the-badge&logo=bun&logoColor=white">
  <img src="https://img.shields.io/badge/TypeScript-5.4-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Vitest-3.0.7-6E5EEF?style=for-the-badge&logo=vitest&logoColor=white">
  <img src="https://img.shields.io/badge/OpenWeather_API-0069C2?style=for-the-badge&logo=openweather&logoColor=white">
</p>

---

## **🔧 Pre-commit Hook (Husky)**
This project enforces strict commit rules using **Husky**. Before every commit, the following checks run **automatically**:
✅ **Prettier (formatting)**  
✅ **ESLint (linting)**  
✅ **TypeScript Type Checking**  
✅ **Vitest (Testing)**

### **Running Pre-commit Hooks Manually**
```sh
bun run format && bun run lint && bun run type-check && bun run test --run
```

---

## **🤝 Contributing**
Want to improve this project? Follow these steps:

1️⃣ **Fork the repository**  
2️⃣ **Create a feature branch:** `git checkout -b feature-name`  
3️⃣ **Commit your changes using Conventional Commits:**
```sh
git commit -m "feat: add new feature"
```
4️⃣ **Push to your branch:** `git push origin feature-name`  
5️⃣ **Open a Pull Request**

💡 **Always ensure pre-commit hooks pass before pushing.**  
💡 Follow the **Conventional Commits** format for a clean commit history.

---

## **📜 License**
This project is licensed under the **MIT License**.  
Feel free to **use, modify, and distribute** as needed.

---

## **📣 Shoutout to the Devs!**
<p align="center">
    <strong>🚀 Created with ❤️ by <a href="https://github.com/tashfiqul-islam">Tashfiq</a></strong>
</p>

<p align="center">
    <a href="https://github.com/tashfiqul-islam" target="_blank">🌟 Follow me on GitHub</a> —
    My future projects will have <em>slightly</em> fewer bugs! 🐛
</p>

