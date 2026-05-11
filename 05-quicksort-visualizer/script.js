const barsEl = document.getElementById("bars");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const randomBtn = document.getElementById("randomBtn");
const applyInputBtn = document.getElementById("applyInputBtn");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");
const customInput = document.getElementById("customInput");
const statusText = document.getElementById("statusText");
const detailText = document.getElementById("detailText");
const comparisonCountEl = document.getElementById("comparisonCount");
const swapCountEl = document.getElementById("swapCount");
const pivotValueEl = document.getElementById("pivotValue");
const rangeTextEl = document.getElementById("rangeText");

let values = [];
let steps = [];
let currentStep = 0;
let comparisons = 0;
let swaps = 0;
let isPlaying = false;
let playTimer = null;

function init() {
  bindEvents();
  generateRandomArray();
}

function bindEvents() {
  playBtn.addEventListener("click", play);
  pauseBtn.addEventListener("click", pause);
  stepBtn.addEventListener("click", stepForward);
  resetBtn.addEventListener("click", resetVisualization);
  randomBtn.addEventListener("click", generateRandomArray);
  applyInputBtn.addEventListener("click", applyCustomValues);
  sizeSlider.addEventListener("input", generateRandomArray);
  speedSlider.addEventListener("input", () => {
    if (isPlaying) {
      pause();
      play();
    }
  });
}

function generateRandomArray() {
  const size = Number(sizeSlider.value);
  values = Array.from({ length: size }, () => randomNumber(8, 100));
  prepareVisualization("Ready", "A fresh pastel array is ready to sort.");
}

function applyCustomValues() {
  const parsed = customInput.value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .slice(0, 80);

  if (parsed.length < 2) {
    setStatus("Need more values", "Enter at least two positive numbers separated by commas.");
    return;
  }

  values = parsed;
  sizeSlider.value = Math.min(80, Math.max(10, parsed.length));
  prepareVisualization("Ready", "Custom values loaded. Start sorting when you are ready.");
}

function prepareVisualization(status, detail) {
  pause();
  comparisons = 0;
  swaps = 0;
  currentStep = 0;
  steps = buildQuickSortSteps(values);
  renderBars(values, {});
  updateStats();
  setStatus(status, detail);
  updateButtons();
}

// Quick sort records animation snapshots instead of mutating the live UI directly.
function buildQuickSortSteps(sourceValues) {
  const working = [...sourceValues];
  const recordedSteps = [{
    array: [...working],
    sorted: [],
    message: "Starting quick sort.",
    status: "Ready"
  }];

  quickSort(working, 0, working.length - 1, recordedSteps, new Set());

  recordedSteps.push({
    array: [...working],
    sorted: working.map((_, index) => index),
    message: "Array sorted successfully.",
    status: "Complete"
  });

  return recordedSteps;
}

function quickSort(array, low, high, recordedSteps, sortedSet) {
  if (low > high) {
    return;
  }

  if (low === high) {
    sortedSet.add(low);
    recordedSteps.push({
      array: [...array],
      active: [low, high],
      sorted: [...sortedSet],
      message: `Value ${array[low]} is already in its final position.`,
      status: "Partition fixed"
    });
    return;
  }

  recordedSteps.push({
    array: [...array],
    active: [low, high],
    pivot: high,
    sorted: [...sortedSet],
    message: `Partitioning indexes ${low} to ${high}. Pivot is ${array[high]}.`,
    status: "Partitioning"
  });

  const pivotIndex = partition(array, low, high, recordedSteps, sortedSet);
  sortedSet.add(pivotIndex);

  recordedSteps.push({
    array: [...array],
    active: [low, high],
    pivot: pivotIndex,
    sorted: [...sortedSet],
    message: `Pivot ${array[pivotIndex]} is locked at index ${pivotIndex}.`,
    status: "Pivot placed"
  });

  quickSort(array, low, pivotIndex - 1, recordedSteps, sortedSet);
  quickSort(array, pivotIndex + 1, high, recordedSteps, sortedSet);
}

function partition(array, low, high, recordedSteps, sortedSet) {
  const pivotValue = array[high];
  let boundary = low - 1;

  for (let scanner = low; scanner < high; scanner++) {
    recordedSteps.push({
      array: [...array],
      active: [low, high],
      comparing: [scanner, high],
      pivot: high,
      sorted: [...sortedSet],
      countComparison: true,
      message: `Compare ${array[scanner]} with pivot ${pivotValue}.`,
      status: "Comparing"
    });

    if (array[scanner] <= pivotValue) {
      boundary++;

      if (boundary !== scanner) {
        swap(array, boundary, scanner);
        recordedSteps.push({
          array: [...array],
          active: [low, high],
          swap: [boundary, scanner],
          pivot: high,
          sorted: [...sortedSet],
          countSwap: true,
          message: `${array[boundary]} moves left of the pivot.`,
          status: "Swapping"
        });
      }
    }
  }

  swap(array, boundary + 1, high);
  recordedSteps.push({
    array: [...array],
    active: [low, high],
    swap: [boundary + 1, high],
    pivot: boundary + 1,
    sorted: [...sortedSet],
    countSwap: boundary + 1 !== high,
    message: `Place pivot ${pivotValue} after smaller values.`,
    status: "Placing pivot"
  });

  return boundary + 1;
}

function play() {
  if (isPlaying || currentStep >= steps.length - 1) {
    return;
  }

  isPlaying = true;
  setStatus("Playing", "Quick sort is running. Watch the pivot split the array into smaller ranges.");
  updateButtons();
  scheduleNextStep();
}

function scheduleNextStep() {
  playTimer = setTimeout(() => {
    stepForward();

    if (isPlaying && currentStep < steps.length - 1) {
      scheduleNextStep();
    } else {
      pause();
    }
  }, getDelay());
}

function pause() {
  isPlaying = false;
  clearTimeout(playTimer);
  updateButtons();
}

function stepForward() {
  if (currentStep >= steps.length - 1) {
    setStatus("Complete", "The array is fully sorted.");
    updateButtons();
    return;
  }

  currentStep++;
  applyStep(steps[currentStep]);
}

function resetVisualization() {
  pause();
  comparisons = 0;
  swaps = 0;
  currentStep = 0;
  applyStep(steps[0]);
  setStatus("Reset", "Back at the starting arrangement.");
}

function applyStep(step) {
  if (step.countComparison) {
    comparisons++;
  }

  if (step.countSwap) {
    swaps++;
  }

  renderBars(step.array, step);
  setStatus(step.status, step.message);
  updateStats(step);
  updateButtons();
}

function renderBars(array, step) {
  const maxValue = Math.max(...array);
  const activeStart = step.active ? step.active[0] : -1;
  const activeEnd = step.active ? step.active[1] : -1;
  const sorted = new Set(step.sorted || []);
  const comparing = new Set(step.comparing || []);
  const swapSet = new Set(step.swap || []);

  barsEl.innerHTML = array.map((value, index) => {
    const height = Math.max(6, (value / maxValue) * 100);
    const classes = ["bar"];

    if (index >= activeStart && index <= activeEnd) {
      classes.push("active");
    }

    if (comparing.has(index)) {
      classes.push("comparing");
    }

    if (swapSet.has(index)) {
      classes.push("swap");
    }

    if (step.pivot === index) {
      classes.push("pivot");
    }

    if (sorted.has(index)) {
      classes.push("sorted");
    }

    return `<div class="${classes.join(" ")}" style="--bar-height:${height}%" data-value="${value}"></div>`;
  }).join("");
}

function updateStats(step = {}) {
  comparisonCountEl.textContent = comparisons.toLocaleString();
  swapCountEl.textContent = swaps.toLocaleString();
  pivotValueEl.textContent = Number.isInteger(step.pivot) ? step.array[step.pivot] : "-";
  rangeTextEl.textContent = step.active ? `${step.active[0]}-${step.active[1]}` : "-";
}

function updateButtons() {
  playBtn.disabled = isPlaying || currentStep >= steps.length - 1;
  pauseBtn.disabled = !isPlaying;
  stepBtn.disabled = isPlaying || currentStep >= steps.length - 1;
}

function setStatus(status, detail) {
  statusText.textContent = status;
  detailText.textContent = detail;
}

function swap(array, firstIndex, secondIndex) {
  [array[firstIndex], array[secondIndex]] = [array[secondIndex], array[firstIndex]];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDelay() {
  const speed = Number(speedSlider.value);
  return 850 - speed * 7.5;
}

init();
