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

function updateQuestion() {
  const questionText = document.getElementById("questionText");
  if (currentQuestion >= questions.length) {
    // Game over
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
  updateQuestion();
};

window.onload = function() {
  shuffleQuestions(questions);
  updateWater(0, "#00bfff");
  updateScoreDisplay("#00bfff");
  updateQuestion();

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
