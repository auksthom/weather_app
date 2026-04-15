const places = [
  { name: "Swinley Forest", type: "Bike Park", lat: 51.3944, lon: -0.7637 },
  { name: "BikePark Wales", type: "Bike Park", lat: 51.7489, lon: -3.3757 },
  { name: "Dyfi Bike Park", type: "Bike Park", lat: 52.5758, lon: -3.9382 },
  { name: "Foel Gasnach", type: "Bike Park", lat: 52.9017, lon: -3.9459 },
  { name: "London", type: "City", lat: 51.5072, lon: -0.1276 },
  { name: "Manchester", type: "City", lat: 53.4808, lon: -2.2426 },
  { name: "Bristol", type: "City", lat: 51.4545, lon: -2.5879 },
];

const locationSelect = document.querySelector("#locationSelect");
const refreshBtn = document.querySelector("#refreshBtn");
const statusEl = document.querySelector("#status");
const weatherCard = document.querySelector("#weatherCard");

const placeNameEl = document.querySelector("#placeName");
const updatedAtEl = document.querySelector("#updatedAt");
const temperatureEl = document.querySelector("#temperature");
const windEl = document.querySelector("#wind");
const rainNowEl = document.querySelector("#rainNow");
const humidityEl = document.querySelector("#humidity");
const moistureEl = document.querySelector("#moisture");
const rainingBeforeEl = document.querySelector("#rainingBefore");

const apiUrl = ({ lat, lon }) =>
  [
    "https://api.open-meteo.com/v1/forecast",
    `?latitude=${lat}`,
    `&longitude=${lon}`,
    "&timezone=auto",
    "&forecast_days=1",
    "&current=temperature_2m,wind_speed_10m,relative_humidity_2m,rain",
    "&hourly=rain",
  ].join("");

const classifyMoisture = ({ humidity, rainNow, rainPrev3h }) => {
  const wetScore = humidity + rainNow * 25 + rainPrev3h * 8;

  if (wetScore >= 105) return { label: "Very wet / muddy", className: "m-bad" };
  if (wetScore >= 80) return { label: "Damp and slippery", className: "m-warn" };
  if (wetScore >= 55) return { label: "Mixed grip", className: "m-warn" };
  return { label: "Dry / good grip", className: "m-good" };
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.className = `status ${isError ? "m-bad" : ""}`.trim();
};

const populatePlaces = () => {
  places.forEach((place, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = `${place.name} (${place.type})`;
    locationSelect.append(option);
  });
};

const getRecentRainSummary = (times, rainSeries, currentTimeIso) => {
  const currentDate = new Date(currentTimeIso);
  const rainInLast3h = times.reduce((sum, timeIso, idx) => {
    const hourDiff = (currentDate - new Date(timeIso)) / (1000 * 60 * 60);
    if (hourDiff >= 1 && hourDiff <= 3) {
      return sum + (rainSeries[idx] || 0);
    }
    return sum;
  }, 0);

  if (rainInLast3h > 0.2) {
    return `Yes — ${rainInLast3h.toFixed(1)} mm in the last 3 hours`;
  }
  return "No significant rain in the last 3 hours";
};

const loadWeather = async () => {
  const selectedPlace = places[Number(locationSelect.value)] || places[0];
  setStatus(`Loading weather for ${selectedPlace.name}...`);

  try {
    const response = await fetch(apiUrl(selectedPlace));
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;
    const hourly = data.hourly;

    const rainPrev3h = hourly.time.reduce((sum, t, idx) => {
      const diff = (new Date(current.time) - new Date(t)) / (1000 * 60 * 60);
      if (diff >= 1 && diff <= 3) {
        return sum + (hourly.rain[idx] || 0);
      }
      return sum;
    }, 0);

    const moisture = classifyMoisture({
      humidity: current.relative_humidity_2m,
      rainNow: current.rain,
      rainPrev3h,
    });

    placeNameEl.textContent = `${selectedPlace.name} • ${selectedPlace.type}`;
    updatedAtEl.textContent = `Updated: ${new Date(current.time).toLocaleString()}`;

    temperatureEl.textContent = `${current.temperature_2m.toFixed(1)} °C`;
    windEl.textContent = `${current.wind_speed_10m.toFixed(1)} km/h`;
    rainNowEl.textContent = `${current.rain.toFixed(1)} mm`;
    humidityEl.textContent = `${current.relative_humidity_2m.toFixed(0)} %`;

    moistureEl.textContent = moisture.label;
    moistureEl.className = moisture.className;

    rainingBeforeEl.textContent = getRecentRainSummary(
      hourly.time,
      hourly.rain,
      current.time,
    );

    weatherCard.classList.remove("hidden");
    setStatus("Live weather loaded.");
  } catch (error) {
    setStatus(`Could not load weather data. ${error.message}`, true);
  }
};

populatePlaces();
refreshBtn.addEventListener("click", loadWeather);
locationSelect.addEventListener("change", loadWeather);
loadWeather();
