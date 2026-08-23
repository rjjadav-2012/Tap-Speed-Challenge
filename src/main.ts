// === State & Configuration ===
let isDarkTheme = false;
let selectedDuration: number | 'manual' = 5;
let bestTPS = 0;

// === Game State ===
let isPlaying = false;
let startTime = 0;
let totalTaps = 0;
let animationFrameId: number;
let timeElapsed = 0;

// === DOM Elements ===
// Dashboards
const dashboardStart = document.getElementById('dashboard-start')!;
const dashboardArena = document.getElementById('dashboard-arena')!;
const dashboardResults = document.getElementById('dashboard-results')!;

// Dashboard 1: Start Screen
const themeToggleBtn = document.getElementById('theme-toggle-btn')!;
const themeIcon = document.getElementById('theme-icon')!;
const themeText = document.getElementById('theme-text')!;
const timeOptions = document.querySelectorAll('.time-btn');
const bestTpsDisplay = document.getElementById('best-tps-display')!;
const startGameBtn = document.getElementById('start-game-btn')!;

// Dashboard 2: Arena
const hudTime = document.getElementById('hud-time')!;
const hudTps = document.getElementById('hud-tps')!;
const hudScore = document.getElementById('hud-score')!;
const tapBox = document.getElementById('tap-box')!;
const tapBoxText = document.getElementById('tap-box-text')!;
const abortBtn = document.getElementById('abort-btn')!;

// Dashboard 3: Results
const resultScore = document.getElementById('result-score')!;
const resultTps = document.getElementById('result-tps')!;
const rankTier = document.getElementById('rank-tier')!;
const rankCommentary = document.getElementById('rank-commentary')!;
const benchmarkFillYou = document.getElementById('benchmark-fill-you')!;
const backToMenuBtn = document.getElementById('back-to-menu-btn')!;

// === Initialization ===
function init() {
  // Load best TPS
  const savedBest = localStorage.getItem('tapChallenge_bestTPS');
  if (savedBest) {
    bestTPS = parseFloat(savedBest);
    bestTpsDisplay.textContent = bestTPS.toFixed(2);
  }

  // Check saved theme
  const savedTheme = localStorage.getItem('tapChallenge_theme');
  if (savedTheme === 'dark') {
    toggleTheme(true);
  }

  setupEventListeners();
}

// === Event Listeners ===
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    toggleTheme(!isDarkTheme);
  });

  // Time Selectors
  timeOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all
      timeOptions.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      const target = e.target as HTMLElement;
      target.classList.add('active');

      const timeVal = target.getAttribute('data-time');
      if (timeVal === 'manual') {
        selectedDuration = 'manual';
      } else {
        selectedDuration = parseInt(timeVal || '5', 10);
      }
    });
  });

  // Start Game
  startGameBtn.addEventListener('click', startGame);

  // Abort / Stop Game
  abortBtn.addEventListener('click', () => {
    if (selectedDuration === 'manual' && totalTaps > 0) {
      // In manual mode, this button ends the game and shows results
      endGame();
    } else {
      // Abort without saving
      abortGame();
    }
  });

  // Tap Box (Use pointerdown for sub-millisecond, low-latency registration)
  tapBox.addEventListener('pointerdown', handleTap);

  // Prevent default context menu on tap box (e.g. right click or long press)
  tapBox.addEventListener('contextmenu', e => e.preventDefault());

  // Back to Menu
  backToMenuBtn.addEventListener('click', showStartScreen);
}

// === Logic ===
function toggleTheme(forceDark: boolean) {
  isDarkTheme = forceDark;
  if (isDarkTheme) {
    document.body.classList.remove('sunny-mode');
    document.body.classList.add('darker-mode');
    themeIcon.textContent = '🌙';
    themeText.textContent = 'Darker';
    localStorage.setItem('tapChallenge_theme', 'dark');
  } else {
    document.body.classList.remove('darker-mode');
    document.body.classList.add('sunny-mode');
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Sunny';
    localStorage.setItem('tapChallenge_theme', 'light');
  }
}

function showDashboard(activeDashboard: HTMLElement) {
  [dashboardStart, dashboardArena, dashboardResults].forEach(d => {
    if (d === activeDashboard) {
      d.classList.remove('hidden');
      // small delay to allow display to apply before fading in
      setTimeout(() => d.classList.add('active'), 10);
    } else {
      d.classList.remove('active');
      setTimeout(() => d.classList.add('hidden'), 300); // match CSS transition time
    }
  });
}

function showStartScreen() {
  showDashboard(dashboardStart);
  bestTpsDisplay.textContent = bestTPS.toFixed(2);
}

function startGame() {
  // Setup UI
  showDashboard(dashboardArena);
  
  if (selectedDuration === 'manual') {
    abortBtn.textContent = "STOP & RESULTS";
    hudTime.textContent = "0.000";
  } else {
    abortBtn.textContent = "ABORT";
    hudTime.textContent = selectedDuration.toFixed(3);
  }
  
  hudScore.textContent = "0";
  hudTps.textContent = "0.00";
  tapBoxText.textContent = "TAP HERE";
  
  // Reset Variables
  isPlaying = false; // Will become true on first tap
  totalTaps = 0;
  timeElapsed = 0;
}

function handleTap(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return; // Only allow left clicks if mouse
  
  // Prevent ghost clicks / double firing on mobile
  if (e.pointerType === 'mouse') {
      e.preventDefault(); 
  } else {
      tapBox.releasePointerCapture(e.pointerId); // Prevent capturing to allow fast multi-touch
  }

  // Start timer on first tap
  if (!isPlaying) {
    isPlaying = true;
    startTime = performance.now();
    tapBoxText.style.opacity = '0'; // Hide "TAP HERE" text
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  totalTaps++;
  hudScore.textContent = totalTaps.toString();
}

function gameLoop(currentTime: number) {
  if (!isPlaying) return;

  timeElapsed = (currentTime - startTime) / 1000;
  
  // Calculate Live TPS
  const currentTps = timeElapsed > 0 ? (totalTaps / timeElapsed) : 0;
  hudTps.textContent = currentTps.toFixed(2);

  // Time Display & End Condition
  if (selectedDuration === 'manual') {
    hudTime.textContent = timeElapsed.toFixed(3);
  } else {
    const timeLeft = selectedDuration - timeElapsed;
    if (timeLeft <= 0) {
      hudTime.textContent = "0.000";
      endGame();
      return;
    } else {
      hudTime.textContent = timeLeft.toFixed(3);
    }
  }

  animationFrameId = requestAnimationFrame(gameLoop);
}

function abortGame() {
  isPlaying = false;
  cancelAnimationFrame(animationFrameId);
  showStartScreen();
}

function endGame() {
  isPlaying = false;
  cancelAnimationFrame(animationFrameId);
  
  // Ensure we have final precise calculations
  const finalTime = selectedDuration === 'manual' ? timeElapsed : (selectedDuration as number);
  const finalTps = finalTime > 0 ? (totalTaps / finalTime) : 0;

  // Save High Score
  if (finalTps > bestTPS) {
    bestTPS = finalTps;
    localStorage.setItem('tapChallenge_bestTPS', bestTPS.toString());
  }

  // Populate Results
  resultScore.textContent = totalTaps.toString();
  resultTps.textContent = finalTps.toFixed(2);
  
  // Ranking Engine
  const { rank, comment } = getRanking(finalTps);
  rankTier.textContent = `[Rank: ${rank}]`;
  rankCommentary.textContent = comment;

  // Benchmark Fill (assuming max useful TPS on the chart is around 15)
  const maxChartTps = 15;
  const percentage = Math.min((finalTps / maxChartTps) * 100, 100);
  
  // Small delay to allow transition to run
  setTimeout(() => {
    benchmarkFillYou.style.width = `${percentage}%`;
  }, 100);

  showDashboard(dashboardResults);
}

function getRanking(tps: number): { rank: string, comment: string } {
  if (tps < 6) return { rank: "Sloth", comment: "Did you fall asleep? Try picking up the pace." };
  if (tps < 8) return { rank: "Bull", comment: "Brute force, but a bit sluggish." };
  if (tps < 10) return { rank: "Rabbit", comment: "Quick and nimble. Solid average." };
  if (tps < 12) return { rank: "Horse", comment: "Impressive speed and stamina!" };
  if (tps < 14) return { rank: "Cheetah", comment: "Blistering fast! Elite tier." };
  return { rank: "The Flash", comment: "God-tier speed! You broke the sound barrier." };
}

// Start
init();
