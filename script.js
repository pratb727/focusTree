// --- Configuration ---
const CONFIG = {
    images: [
        "https://i.ibb.co/b5TWrWnT/seed.png",
        "https://i.ibb.co/RkvyfX9c/sapling.png",
        "https://i.ibb.co/DxDS24Z/plant.png",
        "https://i.ibb.co/bjNVZcMj/bigger-plant.png",
        "https://i.ibb.co/k27Nj0dJ/tree.png"
    ],
    wiltedImage: "https://i.ibb.co/3YMwBG1j/wilted-tree.png",
    quotes: [
        "Growth takes time.",
        "Stay rooted, keep growing.",
        "Focus feeds the soul.",
        "Silence is where ideas bloom."
    ]
};

const el = {
    timer: document.getElementById('timerDisplay'),
    slider: document.getElementById('timeSlider'),
    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    activeControls: document.getElementById('activeControls'),
    treeImg: document.getElementById('treeImage'),
    themeBtn: document.getElementById('themeToggle'),
    particleBox: document.getElementById('particleContainer'),
    streak: document.getElementById('streakCount'),
    total: document.getElementById('totalTime'),
    taskInput: document.getElementById('taskInput'),
    addBtn: document.getElementById('addTaskBtn'),
    taskList: document.getElementById('taskList'),
    quote: document.getElementById('quoteDisplay')
};

let state = {
    duration: 25 * 60,
    timeLeft: 25 * 60,
    active: false,
    paused: false,
    interval: null,
    night: false,
    streak: parseInt(localStorage.getItem('ft_streak')) || 0,
    total: parseInt(localStorage.getItem('ft_total')) || 0,
    particleInterval: null
};

// --- Init ---
function init() {
    renderStats();
    el.slider.addEventListener('input', updateTime);
    el.startBtn.addEventListener('click', start);
    el.stopBtn.addEventListener('click', () => fail("gave up"));
    el.pauseBtn.addEventListener('click', togglePause);
    el.resetBtn.addEventListener('click', resetUI);
    el.themeBtn.addEventListener('click', toggleTheme);
    el.addBtn.addEventListener('click', addTask);
    el.taskInput.addEventListener('keypress', e => e.key === 'Enter' && addTask());

    document.addEventListener("visibilitychange", () => {
        // Only fail if active AND NOT PAUSED
        if(document.hidden && state.active && !state.paused) {
            fail("distraction");
        }
    });

    el.quote.textContent = CONFIG.quotes[Math.floor(Math.random() * CONFIG.quotes.length)];
    startParticles(); 
}

// --- Timer & Tree Logic ---
function updateTime(e) {
    if(state.active) return;
    const mins = parseInt(e.target.value);
    state.duration = mins * 60;
    state.timeLeft = state.duration;
    renderTimer();
}

function renderTimer() {
    const m = Math.floor(state.timeLeft / 60);
    const s = state.timeLeft % 60;
    el.timer.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function start() {
    state.active = true;
    state.paused = false;
    
    // UI Updates
    el.slider.disabled = true;
    el.startBtn.classList.add('hidden');
    el.activeControls.classList.remove('hidden');
    el.resetBtn.classList.add('hidden');
    
    // Reset Tree to Stage 0
    updateTreeVisual(0);

    state.interval = setInterval(tick, 1000);
}

function tick() {
    if(state.paused) return;

    state.timeLeft--;
    renderTimer();
    calcTreeProgress();

    if(state.timeLeft <= 0) success();
}

function togglePause() {
    state.paused = !state.paused;
    el.pauseBtn.textContent = state.paused ? "▶" : "⏸";
    el.quote.textContent = state.paused ? "Session Paused..." : "Focus Resumed.";
}

function calcTreeProgress() {
    const progress = 1 - (state.timeLeft / state.duration);
    const index = Math.floor(progress * (CONFIG.images.length - 1));
    updateTreeVisual(index);
}

function updateTreeVisual(index) {
    // Logic to prevent reloading the same image repeatedly
    const url = CONFIG.images[index];
    if (!el.treeImg.src.includes(url)) {
        el.treeImg.style.opacity = 0;
        
        setTimeout(() => {
            el.treeImg.src = url;
            // Remove old size classes
            el.treeImg.className = 'tree-visual';
            // Add new size class (stage-0, stage-1, etc.)
            el.treeImg.classList.add(`stage-${index}`);
            el.treeImg.style.opacity = 1;
        }, 300);
    }
}

function success() {
    clearInterval(state.interval);
    state.active = false;
    
    // Ensure final giant tree
    updateTreeVisual(4); 
    
    // EXPLODE CONFETTI ONCE
    explodePetals();

    state.streak++;
    state.total += Math.floor(state.duration / 60);
    save();
    renderStats();
    
    // Show Reset Button
    el.activeControls.classList.add('hidden');
    el.resetBtn.classList.remove('hidden');
    el.quote.textContent = "Tree Fully Grown! 🌸";
}

function fail(reason) {
    clearInterval(state.interval);
    state.active = false;
    
    el.treeImg.src = CONFIG.wiltedImage;
    el.treeImg.className = 'tree-visual stage-wilted'; // Specific size for wilted
    
    state.streak = 0;
    save();
    renderStats();

    alert(reason === "distraction" ? "Distraction! Tree wilted." : "You gave up. Tree wilted.");
    
    el.activeControls.classList.add('hidden');
    el.resetBtn.classList.remove('hidden');
}

function resetUI() {
    el.slider.disabled = false;
    el.startBtn.classList.remove('hidden');
    el.resetBtn.classList.add('hidden');
    
    state.timeLeft = state.duration;
    state.paused = false;
    el.pauseBtn.textContent = "⏸";
    
    // Reset visual to Seed
    updateTreeVisual(0);
    renderTimer();
}

// --- Particles System ---
function startParticles() {
    if (state.particleInterval) clearInterval(state.particleInterval);
    state.particleInterval = setInterval(createParticle, 800);
}

function createParticle() {
    const p = document.createElement('div');
    if (state.night) {
        p.className = 'firefly';
        p.style.top = Math.random() * 80 + '%';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 3 + 2) + 's';
    } else {
        p.className = 'leaf';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.animationDuration = (Math.random() * 5 + 4) + 's';
    }
    el.particleBox.appendChild(p);
    setTimeout(() => p.remove(), 8000);
}

// --- Confetti Explosion (Pink Petals) ---
function explodePetals() {
    for(let i=0; i<80; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        // Random start position near top
        petal.style.left = Math.random() * 100 + 'vw';
        // Random colors for pink shades
        const colors = ['#ffcdd2', '#ef9a9a', '#e57373', '#ff8a80'];
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Random animation duration
        petal.style.animationDuration = (Math.random() * 3 + 2) + 's';
        petal.style.animationDelay = (Math.random() * 0.5) + 's';
        
        el.particleBox.appendChild(petal);
        
        // Remove after animation finishes
        setTimeout(() => petal.remove(), 6000);
    }
}

// --- Theme ---
function toggleTheme() {
    state.night = !state.night;
    document.body.classList.toggle('night-mode');
    el.themeBtn.querySelector('.icon').textContent = state.night ? '🌙' : '☀️';
    el.particleBox.innerHTML = ''; 
    if(state.night) generateStars();
}

function generateStars() {
    for(let i=0; i<40; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 60 + '%';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        el.particleBox.appendChild(star);
    }
}

// --- Data & Tasks ---
function save() {
    localStorage.setItem('ft_streak', state.streak);
    localStorage.setItem('ft_total', state.total);
}
function renderStats() {
    el.streak.textContent = state.streak;
    el.total.textContent = state.total;
}
function addTask() {
    const txt = el.taskInput.value.trim();
    if(!txt) return;
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `<input type="checkbox"><span>${txt}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;">×</button>`;
    li.querySelector('input').addEventListener('change', () => li.classList.toggle('done'));
    el.taskList.prepend(li);
    el.taskInput.value = '';
}

init();
