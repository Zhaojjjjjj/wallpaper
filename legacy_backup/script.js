/**
 * LifeGrid - Time Visualization Wallpapers
 * Main JavaScript functionality
 */

// ========================================
// State Management
// ========================================
const state = {
    currentType: 'year',
    config: {
        location: 'Asia/Shanghai',
        birthDate: '',
        lifespan: 80,
        goalName: '',
        targetDate: '',
        bgColor: '#000000',
        accentColor: '#FFFFFF'
    },
    deviceResolution: { width: 1179, height: 2556 },
    autoDetectDevice: true
};

// ========================================
// DOM Elements
// ========================================
const elements = {
    // Style cards
    styleCards: document.querySelectorAll('.style-card'),
    selectButtons: document.querySelectorAll('.btn-select'),

    // Form elements
    locationSelect: document.getElementById('locationSelect'),
    birthDate: document.getElementById('birthDate'),
    lifespan: document.getElementById('lifespan'),
    goalName: document.getElementById('goalName'),
    targetDate: document.getElementById('targetDate'),
    bgColor: document.getElementById('bgColor'),
    accentColor: document.getElementById('accentColor'),
    bgColorValue: document.getElementById('bgColorValue'),
    accentColorValue: document.getElementById('accentColorValue'),

    // Form rows (conditional)
    birthDateRow: document.getElementById('birthDateRow'),
    lifespanRow: document.getElementById('lifespanRow'),
    goalNameRow: document.getElementById('goalNameRow'),
    targetDateRow: document.getElementById('targetDateRow'),

    // Preview elements
    previewScreen: document.getElementById('previewScreen'),
    deviceResolution: document.getElementById('deviceResolution'),
    devicePixelRatio: document.getElementById('devicePixelRatio'),
    deviceType: document.getElementById('deviceType'),
    deviceAspectRatio: document.getElementById('deviceAspectRatio'),

    // Device selection
    deviceSelect: document.getElementById('deviceSelect'),
    customResolutionRow: document.getElementById('customResolutionRow'),
    customWidth: document.getElementById('customWidth'),
    customHeight: document.getElementById('customHeight'),
    autoDetectDevice: document.getElementById('autoDetectDevice'),

    // URL generator
    wallpaperUrl: document.getElementById('wallpaperUrl'),
    copyUrlBtn: document.getElementById('copyUrlBtn'),
    downloadBtn: document.getElementById('downloadBtn'),

    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Canvas
    canvas: document.getElementById('wallpaperCanvas'),

    // Preview grids
    yearGridPreview: document.getElementById('yearGridPreview'),
    yearPercent: document.getElementById('yearPercent'),
    lifeGridPreview: document.getElementById('lifeGridPreview'),
    lifeWeeks: document.getElementById('lifeWeeks'),
    lifeRemaining: document.getElementById('lifeRemaining'),
    goalCircle: document.getElementById('goalCircle'),
    goalProgressCircle: document.getElementById('goalProgressCircle'),
    goalDays: document.getElementById('goalDays'),
    goalNamePreview: document.getElementById('goalNamePreview'),

    // Category buttons
    categoryBtns: document.querySelectorAll('.category-btn'),
    styleGrids: document.querySelectorAll('.styles-grid'),

    // Theme
    themeToggle: document.getElementById('themeToggle')
};

// ========================================
// Initialization
// ========================================
function init() {
    // Set default dates
    const today = new Date();
    const defaultBirthDate = new Date(today.getFullYear() - 25, 0, 1);
    elements.birthDate.value = formatDate(defaultBirthDate);

    const defaultTargetDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    elements.targetDate.value = formatDate(defaultTargetDate);

    // Update state
    state.config.birthDate = elements.birthDate.value;
    state.config.targetDate = elements.targetDate.value;

    // Detect device resolution
    detectDeviceResolution();

    // Initialize preview grids
    initYearGrid();
    initLifeGrid();

    // Initial render
    updateUI();
    generateURL();
    renderPreview();

    // Bind events
    bindEvents();

    // Start animation loop
    animate();
}

// ========================================
// Event Binding
// ========================================
function bindEvents() {
    // Style selection
    elements.styleCards.forEach(card => {
        card.addEventListener('click', () => {
            selectStyle(card.dataset.type);
        });
    });

    elements.selectButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectStyle(btn.dataset.type);
            document.getElementById('customize').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Form inputs
    elements.locationSelect.addEventListener('change', (e) => {
        state.config.location = e.target.value;
        generateURL();
        renderPreview();
    });

    elements.birthDate.addEventListener('change', (e) => {
        state.config.birthDate = e.target.value;
        updateLifePreview();
        generateURL();
        renderPreview();
    });

    elements.lifespan.addEventListener('input', (e) => {
        state.config.lifespan = parseInt(e.target.value) || 80;
        updateLifePreview();
        generateURL();
        renderPreview();
    });

    elements.goalName.addEventListener('input', (e) => {
        state.config.goalName = e.target.value;
        updateGoalPreview();
        generateURL();
        renderPreview();
    });

    elements.targetDate.addEventListener('change', (e) => {
        state.config.targetDate = e.target.value;
        updateGoalPreview();
        generateURL();
        renderPreview();
    });

    elements.bgColor.addEventListener('input', (e) => {
        state.config.bgColor = e.target.value;
        elements.bgColorValue.textContent = e.target.value.toUpperCase();
        generateURL();
        renderPreview();
    });

    elements.accentColor.addEventListener('input', (e) => {
        state.config.accentColor = e.target.value;
        elements.accentColorValue.textContent = e.target.value.toUpperCase();
        generateURL();
        renderPreview();
    });

    // Device selection
    elements.deviceSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            elements.customResolutionRow.classList.remove('hidden');
            updateDeviceResolutionFromCustom();
        } else {
            elements.customResolutionRow.classList.add('hidden');
            const [width, height] = value.split(',').map(Number);
            state.deviceResolution = { width, height };
            updateDeviceInfoDisplay();
            generateURL();
            renderPreview();
        }
    });

    elements.customWidth.addEventListener('input', updateDeviceResolutionFromCustom);
    elements.customHeight.addEventListener('input', updateDeviceResolutionFromCustom);

    elements.autoDetectDevice.addEventListener('change', (e) => {
        state.autoDetectDevice = e.target.checked;
        if (state.autoDetectDevice) {
            detectDeviceResolution();
            // Reset select to match detected device if possible
            matchDeviceSelectToResolution();
        } else {
            // Enable manual selection
            elements.deviceSelect.disabled = false;
        }
    });

    // URL copy
    elements.copyUrlBtn.addEventListener('click', copyURL);

    // Download
    elements.downloadBtn.addEventListener('click', downloadWallpaper);

    // Category tabs
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            // Update buttons
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update grids
            elements.styleGrids.forEach(grid => {
                grid.classList.toggle('active', grid.dataset.category === category);
            });
        });
    });

    // Tabs
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });

    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// ========================================
// Style Selection
// ========================================
function selectStyle(type) {
    state.currentType = type;

    // Update cards
    elements.styleCards.forEach(card => {
        card.classList.toggle('active', card.dataset.type === type);
    });

    // Update form visibility
    updateFormVisibility();

    // Update previews
    updateUI();
    renderPreview();
    generateURL();
}

function updateFormVisibility() {
    const isLife = state.currentType === 'life';
    const isGoal = state.currentType === 'goal';

    elements.birthDateRow.style.display = isLife ? 'block' : 'none';
    elements.lifespanRow.style.display = isLife ? 'block' : 'none';
    elements.goalNameRow.style.display = isGoal ? 'block' : 'none';
    elements.targetDateRow.style.display = isGoal ? 'block' : 'none';
}

// ========================================
// Preview Initialization
// ========================================
function initYearGrid() {
    const grid = elements.yearGridPreview;
    grid.innerHTML = '';

    // Create 52 cells (4 rows x 13 columns for weeks)
    for (let i = 0; i < 52; i++) {
        const cell = document.createElement('div');
        cell.className = 'year-cell';
        grid.appendChild(cell);
    }

    updateYearPreview();
}

function initLifeGrid() {
    const grid = elements.lifeGridPreview;
    grid.innerHTML = '';

    // Create 160 cells (8 rows x 20 columns for a sample)
    for (let i = 0; i < 160; i++) {
        const cell = document.createElement('div');
        cell.className = 'life-cell';
        grid.appendChild(cell);
    }

    updateLifePreview();
}

// ========================================
// Preview Updates
// ========================================
function updateYearPreview() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - startOfYear) / (1000 * 60 * 60 * 24);
    const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    const cells = elements.yearGridPreview.querySelectorAll('.year-cell');
    const filledCount = Math.floor((percent / 100) * cells.length);

    cells.forEach((cell, index) => {
        cell.classList.toggle('filled', index < filledCount);
    });

    elements.yearPercent.textContent = Math.floor(percent) + '%';
}

function updateLifePreview() {
    if (!state.config.birthDate) return;

    const birthDate = new Date(state.config.birthDate);
    const now = new Date();
    const lifespanWeeks = state.config.lifespan * 52;

    const weeksLived = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24 * 7));
    const weeksRemaining = Math.max(0, lifespanWeeks - weeksLived);

    elements.lifeWeeks.textContent = weeksLived.toLocaleString();
    elements.lifeRemaining.textContent = weeksRemaining.toLocaleString();

    const cells = elements.lifeGridPreview.querySelectorAll('.life-cell');
    const totalCells = cells.length;
    const filledCount = Math.min(totalCells, Math.floor((weeksLived / lifespanWeeks) * totalCells));

    cells.forEach((cell, index) => {
        cell.classList.remove('filled', 'current');
        if (index < filledCount) {
            cell.classList.add('filled');
        } else if (index === filledCount) {
            cell.classList.add('current');
        }
    });
}

function updateGoalPreview() {
    if (!state.config.targetDate) return;

    const targetDate = new Date(state.config.targetDate);
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

    const totalDays = (targetDate - startDate) / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, (now - startDate) / (1000 * 60 * 60 * 24));

    const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;

    elements.goalProgressCircle.style.strokeDasharray = circumference;
    elements.goalProgressCircle.style.strokeDashoffset = offset;
    elements.goalDays.textContent = Math.max(0, daysRemaining);
    elements.goalNamePreview.textContent = state.config.goalName || '目标';
}

// ========================================
// Main Preview Render
// ========================================
function renderPreview() {
    const screen = elements.previewScreen;
    screen.innerHTML = '';
    screen.style.backgroundColor = state.config.bgColor;
    screen.style.color = state.config.accentColor;

    switch (state.currentType) {
        case 'year':
            renderYearPreview(screen);
            break;
        case 'life':
            renderLifePreview(screen);
            break;
        case 'goal':
            renderGoalPreview(screen);
            break;
    }
}

function renderYearPreview(container) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - startOfYear) / (1000 * 60 * 60 * 24);
    const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-year-full';
    wrapper.style.color = state.config.accentColor;

    const grid = document.createElement('div');
    grid.className = 'year-grid-full';

    // 10 rows x 13 columns = 130 cells (approximate weeks)
    const totalCells = 130;
    const filledCount = Math.floor((percent / 100) * totalCells);

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'year-cell';
        cell.style.backgroundColor = state.config.accentColor;
        cell.style.opacity = i < filledCount ? '1' : '0.2';
        grid.appendChild(cell);
    }

    const info = document.createElement('div');
    info.className = 'year-info';
    info.innerHTML = `
        <span class="year-percent" style="color: ${state.config.accentColor}">${Math.floor(percent)}%</span>
        <span class="year-label" style="color: ${state.config.accentColor}; opacity: 0.6">${now.getFullYear()}</span>
    `;

    wrapper.appendChild(grid);
    wrapper.appendChild(info);
    container.appendChild(wrapper);
}

function renderLifePreview(container) {
    if (!state.config.birthDate) return;

    const birthDate = new Date(state.config.birthDate);
    const now = new Date();
    const lifespanWeeks = state.config.lifespan * 52;

    const weeksLived = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24 * 7));
    const weeksRemaining = Math.max(0, lifespanWeeks - weeksLived);

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-life-full';
    wrapper.style.color = state.config.accentColor;

    const grid = document.createElement('div');
    grid.className = 'life-grid-full';

    // 40 rows x 26 columns = 1040 cells (20 years worth of weeks as sample)
    const displayWeeks = Math.min(520, lifespanWeeks); // Show ~10 years at a time
    const cols = 26;
    const rows = Math.ceil(displayWeeks / cols);

    for (let i = 0; i < displayWeeks; i++) {
        const cell = document.createElement('div');
        cell.className = 'life-cell';
        cell.style.backgroundColor = state.config.accentColor;

        if (i < weeksLived) {
            cell.style.opacity = '1';
        } else if (i === weeksLived) {
            cell.style.opacity = '1';
            cell.style.boxShadow = `0 0 4px ${state.config.accentColor}`;
        } else {
            cell.style.opacity = '0.2';
        }

        grid.appendChild(cell);
    }

    const info = document.createElement('div');
    info.className = 'life-info';
    info.innerHTML = `
        <div class="life-text" style="color: ${state.config.accentColor}; opacity: 0.6">
            ${weeksLived.toLocaleString()} / ${lifespanWeeks.toLocaleString()} 周
        </div>
    `;

    wrapper.appendChild(grid);
    wrapper.appendChild(info);
    container.appendChild(wrapper);
}

function renderGoalPreview(container) {
    if (!state.config.targetDate) return;

    const targetDate = new Date(state.config.targetDate);
    const now = new Date();
    const startDate = new Date(targetDate.getTime() - 100 * 24 * 60 * 60 * 1000); // 100 days before

    const totalDays = (targetDate - startDate) / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, (now - startDate) / (1000 * 60 * 60 * 24));
    const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-goal-full';
    wrapper.style.color = state.config.accentColor;

    const circleWrapper = document.createElement('div');
    circleWrapper.className = 'goal-circle-full';

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percent / 100) * circumference;

    circleWrapper.innerHTML = `
        <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="${state.config.accentColor}" stroke-width="6" opacity="0.2"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="${state.config.accentColor}" stroke-width="6"
                stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                transform="rotate(-90 50 50)"/>
        </svg>
        <div class="goal-days-full" style="color: ${state.config.accentColor}">${Math.max(0, daysRemaining)}</div>
    `;

    const label = document.createElement('div');
    label.className = 'goal-label-full';
    label.style.color = state.config.accentColor;
    label.style.opacity = '0.6';
    label.textContent = '剩余天数';

    const name = document.createElement('div');
    name.className = 'goal-name-full';
    name.style.color = state.config.accentColor;
    name.textContent = state.config.goalName || '目标';

    wrapper.appendChild(circleWrapper);
    wrapper.appendChild(label);
    wrapper.appendChild(name);
    container.appendChild(wrapper);
}

// ========================================
// URL Generation
// ========================================
function generateURL() {
    const params = new URLSearchParams({
        type: state.currentType,
        bg: state.config.bgColor,
        accent: state.config.accentColor
    });

    if (state.currentType === 'life') {
        params.set('birth', state.config.birthDate);
        params.set('lifespan', state.config.lifespan);
    } else if (state.currentType === 'goal') {
        params.set('target', state.config.targetDate);
        if (state.config.goalName) {
            params.set('name', state.config.goalName);
        }
    }

    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    const url = `${baseUrl}wallpaper.html?${params.toString()}`;

    elements.wallpaperUrl.value = url;
}

async function copyURL() {
    try {
        await navigator.clipboard.writeText(elements.wallpaperUrl.value);
        elements.copyUrlBtn.classList.add('copied');
        elements.copyUrlBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            已复制
        `;

        setTimeout(() => {
            elements.copyUrlBtn.classList.remove('copied');
            elements.copyUrlBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                复制
            `;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('复制失败，请手动复制');
    }
}

// ========================================
// Wallpaper Download
// ========================================
function downloadWallpaper() {
    const canvas = elements.canvas;
    const ctx = canvas.getContext('2d');

    // Set canvas size to device resolution
    canvas.width = state.deviceResolution.width;
    canvas.height = state.deviceResolution.height;

    // Fill background
    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render based on type
    switch (state.currentType) {
        case 'year':
            drawYearWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'life':
            drawLifeWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'goal':
            drawGoalWallpaper(ctx, canvas.width, canvas.height);
            break;
    }

    // Download
    const link = document.createElement('a');
    link.download = `lifegrid-${state.currentType}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function drawYearWallpaper(ctx, width, height) {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - startOfYear) / (1000 * 60 * 60 * 24);
    const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    // Grid settings
    const cols = 13;
    const rows = 10;
    const cellSize = Math.min(width, height) / 25;
    const gap = cellSize * 0.3;
    const gridWidth = cols * cellSize + (cols - 1) * gap;
    const gridHeight = rows * cellSize + (rows - 1) * gap;
    const startX = (width - gridWidth) / 2;
    const startY = (height - gridHeight) / 2 - 100;

    const totalCells = cols * rows;
    const filledCount = Math.floor((percent / 100) * totalCells);

    // Draw cells
    for (let i = 0; i < totalCells; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);

        ctx.fillStyle = state.config.accentColor;
        ctx.globalAlpha = i < filledCount ? 1 : 0.2;

        roundRect(ctx, x, y, cellSize, cellSize, cellSize * 0.2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Draw percentage
    ctx.fillStyle = state.config.accentColor;
    ctx.font = `bold ${Math.min(width, height) / 8}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.floor(percent)}%`, width / 2, startY + gridHeight + 150);

    // Draw year
    ctx.font = `500 ${Math.min(width, height) / 25}px Inter, sans-serif`;
    ctx.globalAlpha = 0.6;
    ctx.fillText(String(now.getFullYear()), width / 2, startY + gridHeight + 220);
}

function drawLifeWallpaper(ctx, width, height) {
    if (!state.config.birthDate) return;

    const birthDate = new Date(state.config.birthDate);
    const now = new Date();
    const lifespanWeeks = state.config.lifespan * 52;
    const weeksLived = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24 * 7));

    // Grid settings - show all weeks
    const cols = 52;
    const rows = Math.ceil(lifespanWeeks / cols);
    const cellSize = Math.min(width / (cols + 4), height / (rows + 8));
    const gap = cellSize * 0.15;
    const gridWidth = cols * cellSize + (cols - 1) * gap;
    const gridHeight = rows * cellSize + (rows - 1) * gap;
    const startX = (width - gridWidth) / 2;
    const startY = (height - gridHeight) / 2;

    // Draw cells
    for (let i = 0; i < lifespanWeeks; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);

        ctx.fillStyle = state.config.accentColor;

        if (i < weeksLived) {
            ctx.globalAlpha = 1;
        } else if (i === weeksLived) {
            ctx.globalAlpha = 1;
            ctx.shadowColor = state.config.accentColor;
            ctx.shadowBlur = cellSize;
        } else {
            ctx.globalAlpha = 0.2;
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;

    // Draw stats
    ctx.fillStyle = state.config.accentColor;
    ctx.font = `500 ${Math.min(width, height) / 30}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.6;
    ctx.fillText(`${weeksLived.toLocaleString()} / ${lifespanWeeks.toLocaleString()} 周`, width / 2, height - 100);
}

function drawGoalWallpaper(ctx, width, height) {
    if (!state.config.targetDate) return;

    const targetDate = new Date(state.config.targetDate);
    const now = new Date();
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

    const centerX = width / 2;
    const centerY = height / 2 - 50;
    const radius = Math.min(width, height) / 5;
    const strokeWidth = radius * 0.15;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = state.config.accentColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Draw progress arc (simplified - just a partial arc)
    const percent = Math.min(100, Math.max(0, 100 - (daysRemaining / 100) * 100));
    const endAngle = -Math.PI / 2 + (percent / 100) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
    ctx.strokeStyle = state.config.accentColor;
    ctx.globalAlpha = 1;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw days
    ctx.fillStyle = state.config.accentColor;
    ctx.font = `bold ${radius}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.max(0, daysRemaining)), centerX, centerY);

    // Draw label
    ctx.font = `500 ${radius * 0.25}px Inter, sans-serif`;
    ctx.globalAlpha = 0.6;
    ctx.fillText('剩余天数', centerX, centerY + radius + 40);

    // Draw goal name
    ctx.font = `600 ${radius * 0.3}px Inter, sans-serif`;
    ctx.globalAlpha = 1;
    ctx.fillText(state.config.goalName || '目标', centerX, centerY + radius + 90);
}

// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// ========================================
// Utilities
// ========================================
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function detectDeviceResolution() {
    // Get actual screen resolution
    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;
    const pixelRatio = window.devicePixelRatio;

    state.deviceResolution = {
        width: Math.round(width),
        height: Math.round(height)
    };

    updateDeviceInfoDisplay();

    // Update custom inputs
    elements.customWidth.value = Math.round(width);
    elements.customHeight.value = Math.round(height);

    // Try to match with known devices
    if (state.autoDetectDevice) {
        matchDeviceSelectToResolution();
    }
}

function updateDeviceInfoDisplay() {
    const { width, height } = state.deviceResolution;
    const pixelRatio = window.devicePixelRatio;

    // Resolution
    elements.deviceResolution.textContent = `${width} × ${height}`;

    // Pixel ratio
    elements.devicePixelRatio.textContent = `${pixelRatio}x (@${Math.round(pixelRatio * 160)}ppi)`;

    // Device type detection
    const deviceType = detectDeviceType(width, height, pixelRatio);
    elements.deviceType.textContent = deviceType;

    // Aspect ratio
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const aspectW = width / divisor;
    const aspectH = height / divisor;
    const aspectRatio = (width / height).toFixed(2);
    elements.deviceAspectRatio.textContent = `${aspectW}:${aspectH} (${aspectRatio})`;
}

function detectDeviceType(width, height, pixelRatio) {
    // iPhone 17 Series (2025)
    const iphone17Models = {
        '1320,2868': 'iPhone 17 Pro Max',
        '1290,2796': 'iPhone 17 Pro / Plus',
        '1179,2556': 'iPhone 17 / 17 Slim'
    };

    // iPhone 16 Series (2024)
    const iphone16Models = {
        '1320,2868': 'iPhone 16 Pro Max',
        '1206,2622': 'iPhone 16 Pro',
        '1179,2556': 'iPhone 16 / 16 Plus'
    };

    // iPhone 15 Series (2023)
    const iphone15Models = {
        '1290,2796': 'iPhone 15 Pro Max / 15 Plus',
        '1179,2556': 'iPhone 15 Pro / 15'
    };

    // iPhone 14/13/12 Series
    const iphone14Models = {
        '1290,2796': 'iPhone 14 Pro Max',
        '1179,2556': 'iPhone 14 Pro',
        '1284,2778': 'iPhone 14 Plus / 13 Pro Max',
        '1170,2532': 'iPhone 14/13/12 Pro / 13/12',
        '1080,2340': 'iPhone 13/12 mini'
    };

    // iPhone X/XS/11 Series
    const iphoneXModels = {
        '1242,2688': 'iPhone 11 Pro Max / XS Max',
        '1125,2436': 'iPhone 11 Pro / XS / X',
        '828,1792': 'iPhone 11 / XR'
    };

    // iPhone SE/8/7
    const iphoneLegacyModels = {
        '750,1334': 'iPhone SE (3rd/2nd) / 8 / 7 / 6s',
        '1080,1920': 'iPhone 8 Plus / 7 Plus'
    };

    // Check all iPhone models
    const key1 = `${width},${height}`;
    const key2 = `${height},${width}`;

    if (iphone17Models[key1] || iphone17Models[key2]) return iphone17Models[key1] || iphone17Models[key2];
    if (iphone16Models[key1] || iphone16Models[key2]) return iphone16Models[key1] || iphone16Models[key2];
    if (iphone15Models[key1] || iphone15Models[key2]) return iphone15Models[key1] || iphone15Models[key2];
    if (iphone14Models[key1] || iphone14Models[key2]) return iphone14Models[key1] || iphone14Models[key2];
    if (iphoneXModels[key1] || iphoneXModels[key2]) return iphoneXModels[key1] || iphoneXModels[key2];
    if (iphoneLegacyModels[key1] || iphoneLegacyModels[key2]) return iphoneLegacyModels[key1] || iphoneLegacyModels[key2];

    // iPad Pro M4/M2
    const ipadProModels = {
        '2064,2752': 'iPad Pro 13" (M4)',
        '1668,2388': 'iPad Pro 11" (M4/M2)',
        '2048,2732': 'iPad Pro 12.9" (M2)'
    };

    if (ipadProModels[key1] || ipadProModels[key2]) return ipadProModels[key1] || ipadProModels[key2];

    // iPad Air / mini
    if ((width === 1640 && height === 2360) || (width === 2360 && height === 1640)) {
        return 'iPad Air 11"/13" (M2)';
    }
    if ((width === 1488 && height === 2266) || (width === 2266 && height === 1488)) {
        return 'iPad mini (A17 Pro)';
    }
    if ((width === 1620 && height === 2160) || (width === 2160 && height === 1620)) {
        return 'iPad Air 5 / iPad mini 6 / iPad 10/9';
    }

    // MacBook
    const macbookModels = {
        '3024,1964': 'MacBook Pro 14" (M3/M4)',
        '3456,2234': 'MacBook Pro 16" (M3/M4)',
        '2880,1864': 'MacBook Air 15" (M3)',
        '2560,1664': 'MacBook Air 13" (M3/M2)'
    };

    if (macbookModels[key1] || macbookModels[key2]) return macbookModels[key1] || macbookModels[key2];

    // iMac / Studio Display
    if ((width === 5120 && height === 2880) || (width === 2880 && height === 5120)) {
        return 'iMac 27" / Studio Display 5K';
    }
    if ((width === 4480 && height === 2520) || (width === 2520 && height === 4480)) {
        return 'iMac 24" (M3) 4.5K';
    }
    if ((width === 4096 && height === 2304) || (width === 2304 && height === 4096)) {
        return 'Pro Display XDR';
    }

    // Android Flagships (2024-2025)
    const androidFlagships = {
        '1440,3200': 'Samsung S25 Ultra / S24 Ultra / OnePlus 13',
        '1080,2340': 'Samsung S25/S24/S23 / iPhone 13/12 mini',
        '1440,3120': 'Google Pixel 9 Pro XL',
        '1080,2424': 'Google Pixel 9 Pro / 9',
        '1440,3168': 'Xiaomi 15 Pro / 14 Ultra',
        '1200,2670': 'Xiaomi 15 / 14',
        '1264,2780': 'vivo X200 Pro / X100 Ultra'
    };

    if (androidFlagships[key1] || androidFlagships[key2]) return androidFlagships[key1] || androidFlagships[key2];

    // Foldable devices
    const foldableDevices = {
        '1812,2176': 'Samsung Galaxy Z Fold 6 (内屏)',
        '904,2316': 'Samsung Galaxy Z Fold 6 (外屏)',
        '1080,2640': 'Samsung Galaxy Z Flip 6 (内屏)',
        '2076,2152': 'Google Pixel 9 Pro Fold (内屏)',
        '2156,2156': 'OnePlus Open (内屏)',
        '1116,2484': 'Xiaomi MIX Fold 4 (内屏)',
        '1316,2832': 'Huawei Mate X6 (内屏)'
    };

    if (foldableDevices[key1] || foldableDevices[key2]) return foldableDevices[key1] || foldableDevices[key2];

    // Desktop detection
    if (width >= 5120) return '5K 显示器';
    if (width >= 3840) return '4K UHD 显示器';
    if (width >= 3440) return 'UltraWide 显示器';
    if (width >= 2560) return '2K QHD 显示器';
    if (width >= 1920) return 'Full HD 显示器';

    // Android detection by aspect ratio
    const aspectRatio = width / height;
    if (aspectRatio > 2) return 'Android (超宽屏)';
    if (aspectRatio > 0.4 && aspectRatio < 0.6) return 'Android (手机)';
    if (aspectRatio > 1.3 && aspectRatio < 1.4) return 'Android (平板)';

    return '未知设备';
}

function matchDeviceSelectToResolution() {
    const { width, height } = state.deviceResolution;
    const options = Array.from(elements.deviceSelect.options);

    // Find matching option
    const matchingOption = options.find(opt => {
        if (opt.value === 'custom') return false;
        const [optW, optH] = opt.value.split(',').map(Number);
        return (optW === width && optH === height) || (optW === height && optH === width);
    });

    if (matchingOption) {
        elements.deviceSelect.value = matchingOption.value;
        elements.customResolutionRow.classList.add('hidden');
    } else {
        elements.deviceSelect.value = 'custom';
        elements.customResolutionRow.classList.remove('hidden');
    }
}

function updateDeviceResolutionFromCustom() {
    if (elements.deviceSelect.value !== 'custom') return;

    const width = parseInt(elements.customWidth.value) || 1179;
    const height = parseInt(elements.customHeight.value) || 2556;

    state.deviceResolution = { width, height };
    updateDeviceInfoDisplay();
    generateURL();
    renderPreview();
}

function updateUI() {
    updateYearPreview();
    updateLifePreview();
    updateGoalPreview();
}

function animate() {
    // Update previews periodically
    updateUI();
    setTimeout(() => requestAnimationFrame(animate), 60000); // Update every minute
}

function toggleTheme() {
    // Simple theme toggle - could be expanded
    document.body.classList.toggle('light-theme');
}

// ========================================
// Initialize on load
// ========================================
document.addEventListener('DOMContentLoaded', init);

// Handle resize (only if auto-detect is enabled)
window.addEventListener('resize', () => {
    if (state.autoDetectDevice) {
        detectDeviceResolution();
    }
});
