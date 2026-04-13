const typingAreaEl = document.getElementById("typingArea");
const startBtn = document.getElementById("startBtn");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const cpmEl = document.getElementById("cpm");
const accuracyEl = document.getElementById("accuracy");
const errorsEl = document.getElementById("errors");
const themeCheckbox = document.getElementById("checkbox");
const overlayEl = document.getElementById("overlay");
const progressFillEl = document.getElementById("progressFill");

const DURATION = 60;
let timeLeft = DURATION;
let intervalId = null;
let started = false;
let currentPrompt = "";

const paragraphs = [
  "Typing is a skill that improves with practice. Focus on accuracy, then speed.",
  "A clean and minimal interface helps you concentrate on the content you type.",
  "Modern web apps are responsive and accessible, making them easy to use for everyone.",
  "Consistency in spacing and punctuation is important for clear communication.",
  "Soft shadows and rounded corners can make interfaces feel welcoming and calm.",
  "Short sentences are quicker to type, but longer ones test your rhythm and focus.",
  "When you make a mistake, keep going; speed comes from steady typing habits.",
  "Typing with proper posture reduces fatigue and keeps your hands comfortable.",
  "Accuracy matters more than raw speed; clean input leads to better results.",
  "Good tools get out of your way and let you focus on the task at hand.",
  "Practice daily, review your progress, and push yourself gently to improve.",
  "Every keystroke counts; aim for consistency and clarity in your typing.",
  "Small improvements compound over time; celebrate each step forward.",
  "Clear goals and steady effort make difficult tasks feel manageable.",
  "Take breaks to reset your focus and keep your hands relaxed.",
  "Breathe calmly and find a typing rhythm that feels natural.",
  "Fast typing is useful, but precise typing is essential.",
  "Good ergonomics reduce strain and help you type longer without discomfort.",
  "Typing in short bursts can be more effective than long sessions.",
  "Keep your wrists level and your shoulders relaxed as you type.",
  "A quiet environment can help you concentrate on the words in front of you.",
  "Train your fingers to move smoothly across the keys without looking down.",
  "Focus on the next character, not the last mistake; keep moving.",
  "Give your eyes a rest by looking away from the screen occasionally.",
  "Muscle memory builds with repetition; choose prompts that challenge you.",
  "Track your progress with numbers, but trust how the typing feels too.",
  "Warm up with easy sentences before tackling complex punctuation.",
  "A steady tempo helps reduce errors and increases confidence.",
  "Stretch your fingers gently before long typing sessions to avoid stiffness.",
  "Use all your fingers; the home row is your anchor and guide.",
  "Correcting errors quickly is good, but avoid stopping for every slip.",
  "Over time, your typing becomes smoother and more consistent.",
  "Challenge yourself with longer prompts to build endurance and focus.",
  "Mix technical words and common phrases to balance speed and accuracy.",
  "Listen to soft music if it helps you relax while practicing.",
  "Set a timer and aim for clean input rather than rushing.",
  "Typing tests are snapshots; steady practice paints the bigger picture.",
  "You control your pace; slow down slightly to reduce mistakes.",
  "Typing is both mental and physical; treat your body kindly.",
  "Use clear punctuation to make the text easy to read later.",
  "Stay patient; consistency beats short bursts of heavy effort.",
  "Each session is a chance to learn and refine your technique.",
  "Type phrases that feel fun to write; enjoyment fuels progress.",
  "Breathe, focus, and let your fingers do the steady work.",
  "A calm mind and relaxed posture make typing smoother.",
  "Repetition turns tricky words into familiar movements.",
  "Pick prompts that stretch your skills but don't frustrate you.",
  "Measure accuracy first, then increase speed at a comfortable rate.",
  "Light practice every day beats heavy practice once a week.",
  "Typing is a craft; treat every keystroke with simple care.",
  "Good posture supports speed, accuracy, and long-term comfort.",
  "Your progress is real even if the numbers move slowly.",
  "Focus on clean input and the speed will follow naturally.",
  "Keep the keyboard clean and the workspace uncluttered.",
  "Consistency, patience, and clarity make for excellent typing.",
  "Challenge your accuracy with punctuation and varied spacing.",
  "Every prompt is a new opportunity to improve.",
  "Relax your jaw and shoulders; tension slows the hands.",
  "Listen to your body and stop before fatigue sets in.",
  "Practice with joy and kindness; the results will come.",
  "Aim for steady output; flowing text beats hurried mistakes.",
  "Trust your training and let your fingers find the keys.",
  "Typing skill grows quietly through consistent daily effort."
];

function chooseParagraph() {
  const idx = Math.floor(Math.random() * paragraphs.length);
  return paragraphs[idx];
}

function setPrompt() {
  currentPrompt = chooseParagraph();
  renderOverlay();
}

function formatSeconds(sec) {
  return `${sec}s`;
}

function resetStatsUI() {
  timerEl.textContent = formatSeconds(DURATION);
  wpmEl.textContent = "0";
  cpmEl.textContent = "0";
  accuracyEl.textContent = "100%";
  errorsEl.textContent = "0";
}

function computeStats(typed, reference, elapsedSeconds) {
  const typedLen = typed.length;
  let errorCount = 0;
  const compareLen = Math.min(typedLen, reference.length);
  for (let i = 0; i < compareLen; i++) {
    if (typed[i] !== reference[i]) errorCount++;
  }
  if (typedLen > reference.length) {
    errorCount += typedLen - reference.length;
  }
  const correctChars = Math.max(typedLen - errorCount, 0);
  const accuracy = typedLen === 0 ? 100 : Math.max(0, (correctChars / typedLen) * 100);
  let wpm = 0;
  let cpm = 0;
  if (elapsedSeconds > 0) {
    const minutes = elapsedSeconds / 60;
    wpm = Math.round((correctChars / 5) / minutes);
    cpm = Math.round(correctChars / minutes);
  }
  return { errorCount, accuracy, wpm, cpm };
}

function updateStats() {
  const typed = typingAreaEl.value;
  const reference = currentPrompt || "";
  const elapsed = started ? DURATION - timeLeft : 0;
  const { errorCount, accuracy, wpm, cpm } = computeStats(typed, reference, elapsed);
  errorsEl.textContent = String(errorCount);
  accuracyEl.textContent = `${Math.round(accuracy)}%`;
  wpmEl.textContent = String(wpm);
  cpmEl.textContent = String(cpm);
  // Update progress fill
  const refLen = Math.max(reference.length, 1);
  const pct = Math.min(typed.length / refLen, 1) * 100;
  if (progressFillEl) {
    progressFillEl.style.width = `${pct}%`;
  }
  renderOverlay();

  // Auto-finish when the prompt is fully and exactly typed
  if (started && reference.length > 0 && typed.length >= reference.length) {
    endTest();
  }
}

function startTest() {
  if (started) return;
  started = true;
  timeLeft = DURATION;
  typingAreaEl.disabled = false;
  typingAreaEl.value = "";
  typingAreaEl.focus();
  timerEl.textContent = formatSeconds(timeLeft);
  updateStats();
  updateStartButtonLabel();
  if (progressFillEl) progressFillEl.style.width = "0%";
  intervalId = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      timerEl.textContent = formatSeconds(timeLeft);
      endTest();
      return;
    }
    timerEl.textContent = formatSeconds(timeLeft);
    updateStats();
  }, 1000);
}

function endTest() {
  started = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  typingAreaEl.disabled = true;
  const typed = typingAreaEl.value;
  const reference = currentPrompt || "";
  const elapsed = DURATION - timeLeft;
  const { errorCount, accuracy } = computeStats(typed, reference, Math.max(elapsed, 1));
  if (progressFillEl) progressFillEl.style.width = "100%";
  updateStartButtonLabel();
}

function restartTest() {
  started = false;
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  timeLeft = DURATION;
  typingAreaEl.value = "";
  typingAreaEl.disabled = true;
  setPrompt();
  resetStatsUI();
  updateStartButtonLabel();
  if (progressFillEl) progressFillEl.style.width = "0%";
}

startBtn.addEventListener("click", () => {
  if (started) {
    endTest();
  } else {
    startTest();
  }
});
typingAreaEl.addEventListener("input", updateStats);

function applySavedTheme() {
  const saved = localStorage.getItem("theme") || "light";
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeCheckbox.checked = false;
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeCheckbox.checked = true;
  }
}

themeCheckbox.addEventListener("change", () => {
  if (themeCheckbox.checked) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
});

applySavedTheme();
resetStatsUI();
// Show a random prompt
setPrompt();

// --- overlay rendering ---
function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[c] || c);
}

function renderOverlay() {
  const typed = typingAreaEl.value;
  const ref = currentPrompt || "";
  let html = "";
  const maxLen = Math.max(typed.length, ref.length);
  for (let i = 0; i < maxLen; i++) {
    const refChar = ref[i];
    const typedChar = typed[i];
    if (i < typed.length) {
      if (refChar !== undefined) {
        if (typedChar === refChar) {
          html += `<span class="correct">${escapeHtml(refChar)}</span>`;
        } else {
          html += `<span class="wrong">${escapeHtml(refChar)}</span>`;
        }
      } else {
        // extra typed beyond reference
        html += `<span class="wrong">${escapeHtml(typedChar)}</span>`;
      }
    } else {
      if (refChar !== undefined) {
        html += `<span class="remaining">${escapeHtml(refChar)}</span>`;
      }
    }
  }
  overlayEl.innerHTML = html;
}

document.addEventListener("keydown", (e) => {

  if (!started && typingAreaEl.disabled && e.key === "Enter") {
    e.preventDefault();
    startTest();
    return;
  }

  if (started && e.key === "Enter") {
    e.preventDefault();
    endTest();
  }
});

// --- start button label helper ---
function updateStartButtonLabel() {
  startBtn.textContent = started ? "Stop (Enter)" : "Start Test (Enter)";
}

// Initialize label explicitly
updateStartButtonLabel();
