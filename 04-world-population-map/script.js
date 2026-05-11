const countryCountEl = document.getElementById("countryCount");
const worldPopulationEl = document.getElementById("worldPopulation");
const selectedCountryEl = document.getElementById("selectedCountry");
const detailNameEl = document.getElementById("detailName");
const detailRegionEl = document.getElementById("detailRegion");
const detailPopulationEl = document.getElementById("detailPopulation");
const countrySearchEl = document.getElementById("countrySearch");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const legendItemsEl = document.getElementById("legendItems");
const topCountriesEl = document.getElementById("topCountries");

const COUNTRY_GEOJSON_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const POPULATION_BREAKS = [0, 1000000, 10000000, 50000000, 100000000, 500000000, 1000000000];
const POPULATION_COLORS = ["#e8f7ee", "#bce7cc", "#79c99e", "#35a871", "#f4c430", "#f97316", "#dc2626"];

let map;
let countryLayer;
let countries = [];
let layerByName = new Map();
let activeLayer = null;

function initMap() {
  map = L.map("map", {
    zoomControl: true,
    worldCopyJump: true
  }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 7,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  renderLegend();
  loadCountries();
}

async function loadCountries() {
  setLoadingState();

  try {
    const response = await fetch(COUNTRY_GEOJSON_URL);
    const geojson = await response.json();

    countries = geojson.features
      .map(normalizeCountry)
      .filter((country) => country.population > 0);

    countryLayer = L.geoJSON(geojson, {
      style: getCountryStyle,
      onEachFeature: bindCountryEvents
    }).addTo(map);

    updateSummary();
    renderTopCountries();
  } catch (error) {
    detailNameEl.textContent = "Map data unavailable";
    detailRegionEl.textContent = "Check your internet connection and reload the page.";
    topCountriesEl.innerHTML = '<li class="loading-note">Country data could not be loaded.</li>';
  }
}

function normalizeCountry(feature) {
  const properties = feature.properties || {};

  return {
    feature,
    name: properties.ADMIN || properties.name || properties.NAME || "Unknown country",
    iso: properties.ISO_A3 || properties.ISO3166_1_Alpha_3 || "",
    region: properties.REGION_UN || properties.REGION_WB || properties.CONTINENT || "World",
    population: Number(properties.POP_EST || properties.pop_est || properties.population || 0)
  };
}

function bindCountryEvents(feature, layer) {
  const country = normalizeCountry(feature);
  const key = country.name.toLowerCase();

  layerByName.set(key, layer);

  layer.bindTooltip(
    `<strong>${country.name}</strong><br>${formatPopulation(country.population)}`,
    { className: "country-tooltip", sticky: true }
  );

  layer.on({
    mouseover: () => highlightCountry(layer, country, false),
    mouseout: () => resetCountryStyle(layer),
    click: () => highlightCountry(layer, country, true)
  });
}

function getCountryStyle(feature) {
  const country = normalizeCountry(feature);

  return {
    fillColor: getPopulationColor(country.population),
    weight: 0.7,
    opacity: 1,
    color: "#ffffff",
    fillOpacity: 0.82
  };
}

function highlightCountry(layer, country, keepActive) {
  if (activeLayer && activeLayer !== layer) {
    countryLayer.resetStyle(activeLayer);
  }

  layer.setStyle({
    weight: 2.2,
    color: "#14211f",
    fillOpacity: 0.95
  });

  layer.bringToFront();
  updateDetails(country);

  if (keepActive) {
    activeLayer = layer;
    map.fitBounds(layer.getBounds(), { padding: [24, 24], maxZoom: 5 });
  }
}

function resetCountryStyle(layer) {
  if (activeLayer === layer) {
    return;
  }

  countryLayer.resetStyle(layer);
}

function updateDetails(country) {
  selectedCountryEl.textContent = country.name;
  detailNameEl.textContent = country.name;
  detailRegionEl.textContent = `${country.region}${country.iso ? ` | ${country.iso}` : ""}`;
  detailPopulationEl.textContent = formatPopulation(country.population);
}

function updateSummary() {
  const totalPopulation = countries.reduce((total, country) => total + country.population, 0);

  countryCountEl.textContent = countries.length.toLocaleString();
  worldPopulationEl.textContent = formatPopulation(totalPopulation);
}

function renderTopCountries() {
  const topCountries = [...countries]
    .sort((a, b) => b.population - a.population)
    .slice(0, 8);

  topCountriesEl.innerHTML = topCountries.map((country, index) => `
    <li data-country="${country.name.toLowerCase()}">
      <span class="rank">${index + 1}</span>
      <span class="country-row">
        <span>${country.name}</span>
        <small>${formatCompact(country.population)}</small>
      </span>
    </li>
  `).join("");

  topCountriesEl.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => focusCountry(item.dataset.country));
  });
}

function renderLegend() {
  legendItemsEl.innerHTML = POPULATION_BREAKS.map((breakValue, index) => {
    const nextBreak = POPULATION_BREAKS[index + 1];
    const label = nextBreak
      ? `${formatCompact(breakValue)} - ${formatCompact(nextBreak)}`
      : `${formatCompact(breakValue)}+`;

    return `
      <div class="legend-row">
        <span class="swatch" style="background:${POPULATION_COLORS[index]}"></span>
        <span>${label}</span>
      </div>
    `;
  }).join("");
}

function handleSearch() {
  const query = countrySearchEl.value.trim().toLowerCase();

  if (!query) {
    return;
  }

  const country = countries.find((item) => item.name.toLowerCase().includes(query));

  if (country) {
    focusCountry(country.name.toLowerCase());
  } else {
    detailNameEl.textContent = "No match found";
    detailRegionEl.textContent = "Try another country name.";
    detailPopulationEl.textContent = "-";
  }
}

function focusCountry(countryName) {
  const layer = layerByName.get(countryName);
  const country = countries.find((item) => item.name.toLowerCase() === countryName);

  if (!layer || !country) {
    return;
  }

  highlightCountry(layer, country, true);
}

function clearSearch() {
  countrySearchEl.value = "";
  selectedCountryEl.textContent = "None";
  detailNameEl.textContent = "Select a country";
  detailRegionEl.textContent = "Hover or click on the map to inspect population.";
  detailPopulationEl.textContent = "-";

  if (activeLayer) {
    countryLayer.resetStyle(activeLayer);
    activeLayer = null;
  }

  map.setView([20, 0], 2);
}

function getPopulationColor(population) {
  for (let index = POPULATION_BREAKS.length - 1; index >= 0; index--) {
    if (population >= POPULATION_BREAKS[index]) {
      return POPULATION_COLORS[index];
    }
  }

  return POPULATION_COLORS[0];
}

function formatPopulation(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function formatCompact(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function setLoadingState() {
  countryCountEl.textContent = "...";
  worldPopulationEl.textContent = "...";
  topCountriesEl.innerHTML = '<li class="loading-note">Loading country population data...</li>';
}

countrySearchEl.addEventListener("input", handleSearch);
clearSearchBtn.addEventListener("click", clearSearch);

initMap();
