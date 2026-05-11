const regionFilter = document.getElementById("regionFilter");
const categoryFilter = document.getElementById("categoryFilter");
const resetBtn = document.getElementById("resetBtn");
const revenueKpi = document.getElementById("revenueKpi");
const revenueTrend = document.getElementById("revenueTrend");
const ordersKpi = document.getElementById("ordersKpi");
const aovKpi = document.getElementById("aovKpi");
const conversionKpi = document.getElementById("conversionKpi");
const productTable = document.getElementById("productTable");
const lineViewBtn = document.getElementById("lineViewBtn");
const barViewBtn = document.getElementById("barViewBtn");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const categories = ["electronics", "fashion", "home", "grocery"];
const regions = ["north", "south", "east", "west"];
const categoryLabels = {
  electronics: "Electronics",
  fashion: "Fashion",
  home: "Home",
  grocery: "Grocery"
};
const regionLabels = {
  north: "North",
  south: "South",
  east: "East",
  west: "West"
};

const palette = ["#2563eb", "#06b6d4", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed"];
let revenueChart;
let categoryChart;
let regionChart;
let revenueChartType = "line";

// Seed data keeps the dashboard fast and deterministic while still feeling realistic.
const salesData = [
  { month: "Jan", region: "north", category: "electronics", product: "NeoBook Pro", revenue: 18200, orders: 74, visitors: 920 },
  { month: "Jan", region: "south", category: "fashion", product: "Urban Jacket", revenue: 9400, orders: 118, visitors: 1540 },
  { month: "Jan", region: "east", category: "home", product: "Luna Lamp", revenue: 7200, orders: 86, visitors: 1180 },
  { month: "Jan", region: "west", category: "grocery", product: "Daily Pantry Box", revenue: 6800, orders: 170, visitors: 2100 },
  { month: "Feb", region: "north", category: "electronics", product: "SoundSphere", revenue: 15600, orders: 91, visitors: 1050 },
  { month: "Feb", region: "south", category: "home", product: "Cloud Mattress", revenue: 13200, orders: 42, visitors: 690 },
  { month: "Feb", region: "east", category: "fashion", product: "Stride Sneakers", revenue: 10350, orders: 115, visitors: 1450 },
  { month: "Feb", region: "west", category: "grocery", product: "Fresh Basket", revenue: 7600, orders: 190, visitors: 2350 },
  { month: "Mar", region: "north", category: "home", product: "Aero Chair", revenue: 11900, orders: 61, visitors: 870 },
  { month: "Mar", region: "south", category: "electronics", product: "PixelTab", revenue: 21100, orders: 83, visitors: 1010 },
  { month: "Mar", region: "east", category: "grocery", product: "Organic Staples", revenue: 8200, orders: 205, visitors: 2440 },
  { month: "Mar", region: "west", category: "fashion", product: "Metro Denim", revenue: 11600, orders: 128, visitors: 1490 },
  { month: "Apr", region: "north", category: "electronics", product: "ViewMax Monitor", revenue: 24800, orders: 96, visitors: 1120 },
  { month: "Apr", region: "south", category: "grocery", product: "Family Essentials", revenue: 9300, orders: 220, visitors: 2510 },
  { month: "Apr", region: "east", category: "home", product: "Kitchen Set", revenue: 15100, orders: 69, visitors: 920 },
  { month: "Apr", region: "west", category: "fashion", product: "Linen Shirt", revenue: 12600, orders: 140, visitors: 1620 },
  { month: "May", region: "north", category: "fashion", product: "Travel Hoodie", revenue: 13850, orders: 147, visitors: 1720 },
  { month: "May", region: "south", category: "electronics", product: "GameStation Mini", revenue: 29700, orders: 99, visitors: 1210 },
  { month: "May", region: "east", category: "grocery", product: "Snack Crate", revenue: 9100, orders: 238, visitors: 2670 },
  { month: "May", region: "west", category: "home", product: "Oak Desk", revenue: 17800, orders: 54, visitors: 760 },
  { month: "Jun", region: "north", category: "grocery", product: "Breakfast Bundle", revenue: 10100, orders: 260, visitors: 2840 },
  { month: "Jun", region: "south", category: "fashion", product: "Summer Dress", revenue: 14900, orders: 166, visitors: 1810 },
  { month: "Jun", region: "east", category: "electronics", product: "Volt Charger", revenue: 17300, orders: 216, visitors: 2320 },
  { month: "Jun", region: "west", category: "home", product: "Garden Kit", revenue: 16400, orders: 82, visitors: 980 },
  { month: "Jul", region: "north", category: "electronics", product: "AirBuds", revenue: 26300, orders: 188, visitors: 2140 },
  { month: "Jul", region: "south", category: "home", product: "Storage Tower", revenue: 14200, orders: 95, visitors: 1100 },
  { month: "Jul", region: "east", category: "fashion", product: "Canvas Tote", revenue: 9800, orders: 196, visitors: 2280 },
  { month: "Jul", region: "west", category: "grocery", product: "Wellness Pack", revenue: 10800, orders: 245, visitors: 2710 },
  { month: "Aug", region: "north", category: "home", product: "Comfort Sofa", revenue: 28600, orders: 44, visitors: 720 },
  { month: "Aug", region: "south", category: "electronics", product: "SmartCam", revenue: 19900, orders: 105, visitors: 1270 },
  { month: "Aug", region: "east", category: "grocery", product: "Tea Collection", revenue: 8800, orders: 225, visitors: 2630 },
  { month: "Aug", region: "west", category: "fashion", product: "Trail Shoes", revenue: 15700, orders: 121, visitors: 1500 },
  { month: "Sep", region: "north", category: "fashion", product: "Work Backpack", revenue: 16100, orders: 134, visitors: 1520 },
  { month: "Sep", region: "south", category: "grocery", product: "Lunch Box Plan", revenue: 11700, orders: 280, visitors: 3000 },
  { month: "Sep", region: "east", category: "electronics", product: "DeskHub", revenue: 22400, orders: 112, visitors: 1350 },
  { month: "Sep", region: "west", category: "home", product: "Bath Set", revenue: 13400, orders: 88, visitors: 1030 },
  { month: "Oct", region: "north", category: "electronics", product: "NeoPhone X", revenue: 34600, orders: 127, visitors: 1490 },
  { month: "Oct", region: "south", category: "fashion", product: "Festive Kurta", revenue: 18400, orders: 230, visitors: 2510 },
  { month: "Oct", region: "east", category: "home", product: "Dinnerware Set", revenue: 19200, orders: 105, visitors: 1180 },
  { month: "Oct", region: "west", category: "grocery", product: "Celebration Hamper", revenue: 14200, orders: 240, visitors: 2750 },
  { month: "Nov", region: "north", category: "home", product: "Air Purifier", revenue: 23500, orders: 85, visitors: 1080 },
  { month: "Nov", region: "south", category: "electronics", product: "Ultra TV", revenue: 41200, orders: 72, visitors: 900 },
  { month: "Nov", region: "east", category: "fashion", product: "Winter Coat", revenue: 19800, orders: 132, visitors: 1460 },
  { month: "Nov", region: "west", category: "grocery", product: "Monthly Grocery Plan", revenue: 15300, orders: 292, visitors: 3120 },
  { month: "Dec", region: "north", category: "grocery", product: "Holiday Pantry", revenue: 16800, orders: 310, visitors: 3340 },
  { month: "Dec", region: "south", category: "home", product: "Decor Bundle", revenue: 22100, orders: 120, visitors: 1320 },
  { month: "Dec", region: "east", category: "electronics", product: "Creator Laptop", revenue: 38900, orders: 76, visitors: 860 },
  { month: "Dec", region: "west", category: "fashion", product: "Party Wear Set", revenue: 20400, orders: 170, visitors: 1820 }
];

function initDashboard() {
  Chart.defaults.font.family = "Arial, Helvetica, sans-serif";
  Chart.defaults.color = "#687083";

  createCharts();
  bindEvents();
  updateDashboard();
}

function bindEvents() {
  regionFilter.addEventListener("change", updateDashboard);
  categoryFilter.addEventListener("change", updateDashboard);
  resetBtn.addEventListener("click", resetFilters);
  lineViewBtn.addEventListener("click", () => changeRevenueChartType("line"));
  barViewBtn.addEventListener("click", () => changeRevenueChartType("bar"));
}

function createCharts() {
  revenueChart = new Chart(document.getElementById("revenueChart"), {
    type: revenueChartType,
    data: { labels: months, datasets: [] },
    options: getRevenueOptions()
  });

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: formatTooltipLabel } }
      },
      cutout: "62%"
    }
  });

  regionChart = new Chart(document.getElementById("regionChart"), {
    type: "bar",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => formatCurrency(context.raw) } }
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: compactCurrency }, grid: { color: "#edf2f7" } },
        y: { grid: { display: false } }
      }
    }
  });
}

function updateDashboard() {
  const filtered = getFilteredData();
  updateKpis(filtered);
  updateRevenueChart(filtered);
  updateCategoryChart(filtered);
  updateRegionChart(filtered);
  updateProductTable(filtered);
}

function getFilteredData() {
  return salesData.filter((item) => {
    const matchesRegion = regionFilter.value === "all" || item.region === regionFilter.value;
    const matchesCategory = categoryFilter.value === "all" || item.category === categoryFilter.value;
    return matchesRegion && matchesCategory;
  });
}

function updateKpis(data) {
  const revenue = sum(data, "revenue");
  const orders = sum(data, "orders");
  const visitors = sum(data, "visitors");
  const aov = orders ? revenue / orders : 0;
  const conversion = visitors ? (orders / visitors) * 100 : 0;
  const firstHalf = data.filter((item) => months.indexOf(item.month) < 6);
  const secondHalf = data.filter((item) => months.indexOf(item.month) >= 6);
  const firstRevenue = sum(firstHalf, "revenue");
  const secondRevenue = sum(secondHalf, "revenue");
  const growth = firstRevenue ? ((secondRevenue - firstRevenue) / firstRevenue) * 100 : 0;

  revenueKpi.textContent = formatCurrency(revenue);
  ordersKpi.textContent = orders.toLocaleString();
  aovKpi.textContent = formatCurrency(aov);
  conversionKpi.textContent = `${conversion.toFixed(1)}%`;
  revenueTrend.textContent = `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% vs first half`;
}

function updateRevenueChart(data) {
  const monthlyRevenue = months.map((month) => sum(data.filter((item) => item.month === month), "revenue"));

  revenueChart.data.labels = months;
  revenueChart.data.datasets = [{
    label: "Revenue",
    data: monthlyRevenue,
    borderColor: "#2563eb",
    backgroundColor: revenueChartType === "line" ? "rgba(37, 99, 235, 0.14)" : "#2563eb",
    borderWidth: 3,
    fill: revenueChartType === "line",
    tension: 0.38,
    pointRadius: 4,
    pointHoverRadius: 7,
    borderRadius: 8
  }];
  revenueChart.update();
}

function updateCategoryChart(data) {
  const values = categories.map((category) => sum(data.filter((item) => item.category === category), "revenue"));

  categoryChart.data.labels = categories.map((category) => categoryLabels[category]);
  categoryChart.data.datasets = [{
    data: values,
    backgroundColor: [palette[0], palette[1], palette[2], palette[3]],
    borderColor: "#ffffff",
    borderWidth: 4
  }];
  categoryChart.update();
}

function updateRegionChart(data) {
  const values = regions.map((region) => sum(data.filter((item) => item.region === region), "revenue"));

  regionChart.data.labels = regions.map((region) => regionLabels[region]);
  regionChart.data.datasets = [{
    data: values,
    backgroundColor: [palette[0], palette[1], palette[2], palette[5]],
    borderRadius: 8,
    barThickness: 28
  }];
  regionChart.update();
}

function updateProductTable(data) {
  const rows = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  productTable.innerHTML = rows.map((item) => `
    <tr>
      <td>${item.product}</td>
      <td>${categoryLabels[item.category]}</td>
      <td>${regionLabels[item.region]}</td>
      <td>${formatCurrency(item.revenue)}</td>
      <td>${item.orders.toLocaleString()}</td>
    </tr>
  `).join("");
}

function changeRevenueChartType(type) {
  revenueChartType = type;
  lineViewBtn.classList.toggle("active", type === "line");
  barViewBtn.classList.toggle("active", type === "bar");
  revenueChart.destroy();
  revenueChart = new Chart(document.getElementById("revenueChart"), {
    type,
    data: { labels: months, datasets: [] },
    options: getRevenueOptions()
  });
  updateRevenueChart(getFilteredData());
}

function getRevenueOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context) => formatCurrency(context.raw) } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { callback: compactCurrency }, grid: { color: "#edf2f7" } }
    }
  };
}

function resetFilters() {
  regionFilter.value = "all";
  categoryFilter.value = "all";
  changeRevenueChartType("line");
  updateDashboard();
}

function sum(data, key) {
  return data.reduce((total, item) => total + item[key], 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function compactCurrency(value) {
  return `$${Math.round(value / 1000)}k`;
}

function formatTooltipLabel(context) {
  return `${context.label}: ${formatCurrency(context.raw)}`;
}

initDashboard();
