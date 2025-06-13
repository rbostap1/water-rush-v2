let score = 0;
let currentQuestion = 0;

const questions = [
  { text: "Turning off the tap while brushing your teeth saves water.", answer: true },
  { text: "Most of Earth's fresh water is stored in glaciers and ice caps.", answer: true },
  { text: "It is okay to pour chemicals or oil down the drain.", answer: false },
  { text: "Fixing leaks at home can help conserve water.", answer: true },
  { text: "Plants do not need water to grow.", answer: false },
  { text: "Taking shorter showers helps reduce water waste.", answer: true },
  { text: "Bottled water is always safer than tap water.", answer: false },
  { text: "Collecting rainwater can be used for watering gardens.", answer: true },
  { text: "Water pollution does not affect humans.", answer: false },
  { text: "Reusing and recycling water is important for sustainability.", answer: true }
];

function playClap() {
  // Use a short public domain clap sound
  let clap = document.getElementById('clap-audio');
  if (!clap) {
    clap = document.createElement('audio');
    clap.id = 'clap-audio';
    clap.src = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3';
    clap.preload = 'auto';
    document.body.appendChild(clap);
  }
  // Play with a user gesture if possible
  if (typeof clap.play === "function") {
    clap.currentTime = 0;
    // Some browsers require play() to be called after a user gesture
    const playPromise = clap.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Try again on next user gesture
        const resume = () => {
          clap.play();
          document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume);
      });
    }
  }
}

function showConfetti() {
  // Simple confetti using canvas-confetti CDN
  if (!document.getElementById('confettiScript')) {
    const script = document.createElement('script');
    script.id = 'confettiScript';
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => {
      confetti();
      playClap();
    };
    document.body.appendChild(script);
  } else if (window.confetti) {
    confetti();
    playClap();
  }
}

function hideQASection() {
  const questionSection = document.querySelector('.question');
  const instruction = document.querySelector('.instruction');
  if (questionSection) questionSection.style.display = 'none';
  if (instruction) instruction.style.display = 'none';
}

function showEndMessage(msg, color = "#00b4d8") {
  let winMsg = document.getElementById('winMessage');
  if (!winMsg) {
    winMsg = document.createElement('div');
    winMsg.id = 'winMessage';
    const main = document.querySelector('main, .main-content');
    if (main) main.appendChild(winMsg);
  }
  winMsg.textContent = msg;
  winMsg.style.fontSize = "2rem";
  winMsg.style.fontWeight = "bold";
  winMsg.style.color = color;
  winMsg.style.margin = "2rem 0";
  winMsg.style.display = "block";
}

function hideWinMessage() {
  const winMsg = document.getElementById('winMessage');
  if (winMsg) winMsg.style.display = "none";
}

function showWinMessage() {
  let winMsg = document.getElementById('winMessage');
  if (!winMsg) {
    winMsg = document.createElement('div');
    winMsg.id = 'winMessage';
    winMsg.textContent = "Great job, you won!";
    winMsg.style.fontSize = "2rem";
    winMsg.style.fontWeight = "bold";
    winMsg.style.color = "#00b4d8";
    winMsg.style.margin = "2rem 0";
    const main = document.querySelector('main, .main-content');
    if (main) main.appendChild(winMsg);
  } else {
    winMsg.textContent = "Great job, you won!";
    winMsg.style.display = "block";
  }
}

let timerInterval = null;
let timeLeft = 60; // default for normal mode
let currentMode = "normal"; // "easy", "normal", "hard"

const modeSettings = {
  easy: 90,
  normal: 60,
  hard: 30
};

function getModeLabel(mode) {
  const modeLabels = { easy: "Easy", normal: "Normal", hard: "Hard" };
  return modeLabels[mode] || "";
}

function updateGameTitleWithMode() {
  // Try to find h1 or .game-title
  let title = document.querySelector('h1') || document.querySelector('.game-title');
  if (title) {
    // Remove any previous mode label
    let modeSpan = title.querySelector('.mode-label');
    if (!modeSpan) {
      modeSpan = document.createElement('span');
      modeSpan.className = 'mode-label';
      modeSpan.style.fontSize = '1rem';
      modeSpan.style.fontWeight = 'normal';
      modeSpan.style.marginLeft = '0.7em';
      modeSpan.style.color = '#00bfff';
      title.appendChild(modeSpan);
    }
    modeSpan.textContent = `Mode: ${getModeLabel(currentMode)}`;
  }
}

function getHighScoreKey() {
  // High score per mode
  return `waterRushHighScore_${currentMode}`;
}

function getHighScore() {
  return parseInt(localStorage.getItem(getHighScoreKey()) || "0", 10);
}

function setHighScoreIfNeeded(newScore) {
  const key = getHighScoreKey();
  const prev = getHighScore();
  if (newScore > prev) {
    localStorage.setItem(key, newScore);
    updateHighScoreDisplay();
  }
}

function updateHighScoreDisplay() {
  let area = document.getElementById('highScoreArea');
  if (!area) {
    area = document.createElement('div');
    area.id = 'highScoreArea';
    area.className = 'high-score-area';
    // Insert after score badge if possible
    const badge = document.querySelector('.score-badge');
    if (badge && badge.parentNode) {
      badge.parentNode.insertBefore(area, badge.nextSibling);
    } else {
      // fallback
      document.body.insertBefore(area, document.body.firstChild);
    }
  }
  area.innerHTML = `<span class="high-score-label">Highest Score:</span> <span class="high-score-value">${getHighScore()}</span>`;
}

function setMode(mode) {
  currentMode = mode;
  timeLeft = modeSettings[mode];
  updateTimerDisplay();
  updateGameTitleWithMode();
  updateHighScoreDisplay();
}

function updateTimerDisplay() {
  let timerEl = document.getElementById('glass-timer');
  if (!timerEl) {
    // Create timer element inside glass-outer if not present
    const glassOuter = document.querySelector('.glass-outer');
    if (glassOuter) {
      timerEl = document.createElement('div');
      timerEl.id = 'glass-timer';
      timerEl.style.position = 'absolute';
      timerEl.style.top = '50%';
      timerEl.style.left = '50%';
      timerEl.style.transform = 'translate(-50%, -50%)';
      timerEl.style.fontSize = '1.6rem';
      timerEl.style.fontWeight = 'bold';
      timerEl.style.color = '#fff';
      timerEl.style.textShadow = '0 2px 8px #00b4d8, 0 0 2px #0008';
      timerEl.style.pointerEvents = 'none';
      timerEl.style.userSelect = 'none';
      timerEl.style.zIndex = '10';
      glassOuter.style.position = 'relative';
      glassOuter.appendChild(timerEl);
    }
  }
  if (timerEl) {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
    timerEl.style.display = 'block';
  }
}

function hideTimerDisplay() {
  const timerEl = document.getElementById('glass-timer');
  if (timerEl) timerEl.style.display = 'none';
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGameOnTimeout();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function endGameOnTimeout() {
  hideQASection();
  hideWinMessage();
  hideTimerDisplay();
  // Show message based on score
  const maxScore = questions.length * 10;
  const percent = score / maxScore;
  const waterFill = document.getElementById("waterFill");
  const waterColor = waterFill ? waterFill.getAttribute("fill") : "";
  if (percent >= 0.6 && waterColor === "#00bfff") {
    showEndMessage("Time's up! You did great, but try to be quicker!", "#00b4d8");
  } else if (percent < 0.6 && waterColor === "#00bfff") {
    showEndMessage("Time's up! Keep practicing and you'll improve!", "#ff9800");
  } else if (percent < 0.6 && waterColor === "#00ff66") {
    showEndMessage("Time's up! Uh No! Try again.", "#e53935");
  } else if (percent >= 0.6 && waterColor === "#00ff66") {
    showEndMessage("Time's up! So close, try again!", "#ffb300");
  } else {
    showEndMessage("Time's up! Try again.", "#e53935");
  }
}

function createModeButtons(containerId, onSelect) {
  const modes = [
    { mode: "easy", label: "Easy", color: "#00e676" },
    { mode: "normal", label: "Normal", color: "#00bfff" },
    { mode: "hard", label: "Hard", color: "#ff1744" }
  ];
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  modes.forEach(({ mode, label, color }) => {
    const btn = document.createElement('button');
    btn.className = 'mode-btn';
    btn.dataset.mode = mode;
    btn.textContent = label;
    btn.style.background = color;
    btn.style.color = "#fff";
    btn.onclick = () => onSelect(mode);
    container.appendChild(btn);
  });
}

function showModeSelector() {
  let modeSel = document.getElementById('modeSelector');
  if (!modeSel) {
    modeSel = document.createElement('div');
    modeSel.id = 'modeSelector';
    modeSel.style.display = 'flex';
    modeSel.style.justifyContent = 'center';
    modeSel.style.gap = '1em';
    modeSel.style.margin = '1em auto 0 auto';
    modeSel.style.padding = '0.5em 0';
    modeSel.style.zIndex = '20';
    modeSel.style.position = 'relative';
    // Use helper to create buttons
    document.body.appendChild(modeSel);
    createModeButtons('modeSelector', (mode) => {
      setMode(mode);
      resetGame();
    });
    // Move to container if needed
    const container = document.querySelector('.container');
    if (container && modeSel.parentNode !== container) {
      container.insertBefore(modeSel, container.firstChild);
    }
  }
}

function showModeOverlay() {
  let overlay = document.getElementById('modeOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modeOverlay';
    overlay.className = 'mode-overlay';
    overlay.innerHTML = `
      <div class="mode-overlay-content">
        <h3>Select Game Mode</h3>
        <div id="modeOverlaySelector"></div>
        <button id="closeModeOverlayBtn" style="margin-top:1.5em;">Cancel</button>
      </div>
    `;
    document.body.appendChild(overlay);
    createModeButtons('modeOverlaySelector', (mode) => {
      setMode(mode);
      hideModeOverlay();
      resetGame();
    });
    document.getElementById('closeModeOverlayBtn').onclick = hideModeOverlay;
  }
  overlay.classList.add('active');
}

function hideModeOverlay() {
  const overlay = document.getElementById('modeOverlay');
  if (overlay) overlay.classList.remove('active');
}

function resetGame() {
  score = 0;
  currentQuestion = 0;
  shuffleQuestions(questions);
  updateScoreDisplay("#00bfff");
  updateWater(0, "#00bfff");
  // Restore question and answer section
  const questionSection = document.querySelector('.question');
  const instruction = document.querySelector('.instruction');
  if (questionSection) questionSection.style.display = '';
  if (instruction) instruction.style.display = '';
  hideWinMessage();
  hideTimerDisplay();
  timeLeft = modeSettings[currentMode];
  updateTimerDisplay();
  updateQuestion();
  startTimer();
  updateHighScoreDisplay();
}

function updateQuestion() {
  const questionText = document.getElementById("questionText");
  if (currentQuestion >= questions.length) {
    stopTimer();
    hideTimerDisplay();
    // Game over
    setHighScoreIfNeeded(score);
    // ...existing code...
    const maxScore = questions.length * 10;
    const percent = score / maxScore;
    const waterFill = document.getElementById("waterFill");
    const waterColor = waterFill ? waterFill.getAttribute("fill") : "";
    // Win if 60% or higher and blue water
    if (percent >= 0.6 && waterColor === "#00bfff") {
      hideQASection();
      showWinMessage();
      showConfetti();
    } else if (percent < 0.6 && waterColor === "#00bfff") {
      hideQASection();
      showEndMessage("You didn't get it this time, but keep trying", "#ff9800");
    } else if (percent < 0.6 && waterColor === "#00ff66") {
      hideQASection();
      showEndMessage("Uh No! Try again", "#e53935");
    } else if (percent >= 0.6 && waterColor === "#00ff66") {
      hideQASection();
      showEndMessage("So close, try again", "#ffb300");
    } else {
      if (questionText) questionText.innerText = "You've completed the game!";
      hideWinMessage();
    }
    return;
  }
  hideWinMessage();
  questionText.innerText = questions[currentQuestion].text;
}

function updateWater(fillPercent, color) {
  // fillPercent: 0 (empty) to 1 (full)
  const maxHeight = 130;
  const minY = 18;
  const maxY = 148;
  const fillHeight = maxHeight * fillPercent;
  const y = maxY - fillHeight;
  const waterFill = document.getElementById("waterFill");
  const waterEllipse = document.getElementById("waterEllipse");
  waterFill.setAttribute("height", fillHeight);
  waterFill.setAttribute("y", y);
  waterFill.setAttribute("fill", color);
  waterEllipse.setAttribute("fill", color);
}

function updateScoreDrop(color) {
  // Update the drop color only (no score value)
  const dropPath = document.getElementById('scoreDropPath');
  if (dropPath) dropPath.setAttribute('fill', color);
}

function updateScoreDisplay(color = "#00bfff") {
  const badge = document.querySelector('.score-badge span');
  const scoreEl = document.getElementById('score');
  if (badge) badge.textContent = score;
  if (scoreEl) scoreEl.textContent = score;
  updateScoreDrop(color);
}

function submitAnswer(userAnswer) {
  if (currentQuestion >= questions.length) return;
  const correct = questions[currentQuestion].answer;
  let color;
  if (userAnswer === correct) {
    score += 10;
    color = "#00bfff"; // blue (fresh)
  } else {
    score = Math.max(0, score - 10);
    color = "#00ff66"; // green (dirty)
  }
  updateScoreDisplay(color);
  const maxScore = questions.length * 10;
  const percent = Math.min((score / maxScore), 1);
  updateWater(percent, color);
  currentQuestion++;
  updateQuestion();
}

// Shuffle questions array using Fisher-Yates algorithm
function shuffleQuestions(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

document.getElementById("resetBtn").onclick = function () {
  resetGame();
};

// Remove inline mode selector from top if present
function removeInlineModeSelector() {
  const modeSel = document.getElementById('modeSelector');
  if (modeSel && !modeSel.closest('.mode-overlay-content')) {
    modeSel.remove();
  }
}

// Place Change Mode button next to DisplayRules
function addChangeModeBtn() {
  let btn = document.getElementById('changeModeBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'changeModeBtn';
    btn.textContent = 'Change Mode';
    btn.type = 'button';
    btn.onclick = showModeOverlay;
    // Place next to #rulesBtn
    const rulesBtn = document.getElementById('rulesBtn');
    if (rulesBtn && rulesBtn.parentNode) {
      rulesBtn.parentNode.insertBefore(btn, rulesBtn.nextSibling);
      btn.style.display = 'inline-block';
      btn.style.marginLeft = '1em';
      btn.style.marginRight = '0';
      btn.style.width = 'auto';
      btn.style.verticalAlign = 'middle';
    } else {
      // fallback
      const container = document.querySelector('.container') || document.body;
      container.insertBefore(btn, container.firstChild.nextSibling);
    }
  }
}

window.onload = function() {
  removeInlineModeSelector();
  addChangeModeBtn();
  setMode("normal");
  updateGameTitleWithMode();
  shuffleQuestions(questions);
  updateWater(0, "#00bfff");
  updateScoreDisplay("#00bfff");
  updateQuestion();
  startTimer();
  updateHighScoreDisplay();

  // Show popup on page load
  const popup = document.getElementById("rulesPopup");
  if (popup) {
    popup.classList.add("active");
  }

  document.getElementById("rulesBtn").onclick = function () {
    if (popup) {
      popup.classList.add("active");
    }
  };

  document.getElementById("closeRulesBtn").onclick = function () {
    // User gesture: play and pause the clap sound to unlock audio for later
    let clap = document.getElementById('clap-audio');
    if (!clap) {
      clap = document.createElement('audio');
      clap.id = 'clap-audio';
      clap.src = 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3';
      clap.preload = 'auto';
      document.body.appendChild(clap);
    }
    // Unlock audio by playing and pausing on user gesture
    try {
      clap.volume = 0;
      clap.play().then(() => {
        clap.pause();
        clap.currentTime = 0;
        clap.volume = 1;
      }).catch(() => {});
    } catch {}
    if (popup) {
      popup.classList.remove("active");
    }
  };

  // Dark mode toggle
  const darkModeBtn = document.getElementById("darkModeToggle");
  darkModeBtn.onclick = function () {
    document.body.classList.toggle("dark-mode");
    // Optionally, persist dark mode in localStorage
    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("waterRushDarkMode", "1");
    } else {
      localStorage.removeItem("waterRushDarkMode");
    }
  };

  // Load dark mode preference
  if (localStorage.getItem("waterRushDarkMode") === "1") {
    document.body.classList.add("dark-mode");
  }
};
