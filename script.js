
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const weatherResult = document.getElementById("weatherResult");

searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (!city) {
        weatherResult.innerHTML =
            '<p class="error">Please enter a city name!</p>';
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

function getWeatherInfo(code) {
    if (code === 0) return ["☀️", "Clear sky"];
    if ([1, 2, 3].includes(code)) return ["🌤️", "Cloudy"];
    if ([45, 48].includes(code)) return ["🌫️", "Foggy"];
    if ([51, 53, 55, 56, 57].includes(code)) return ["🌦️", "Drizzle"];
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return ["🌧️", "Rainy"];
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return ["❄️", "Snowy"];
    }
    if ([95, 96, 99].includes(code)) return ["⛈️", "Thunderstorm"];

    return ["🌍", "Weather update"];
}

async function getWeather(city) {
    searchButton.disabled = true;
    searchButton.textContent = "Loading...";

    weatherResult.innerHTML = "<p>Fetching weather data...</p>";

    try {
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Location service unavailable");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            weatherResult.innerHTML =
                '<p class="error">City not found. Try another city.</p>';
            return;
        }

        const location = geoData.results[0];

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + location.latitude +
            "&longitude=" + location.longitude +
            "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Weather service unavailable");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;
        const info = getWeatherInfo(current.weather_code);

        weatherResult.innerHTML = `
            <h2>📍 ${location.name}</h2>
            <p>${location.country || ""}</p>
            <p class="weather-icon">${info[0]}</p>
            <p>${info[1]}</p>
            <p class="temperature">${current.temperature_2m} °C</p>
            <p>💧 Humidity: ${current.relative_humidity_2m}%</p>
            <p>💨 Wind Speed: ${current.wind_speed_10m} km/h</p>
        `;
    } catch (error) {
        weatherResult.innerHTML =
            '<p class="error">Unable to fetch weather. Check your internet connection.</p>';
        console.error(error);
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}
