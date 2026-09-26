const state = {
    recipe: null,
    stepIndex: 0,
    timerDurationSecs: 0,
    timerRemainingSecs: 0,
    timerInterval: null,
    isTimerRunning: false
};
const modal = document.getElementById('cooking-modal');
const recipeTitle = document.getElementById('modal-recipe-title');
const closeBtn = document.getElementById('modal-close-btn');
const progressBar = document.getElementById('modal-progress-bar');
const stepCounter = document.getElementById('modal-step-counter');
const stepContentView = document.getElementById('step-content-view');
const stepPill = document.getElementById('modal-step-pill');
const stepText = document.getElementById('modal-step-text');
const timerBox = document.getElementById('step-timer-box');
const timerDisplay = document.getElementById('timer-display');
const timerToggleBtn = document.getElementById('timer-toggle-btn');
const timerRestBtn = document.getElementById('timer-reset-btn');
const celebrationView = document.getElementById('celebration-view');
const finishBtn = document.getElementById('modal-finish-btn');
const navFooter = document.getElementById('modal-nav-footer');
const prevBtn = document.getElementById('modal-prev-btn');
const nextBtn = document.getElementById('modal-next-btn');

function playChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.18);
            gain.gain.setValueAtTime(0.15, now + i * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.18);
            osc.stop(now + i * 0.18 + 0.6);
        });
    } catch (err) {
        console.log("Audio notification played:", err);
    }
}
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    state.isTimerRunning = false;
    timerToggleBtn.textContent = 'Start';
}
function resetTimer() {
    stopTimer();
    state.timerRemainingSecs = state.timerDurationSecs;
    timerDisplay.textContent = formatTime(state.timerRemainingSecs);
}
function startTimer() {
    if (state.isTimerRunning) return;
    state.isTimerRunning = true;
    timerToggleBtn.textContent = 'Pause';
    state.timerInterval = setInterval(() => {
        state.timerRemainingSecs--;
        timerDisplay.textContent = formatTime(state.timerRemainingSecs);
        if (state.timerRemainingSecs <= 0) {
            stopTimer();
            playChime();
            alert("Timer finished! Check your pan.");
        }
    }, 1000);
}
function toggleTimer() {
    if (state.isTimerRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}
function renderCurrentStep() {
    stopTimer();
    const totalSteps = state.recipe.steps.length;
    const currentIndex = state.stepIndex;
    stepContentView.classList.remove('hidden');
    celebrationView.classList.add('hidden');
    navFooter.classList.remove('hidden');
    const progressPercent = Math.round(((currentIndex + 1) / totalSteps) * 100);
    progressBar.style.width = `${progressPercent}%`;
    stepCounter.textContent = `Step ${currentIndex + 1} of ${totalSteps}`;
    stepPill.textContent = `Step ${currentIndex + 1}`;
    stepText.textContent = state.recipe.steps[currentIndex];
    const timerMins = (state.recipe.timers && state.recipe.timers[currentIndex]) || 0;
    if (timerMins > 0) {
        state.timerDurationSecs = timerMins * 60;
        state.timerRemainingSecs = state.timerDurationSecs;
        timerDisplay.textContent = formatTime(state.timerRemainingSecs);
        timerBox.classList.remove('hidden');
    } else {
        timerBox.classList.add('hidden');
    }
    prevBtn.disabled = currentIndex === 0;
    nextBtn.textContent = currentIndex === totalSteps - 1 ? 'Finish Cooking' : 'Next Step →';
}
function showCelebration() {
    stepContentView.classList.add('hidden');
    navFooter.classList.add('hidden');
    celebrationView.classList.remove('hidden');
    progressBar.style.width = '100%';
    playChime();
}
export function openCookingMode(recipe) {
    state.recipe = recipe;
    state.stepIndex = 0;
    recipeTitle.textContent = recipe.title;
    modal.classList.remove('hidden');
    renderCurrentStep();
}
export function closeCookingMode() {
    stopTimer();
    modal.classList.add('hidden');
}
closeBtn.addEventListener('click', closeCookingMode);
modal.querySelector('.modal-backdrop').addEventListener('click', closeCookingMode);
finishBtn.addEventListener('click', closeCookingMode);
prevBtn.addEventListener('click', () => {
    if (state.stepIndex > 0) {
        state.stepIndex--;
        renderCurrentStep();
    }
});
nextBtn.addEventListener('click', () => {
    const totalSteps = state.recipe.steps.length;
    if (state.stepIndex < totalSteps - 1) {
        state.stepIndex++;
        renderCurrentStep();
    } else {
        showCelebration();
    }
});
timerToggleBtn.addEventListener('click', toggleTimer);
timerRestBtn.addEventListener('click', resetTimer);