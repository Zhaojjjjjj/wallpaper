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
        language: 'zh',
        goalName: '',
        targetDate: '',
        bgColor: '#000000',
        accentColor: '#FFFFFF'
    },
    deviceResolution: { width: 1179, height: 2556 },
    autoDetectDevice: true,
    customTheme: false
};

const fallbackSupportedTypes = window.wallpaperUrlBuilder?.SUPPORTED_WALLPAPER_TYPES;
const SUPPORTED_WALLPAPER_TYPES = fallbackSupportedTypes
    ? new Set(fallbackSupportedTypes)
    : new Set([
        'year',
        'goal',
        'month',
        'week',
        'minimal',
        'gradient',
        'cyberpunk',
        'nature',
        'retro',
        'glass',
        'digital',
        'quote',
        'stats',
        'season',
        'binary',
        'moon'
    ]);
const THEME_STORAGE_KEY = 'lifegrid.theme';

const I18N_TEXT = {
    zh: {
        invalidDate: '无效的目标日期',
        daysRemaining: '剩余天数',
        defaultGoalName: '我的目标',
        yearLabel: '本年进度',
        yearRemainingDays: (days) => `今年还剩 ${days} 天`,
        monthLabel: '本月进度',
        weekLabel: '本周进度',
        quotes: [
            '时间是最公平的资源。',
            '把今天过好，就是投资未来。',
            '进步不必很快，但要持续。',
            '专注当下，结果自然到来。'
        ],
        quoteAuthor: '每日提醒',
        seasons: [
            { name: '春季', icon: '🌸' },
            { name: '夏季', icon: '☀️' },
            { name: '秋季', icon: '🍂' },
            { name: '冬季', icon: '❄️' }
        ],
        fallbackTemplate: (source, fallback) => `“${source}” 暂未支持，预览使用 ${fallback} 模板`,
        moonPhases: ['新月', '峨眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']
    },
    en: {
        invalidDate: 'Invalid target date',
        daysRemaining: 'Days Left',
        defaultGoalName: 'My Goal',
        yearLabel: 'Year Progress',
        yearRemainingDays: (days) => `${days} days left this year`,
        monthLabel: 'Month Progress',
        weekLabel: 'Week Progress',
        quotes: [
            'Time is the fairest resource.',
            'A good today compounds tomorrow.',
            'Consistency beats intensity.',
            'Focus now, outcomes follow.'
        ],
        quoteAuthor: 'Daily Reminder',
        seasons: [
            { name: 'Spring', icon: '🌸' },
            { name: 'Summer', icon: '☀️' },
            { name: 'Autumn', icon: '🍂' },
            { name: 'Winter', icon: '❄️' }
        ],
        fallbackTemplate: (source, fallback) => `"${source}" is not ready. Showing ${fallback}.`,
        moonPhases: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
    }
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
    languageSelect: document.getElementById('languageSelect'),
    goalName: document.getElementById('goalName'),
    targetDate: document.getElementById('targetDate'),
    bgColor: document.getElementById('bgColor'),
    accentColor: document.getElementById('accentColor'),
    bgColorValue: document.getElementById('bgColorValue'),
    accentColorValue: document.getElementById('accentColorValue'),
    customColors: document.getElementById('customColors'),
    themePresets: document.querySelectorAll('.theme-preset'),

    // Form rows (conditional)
    goalNameRow: document.getElementById('goalNameRow'),
    targetDateRow: document.getElementById('targetDateRow'),

    // Preview elements
    previewDevice: document.querySelector('.preview-device'),
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

const AVAILABLE_STYLE_TYPES = new Set(
    Array.from(elements.styleCards)
        .map(card => card.dataset.type)
        .filter(Boolean)
);

// ========================================
// Initialization
// ========================================
function init() {
    applySavedTheme();

    // Set default target date (7 days from now)
    const today = new Date();
    const defaultTargetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    elements.targetDate.value = formatDate(defaultTargetDate);
    state.config.targetDate = elements.targetDate.value;
    state.autoDetectDevice = elements.autoDetectDevice.checked;
    state.config.language = elements.languageSelect.value;

    updateColorInputs();
    updateFormVisibility();

    // Detect device resolution
    detectDeviceResolution();
    syncDeviceInputState();

    // Initialize preview grids
    initYearGrid();

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
            const customizeSection = document.getElementById('customize');
            if (customizeSection) {
                customizeSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Form inputs
    elements.locationSelect.addEventListener('change', (e) => {
        state.config.location = e.target.value;
        generateURL();
        renderPreview();
    });

    elements.languageSelect.addEventListener('change', (e) => {
        state.config.language = e.target.value;
        updateGoalPreview();
        generateURL();
        renderPreview();
    });

    // birthDate element removed - life calendar not implemented in this version

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

    // Theme preset selection
    elements.themePresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const bg = preset.dataset.bg;
            const accent = preset.dataset.accent;

            // Update active state
            elements.themePresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');

            if (bg === 'custom') {
                // Show custom color pickers
                state.customTheme = true;
                elements.customColors.style.display = 'flex';
                generateURL();
                renderPreview();
            } else {
                // Apply preset
                state.customTheme = false;
                state.config.bgColor = bg;
                state.config.accentColor = accent;
                elements.customColors.style.display = 'none';
                updateColorInputs();
                generateURL();
                renderPreview();
            }
        });
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

        syncDeviceInputState();
    });

    elements.customWidth.addEventListener('input', updateDeviceResolutionFromCustom);
    elements.customHeight.addEventListener('input', updateDeviceResolutionFromCustom);

    elements.autoDetectDevice.addEventListener('change', (e) => {
        state.autoDetectDevice = e.target.checked;
        if (state.autoDetectDevice) {
            detectDeviceResolution();
            // Reset select to match detected device if possible
            matchDeviceSelectToResolution();
        }

        syncDeviceInputState();
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

            const activeTab = document.getElementById(tab + 'Tab');
            if (activeTab) {
                activeTab.classList.add('active');
            }
        });
    });

    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
}

// ========================================
// Style Selection
// ========================================
function selectStyle(type) {
    if (!type || !AVAILABLE_STYLE_TYPES.has(type)) {
        console.warn('Unknown style type:', type);
        return;
    }

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
    const isGoal = state.currentType === 'goal';

    elements.goalNameRow.style.display = isGoal ? 'block' : 'none';
    elements.targetDateRow.style.display = isGoal ? 'block' : 'none';
}

// ========================================
// Preview Initialization
// ========================================
function initYearGrid() {
    const grid = elements.yearGridPreview;
    grid.innerHTML = '';

    const progress = getYearProgressData();
    const totalCells = progress.totalDays;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'year-cell';
        grid.appendChild(cell);
    }

    updateYearPreview();
}

// ========================================
// Preview Updates
// ========================================
function updateYearPreview() {
    const progress = getYearProgressData();
    const percent = progress.percent;

    const cells = elements.yearGridPreview.querySelectorAll('.year-cell');
    const filledCount = progress.daysPassed;

    cells.forEach((cell, index) => {
        cell.classList.toggle('filled', index < filledCount);
    });

    elements.yearPercent.textContent = Math.floor(percent) + '%';
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
    elements.goalNamePreview.textContent = state.config.goalName || getText('defaultGoalName');
}

// ========================================
// Main Preview Render
// ========================================
function renderPreview() {
    const screen = elements.previewScreen;
    screen.innerHTML = '';
    screen.style.backgroundColor = state.config.bgColor;
    screen.style.color = state.config.accentColor;

    const renderType = resolveRenderableType(state.currentType);

    switch (renderType) {
        case 'year':
            renderYearPreview(screen);
            break;
        case 'goal':
            renderGoalPreview(screen);
            break;
        case 'month':
            renderMonthPreview(screen);
            break;
        case 'week':
            renderWeekPreview(screen);
            break;
        case 'minimal':
            renderMinimalPreview(screen);
            break;
        case 'gradient':
            renderGradientPreview(screen);
            break;
        case 'cyberpunk':
            renderCyberpunkPreview(screen);
            break;
        case 'nature':
            renderNaturePreview(screen);
            break;
        case 'retro':
            renderRetroPreview(screen);
            break;
        case 'glass':
            renderGlassPreview(screen);
            break;
        case 'digital':
            renderDigitalPreview(screen);
            break;
        case 'quote':
            renderQuotePreview(screen);
            break;
        case 'stats':
            renderStatsPreview(screen);
            break;
        case 'season':
            renderSeasonPreview(screen);
            break;
        case 'binary':
            renderBinaryPreview(screen);
            break;
        case 'moon':
            renderMoonPreview(screen);
            break;
    }

    if (renderType !== state.currentType) {
        renderFallbackHint(screen, state.currentType, renderType);
    }
}

function renderFallbackHint(container, sourceType, fallbackType) {
    const hint = document.createElement('div');
    hint.className = 'preview-fallback-hint';
    hint.textContent = getText('fallbackTemplate', sourceType, fallbackType);
    container.appendChild(hint);
}

function renderYearPreview(container) {
    const progress = getYearProgressData();
    const percent = progress.percent;

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-year-full';
    wrapper.style.color = state.config.accentColor;

    const grid = document.createElement('div');
    grid.className = 'year-grid-full';
    const columns = 20;
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

    const totalCells = progress.totalDays;
    const filledCount = progress.daysPassed;

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
        <span class="year-label" style="color: ${state.config.accentColor}; opacity: 0.6">${getText('yearRemainingDays', progress.daysRemaining)}</span>
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
    label.textContent = getText('daysRemaining');

    const name = document.createElement('div');
    name.className = 'goal-name-full';
    name.style.color = state.config.accentColor;
    name.textContent = state.config.goalName || getText('defaultGoalName');

    wrapper.appendChild(circleWrapper);
    wrapper.appendChild(label);
    wrapper.appendChild(name);
    container.appendChild(wrapper);
}

// ========================================
// URL Generation
// ========================================
function generateURL() {
    const baseUrl = getApiBaseUrl();
    const buildFromShared = window.wallpaperUrlBuilder?.buildWallpaperImageUrl;

    const url = typeof buildFromShared === 'function'
        ? buildFromShared({
            currentType: state.currentType,
            config: state.config,
            deviceResolution: state.deviceResolution,
            baseUrl
        })
        : `${baseUrl}api/wallpaper.png?${new URLSearchParams({
            type: resolveRenderableType(state.currentType),
            bg: state.config.bgColor,
            accent: state.config.accentColor,
            lang: state.config.language,
            w: String(state.deviceResolution.width),
            h: String(state.deviceResolution.height)
        }).toString()}`;

    elements.wallpaperUrl.value = url;
}

function getApiBaseUrl() {
    const configuredBase =
        (typeof window !== 'undefined' && typeof window.WALLPAPER_API_BASE_URL === 'string' && window.WALLPAPER_API_BASE_URL.trim())
            ? window.WALLPAPER_API_BASE_URL.trim()
            : null;

    if (configuredBase) {
        return configuredBase;
    }

    const metaBase = document.querySelector('meta[name="wallpaper-api-base"]')?.getAttribute('content')?.trim();
    if (metaBase) {
        return metaBase;
    }

    return `${window.location.origin}/`;
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
    const renderType = resolveRenderableType(state.currentType);

    switch (renderType) {
        case 'year':
            drawYearWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'goal':
            drawGoalWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'month':
            drawMonthWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'week':
            drawWeekWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'minimal':
            drawMinimalWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'gradient':
            drawGradientWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'cyberpunk':
            drawCyberpunkWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'nature':
            drawNatureWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'retro':
            drawRetroWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'glass':
            drawGlassWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'digital':
            drawDigitalWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'quote':
            drawQuoteWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'stats':
            drawStatsWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'season':
            drawSeasonWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'binary':
            drawBinaryWallpaper(ctx, canvas.width, canvas.height);
            break;
        case 'moon':
            drawMoonWallpaper(ctx, canvas.width, canvas.height);
            break;
        default:
            drawYearWallpaper(ctx, canvas.width, canvas.height);
            break;
    }

    // Download
    const link = document.createElement('a');
    link.download = `lifegrid-${renderType}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function drawYearWallpaper(ctx, width, height) {
    const progress = getYearProgressData();
    const percent = progress.percent;
    const cols = 20;
    const rows = Math.ceil(progress.totalDays / cols);
    const cellSize = Math.min(width / (cols + 8), height / (rows + 16));
    const gap = Math.max(1, cellSize * 0.35);
    const gridWidth = cols * cellSize + (cols - 1) * gap;
    const gridHeight = rows * cellSize + (rows - 1) * gap;
    const startX = (width - gridWidth) / 2;
    const startY = (height - gridHeight) / 2 - height * 0.08;

    const totalCells = progress.totalDays;
    const filledCount = progress.daysPassed;

    // Draw cells
    for (let i = 0; i < totalCells; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);

        ctx.fillStyle = state.config.accentColor;
        ctx.globalAlpha = i < filledCount ? 1 : 0.2;

        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Draw percentage - better spacing
    const textY = startY + gridHeight + height * 0.12;
    ctx.fillStyle = state.config.accentColor;
    ctx.font = `bold ${Math.min(width, height) / 10}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.floor(percent)}%`, width / 2, textY);

    // Draw days remaining in year
    ctx.font = `500 ${Math.min(width, height) / 24}px Inter, sans-serif`;
    ctx.globalAlpha = 0.6;
    ctx.fillText(getText('yearRemainingDays', progress.daysRemaining), width / 2, textY + height * 0.08);
}

function drawGoalWallpaper(ctx, width, height) {
    // Use default target date if not set
    const targetDateStr = state.config.targetDate || getDefaultTargetDate();
    const targetDate = new Date(targetDateStr);

    // Validate target date
    if (isNaN(targetDate.getTime())) {
        ctx.fillStyle = state.config.bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = state.config.accentColor;
        ctx.font = `bold ${Math.min(width, height) / 15}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getText('invalidDate'), width / 2, height / 2);
        return;
    }

    const now = new Date();
    const daysRemaining = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

    // Improved layout - centered with better spacing
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 6;
    const strokeWidth = radius * 0.08;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = state.config.accentColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Draw progress arc
    const percent = Math.min(100, Math.max(0, 100 - (daysRemaining / 100) * 100));
    const endAngle = -Math.PI / 2 + (percent / 100) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
    ctx.strokeStyle = state.config.accentColor;
    ctx.globalAlpha = 1;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw days - larger and centered
    ctx.fillStyle = state.config.accentColor;
    ctx.font = `bold ${radius * 0.9}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.max(0, daysRemaining)), centerX, centerY - radius * 0.1);

    // Draw label - below the number with proper spacing
    ctx.font = `500 ${radius * 0.18}px Inter, sans-serif`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(getText('daysRemaining'), centerX, centerY + radius * 0.5);

    // Draw goal name - at the bottom with more spacing
    ctx.font = `600 ${Math.min(width * 0.06, 60)}px Inter, sans-serif`;
    ctx.globalAlpha = 1;
    ctx.fillText(state.config.goalName || getText('defaultGoalName'), centerX, height * 0.78);
}

function renderMonthPreview(container) {
    const progress = getMonthProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const bar = document.createElement('div');
    bar.className = 'simple-progress-track';
    const fill = document.createElement('div');
    fill.className = 'simple-progress-fill';
    fill.style.width = `${Math.floor(progress.percent)}%`;
    fill.style.backgroundColor = state.config.accentColor;
    bar.appendChild(fill);

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    const label = document.createElement('div');
    label.className = 'simple-label';
    label.style.color = state.config.accentColor;
    label.style.opacity = '0.7';
    label.textContent = getText('monthLabel');

    wrapper.appendChild(bar);
    wrapper.appendChild(value);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
}

function renderWeekPreview(container) {
    const progress = getWeekProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const dots = document.createElement('div');
    dots.className = 'week-dots-full';
    const filled = Math.round(progress.percent / (100 / 7));

    for (let index = 0; index < 7; index++) {
        const dot = document.createElement('span');
        dot.className = 'week-dot-full';
        dot.style.backgroundColor = state.config.accentColor;
        dot.style.opacity = index < filled ? '1' : '0.2';
        dots.appendChild(dot);
    }

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    const label = document.createElement('div');
    label.className = 'simple-label';
    label.style.color = state.config.accentColor;
    label.style.opacity = '0.7';
    label.textContent = getText('weekLabel');

    wrapper.appendChild(dots);
    wrapper.appendChild(value);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
}

function renderMinimalPreview(container) {
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const line = document.createElement('div');
    line.className = 'simple-line-track';
    const lineFill = document.createElement('div');
    lineFill.className = 'simple-line-fill';
    lineFill.style.width = `${Math.floor(progress.percent)}%`;
    lineFill.style.backgroundColor = state.config.accentColor;
    line.appendChild(lineFill);

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    wrapper.appendChild(line);
    wrapper.appendChild(value);
    container.appendChild(wrapper);
}

function renderGradientPreview(container) {
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-gradient-full';
    wrapper.style.background = `linear-gradient(135deg, ${state.config.accentColor}55 0%, ${state.config.bgColor} 100%)`;

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    wrapper.appendChild(value);
    container.appendChild(wrapper);
}

function renderCyberpunkPreview(container) {
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-cyberpunk-full';

    const grid = document.createElement('div');
    grid.className = 'cyber-grid-full';
    const cells = 49;
    const activeCount = Math.floor((progress.percent / 100) * cells);

    for (let index = 0; index < cells; index++) {
        const cell = document.createElement('div');
        cell.className = 'cyber-cell-full';
        cell.style.backgroundColor = state.config.accentColor;
        cell.style.opacity = index < activeCount ? '0.95' : '0.15';
        grid.appendChild(cell);
    }

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    wrapper.appendChild(grid);
    wrapper.appendChild(value);
    container.appendChild(wrapper);
}

function renderNaturePreview(container) {
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-gradient-full';
    wrapper.style.background = `linear-gradient(to bottom, ${state.config.accentColor}66 0%, ${state.config.bgColor} 100%)`;

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    wrapper.appendChild(value);
    container.appendChild(wrapper);
}

function renderRetroPreview(container) {
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const text = document.createElement('div');
    text.className = 'retro-text-full';
    text.style.color = state.config.accentColor;
    text.textContent = `YEAR ${Math.floor(progress.percent)}%`;

    wrapper.appendChild(text);
    container.appendChild(wrapper);
}

function renderGlassPreview(container) {
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const card = document.createElement('div');
    card.className = 'glass-card-full';

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(progress.percent)}%`;

    card.appendChild(value);
    wrapper.appendChild(card);
    container.appendChild(wrapper);
}

function renderDigitalPreview(container) {
    const now = new Date();
    const progress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const time = document.createElement('div');
    time.className = 'digital-time-full';
    time.style.color = state.config.accentColor;
    time.textContent = now.toLocaleTimeString(state.config.language === 'en' ? 'en-US' : 'zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const value = document.createElement('div');
    value.className = 'simple-label';
    value.style.color = state.config.accentColor;
    value.style.opacity = '0.7';
    value.textContent = `${getText('yearLabel')} ${Math.floor(progress.percent)}%`;

    wrapper.appendChild(time);
    wrapper.appendChild(value);
    container.appendChild(wrapper);
}

function renderQuotePreview(container) {
    const quotes = getText('quotes');
    const quote = quotes[new Date().getDate() % quotes.length];

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const text = document.createElement('div');
    text.className = 'quote-text-full';
    text.style.color = state.config.accentColor;
    text.textContent = `“${quote}”`;

    const author = document.createElement('div');
    author.className = 'simple-label';
    author.style.color = state.config.accentColor;
    author.style.opacity = '0.7';
    author.textContent = `— ${getText('quoteAuthor')}`;

    wrapper.appendChild(text);
    wrapper.appendChild(author);
    container.appendChild(wrapper);
}

function renderStatsPreview(container) {
    const yearProgress = getYearProgressData();
    const monthProgress = getMonthProgressData();
    const weekProgress = getWeekProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const stats = [
        { label: getText('yearLabel'), value: yearProgress.percent },
        { label: getText('monthLabel'), value: monthProgress.percent },
        { label: getText('weekLabel'), value: weekProgress.percent }
    ];

    stats.forEach(stat => {
        const row = document.createElement('div');
        row.className = 'stat-row-full';

        const label = document.createElement('span');
        label.className = 'stat-label-full';
        label.style.color = state.config.accentColor;
        label.style.opacity = '0.7';
        label.textContent = stat.label;

        const value = document.createElement('span');
        value.className = 'stat-value-full';
        value.style.color = state.config.accentColor;
        value.textContent = `${Math.floor(stat.value)}%`;

        row.appendChild(label);
        row.appendChild(value);
        wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
}

function renderSeasonPreview(container) {
    const season = getSeasonInfo(new Date());
    const yearProgress = getYearProgressData();

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-simple-full';

    const icon = document.createElement('div');
    icon.className = 'season-icon-full';
    icon.textContent = season.icon;

    const label = document.createElement('div');
    label.className = 'simple-label';
    label.style.color = state.config.accentColor;
    label.textContent = season.name;

    const value = document.createElement('div');
    value.className = 'simple-value';
    value.style.color = state.config.accentColor;
    value.textContent = `${Math.floor(yearProgress.percent)}%`;

    wrapper.appendChild(icon);
    wrapper.appendChild(label);
    wrapper.appendChild(value);
    container.appendChild(wrapper);
}

function renderBinaryPreview(container) {
    const now = new Date();
    const dayOfYear = getDayOfYear(now);
    const yearDays = isLeapYear(now.getFullYear()) ? 366 : 365;
    const percent = Math.min(100, Math.max(0, (dayOfYear / yearDays) * 100));

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-binary-full';

    const binary = Math.floor(percent).toString(2).padStart(8, '0');
    const binaryText = document.createElement('div');
    binaryText.className = 'binary-code-full';
    binaryText.style.color = state.config.accentColor;
    binaryText.style.opacity = '0.7';
    binaryText.textContent = binary;

    const percentText = document.createElement('div');
    percentText.className = 'binary-percent-full';
    percentText.style.color = state.config.accentColor;
    percentText.textContent = `${Math.floor(percent)}%`;

    wrapper.appendChild(binaryText);
    wrapper.appendChild(percentText);
    container.appendChild(wrapper);
}

function renderMoonPreview(container) {
    const now = new Date();
    const moonInfo = getMoonPhaseInfo(now);

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-moon-full';

    const moon = document.createElement('div');
    moon.className = 'moon-phase-full';
    moon.style.backgroundColor = state.config.accentColor;

    const shadow = document.createElement('div');
    shadow.className = 'moon-shadow-full';
    shadow.style.backgroundColor = state.config.bgColor;

    if (moonInfo.illumination >= 0.5) {
        shadow.style.width = `${Math.max(0, (1 - moonInfo.illumination) * 200)}%`;
        shadow.style.left = `${Math.max(0, moonInfo.waxing ? 50 : 0)}%`;
    } else {
        shadow.style.width = `${Math.max(0, moonInfo.illumination * 200)}%`;
        shadow.style.left = `${Math.max(0, moonInfo.waxing ? 0 : 50)}%`;
    }

    const moonName = document.createElement('div');
    moonName.className = 'moon-name-full';
    moonName.style.color = state.config.accentColor;
    moonName.style.opacity = '0.8';
    moonName.textContent = moonInfo.name;

    moon.appendChild(shadow);
    wrapper.appendChild(moon);
    wrapper.appendChild(moonName);
    container.appendChild(wrapper);
}

function drawBinaryWallpaper(ctx, width, height) {
    const now = new Date();
    const dayOfYear = getDayOfYear(now);
    const yearDays = isLeapYear(now.getFullYear()) ? 366 : 365;
    const percent = Math.min(100, Math.max(0, (dayOfYear / yearDays) * 100));
    const binary = Math.floor(percent).toString(2).padStart(8, '0');

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = state.config.accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `500 ${Math.min(width, height) / 14}px Menlo, Monaco, monospace`;
    ctx.globalAlpha = 0.7;
    ctx.fillText(binary, width / 2, height * 0.45);

    ctx.font = `bold ${Math.min(width, height) / 8}px Inter, sans-serif`;
    ctx.globalAlpha = 1;
    ctx.fillText(`${Math.floor(percent)}%`, width / 2, height * 0.58);
}

function drawMoonWallpaper(ctx, width, height) {
    const moonInfo = getMoonPhaseInfo(new Date());

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height * 0.45;
    const radius = Math.min(width, height) * 0.18;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = state.config.accentColor;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    const shadowWidth = moonInfo.illumination >= 0.5
        ? (1 - moonInfo.illumination) * 2 * radius
        : moonInfo.illumination * 2 * radius;
    const shadowX = moonInfo.illumination >= 0.5
        ? (moonInfo.waxing ? centerX : centerX - shadowWidth)
        : (moonInfo.waxing ? centerX - shadowWidth : centerX);

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(shadowX, centerY - radius, Math.max(0, shadowWidth), radius * 2);
    ctx.restore();

    ctx.fillStyle = state.config.accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.min(width, height) / 18}px Inter, sans-serif`;
    ctx.globalAlpha = 0.85;
    ctx.fillText(moonInfo.name, width / 2, height * 0.75);
    ctx.globalAlpha = 1;
}

function drawMonthWallpaper(ctx, width, height) {
    const progress = getMonthProgressData();
    drawLinearProgressWallpaper(ctx, width, height, progress.percent, getText('monthLabel'));
}

function drawWeekWallpaper(ctx, width, height) {
    const progress = getWeekProgressData();
    drawLinearProgressWallpaper(ctx, width, height, progress.percent, getText('weekLabel'));
}

function drawMinimalWallpaper(ctx, width, height) {
    const progress = getYearProgressData();
    drawLinearProgressWallpaper(ctx, width, height, progress.percent, getText('yearLabel'));
}

function drawGradientWallpaper(ctx, width, height) {
    const progress = getYearProgressData();

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `${state.config.accentColor}88`);
    gradient.addColorStop(1, state.config.bgColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    drawCenteredPercent(ctx, width, height, progress.percent, getText('yearLabel'));
}

function drawCyberpunkWallpaper(ctx, width, height) {
    const progress = getYearProgressData();

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    const cols = 16;
    const rows = 24;
    const cellSize = Math.min(width / (cols + 6), height / (rows + 10));
    const gap = cellSize * 0.35;
    const startX = (width - (cols * cellSize + (cols - 1) * gap)) / 2;
    const startY = height * 0.16;
    const totalCells = cols * rows;
    const activeCount = Math.floor((progress.percent / 100) * totalCells);

    for (let index = 0; index < totalCells; index++) {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = startX + col * (cellSize + gap);
        const y = startY + row * (cellSize + gap);

        ctx.fillStyle = state.config.accentColor;
        ctx.globalAlpha = index < activeCount ? 0.95 : 0.12;
        ctx.fillRect(x, y, cellSize, cellSize);
    }

    ctx.globalAlpha = 1;
    drawCenteredPercent(ctx, width, height, progress.percent, getText('yearLabel'));
}

function drawNatureWallpaper(ctx, width, height) {
    const progress = getYearProgressData();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, `${state.config.accentColor}99`);
    gradient.addColorStop(1, state.config.bgColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    drawCenteredPercent(ctx, width, height, progress.percent, getText('yearLabel'));
}

function drawRetroWallpaper(ctx, width, height) {
    const progress = getYearProgressData();

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = `${state.config.accentColor}55`;
    ctx.globalAlpha = 0.3;
    for (let y = 0; y < height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = state.config.accentColor;
    ctx.font = `700 ${Math.min(width, height) / 9}px Menlo, Monaco, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`YEAR ${Math.floor(progress.percent)}%`, width / 2, height / 2);
}

function drawGlassWallpaper(ctx, width, height) {
    const progress = getYearProgressData();

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    const cardWidth = width * 0.7;
    const cardHeight = height * 0.24;
    const cardX = (width - cardWidth) / 2;
    const cardY = (height - cardHeight) / 2;

    ctx.fillStyle = `${state.config.accentColor}22`;
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, Math.min(width, height) * 0.03);
    ctx.fill();

    drawCenteredPercent(ctx, width, height, progress.percent, getText('yearLabel'));
}

function drawDigitalWallpaper(ctx, width, height) {
    const now = new Date();
    const progress = getYearProgressData();

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = state.config.accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.min(width, height) / 8}px Menlo, Monaco, monospace`;
    const timeText = now.toLocaleTimeString(state.config.language === 'en' ? 'en-US' : 'zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    ctx.fillText(timeText, width / 2, height * 0.42);

    ctx.font = `500 ${Math.min(width, height) / 20}px Inter, sans-serif`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(`${getText('yearLabel')} ${Math.floor(progress.percent)}%`, width / 2, height * 0.56);
    ctx.globalAlpha = 1;
}

function drawQuoteWallpaper(ctx, width, height) {
    const quotes = getText('quotes');
    const quote = quotes[new Date().getDate() % quotes.length];

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = state.config.accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.min(width, height) / 22}px Inter, sans-serif`;
    ctx.fillText(`“${quote}”`, width / 2, height * 0.46);

    ctx.globalAlpha = 0.7;
    ctx.font = `500 ${Math.min(width, height) / 30}px Inter, sans-serif`;
    ctx.fillText(`— ${getText('quoteAuthor')}`, width / 2, height * 0.58);
    ctx.globalAlpha = 1;
}

function drawStatsWallpaper(ctx, width, height) {
    const year = getYearProgressData().percent;
    const month = getMonthProgressData().percent;
    const week = getWeekProgressData().percent;

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    const rows = [
        [getText('yearLabel'), year],
        [getText('monthLabel'), month],
        [getText('weekLabel'), week]
    ];

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const startX = width * 0.18;
    const startY = height * 0.36;
    const rowGap = height * 0.12;

    rows.forEach((row, index) => {
        const y = startY + index * rowGap;
        ctx.fillStyle = state.config.accentColor;
        ctx.globalAlpha = 0.7;
        ctx.font = `500 ${Math.min(width, height) / 28}px Inter, sans-serif`;
        ctx.fillText(row[0], startX, y);

        ctx.globalAlpha = 1;
        ctx.font = `700 ${Math.min(width, height) / 18}px Inter, sans-serif`;
        ctx.fillText(`${Math.floor(row[1])}%`, width * 0.62, y);
    });

    ctx.globalAlpha = 1;
}

function drawSeasonWallpaper(ctx, width, height) {
    const season = getSeasonInfo(new Date());
    const progress = getYearProgressData();

    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = state.config.accentColor;
    ctx.font = `${Math.min(width, height) / 6}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.fillText(season.icon, width / 2, height * 0.35);

    ctx.font = `600 ${Math.min(width, height) / 16}px Inter, sans-serif`;
    ctx.fillText(season.name, width / 2, height * 0.52);

    ctx.font = `700 ${Math.min(width, height) / 9}px Inter, sans-serif`;
    ctx.fillText(`${Math.floor(progress.percent)}%`, width / 2, height * 0.67);
}

function drawLinearProgressWallpaper(ctx, width, height, percent, label) {
    ctx.fillStyle = state.config.bgColor;
    ctx.fillRect(0, 0, width, height);

    const trackWidth = width * 0.68;
    const trackHeight = Math.max(8, Math.min(width, height) * 0.02);
    const trackX = (width - trackWidth) / 2;
    const trackY = height * 0.46;

    ctx.fillStyle = `${state.config.accentColor}33`;
    roundRect(ctx, trackX, trackY, trackWidth, trackHeight, trackHeight / 2);
    ctx.fill();

    const fillWidth = trackWidth * (Math.max(0, Math.min(100, percent)) / 100);
    ctx.fillStyle = state.config.accentColor;
    roundRect(ctx, trackX, trackY, fillWidth, trackHeight, trackHeight / 2);
    ctx.fill();

    drawCenteredPercent(ctx, width, height, percent, label);
}

function drawCenteredPercent(ctx, width, height, percent, label) {
    ctx.fillStyle = state.config.accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.min(width, height) / 8}px Inter, sans-serif`;
    ctx.fillText(`${Math.floor(percent)}%`, width / 2, height * 0.58);

    ctx.globalAlpha = 0.7;
    ctx.font = `500 ${Math.min(width, height) / 24}px Inter, sans-serif`;
    ctx.fillText(label, width / 2, height * 0.69);
    ctx.globalAlpha = 1;
}

function getYearProgressData(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.min(totalDays, Math.max(0, elapsedDays + 1));
    const daysRemaining = Math.max(0, totalDays - daysPassed);
    const percent = (daysPassed / totalDays) * 100;

    return {
        percent: Math.min(100, Math.max(0, percent)),
        totalDays,
        daysPassed,
        daysRemaining
    };
}

function getMonthProgressData(date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const percent = ((date - start) / (end - start)) * 100;

    return { percent: Math.min(100, Math.max(0, percent)) };
}

function getWeekProgressData(date = new Date()) {
    const day = date.getDay();
    const mondayOffset = (day + 6) % 7;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - mondayOffset);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const percent = ((date - start) / (end - start)) * 100;
    return { percent: Math.min(100, Math.max(0, percent)) };
}

function getSeasonInfo(date = new Date()) {
    const month = date.getMonth();
    const seasonIndex = Math.floor(((month + 1) % 12) / 3);
    const seasons = getText('seasons');
    return seasons[seasonIndex] || seasons[0];
}

function getDayOfYear(date) {
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.floor((date - yearStart) / (1000 * 60 * 60 * 24)) + 1;
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getMoonPhaseInfo(date) {
    const synodicMonth = 29.53058867;
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
    const normalized = phase / synodicMonth;

    const illumination = normalized <= 0.5 ? normalized * 2 : (1 - normalized) * 2;
    const waxing = normalized <= 0.5;
    const phaseIndex = Math.floor((normalized * 8) + 0.5) % 8;
    const phaseNames = getText('moonPhases');

    return {
        illumination,
        waxing,
        name: phaseNames[phaseIndex]
    };
}

function getText(key, ...args) {
    const locale = state.config.language === 'en' ? 'en' : 'zh';
    const dictionary = I18N_TEXT[locale] || I18N_TEXT.zh;
    const entry = dictionary[key];

    if (typeof entry === 'function') {
        return entry(...args);
    }

    return entry;
}

function resolveRenderableType(type) {
    return SUPPORTED_WALLPAPER_TYPES.has(type) ? type : 'year';
}

function updateColorInputs() {
    elements.bgColor.value = state.config.bgColor;
    elements.accentColor.value = state.config.accentColor;
    elements.bgColorValue.textContent = state.config.bgColor.toUpperCase();
    elements.accentColorValue.textContent = state.config.accentColor.toUpperCase();
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
function getDefaultTargetDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return formatDate(date);
}

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

    generateURL();
}

function syncDeviceInputState() {
    const manualMode = !state.autoDetectDevice;
    elements.deviceSelect.disabled = !manualMode;

    const customMode = manualMode && elements.deviceSelect.value === 'custom';
    elements.customWidth.disabled = !customMode;
    elements.customHeight.disabled = !customMode;
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

    updatePreviewDeviceSize(width, height);
}

function updatePreviewDeviceSize(width, height) {
    if (!elements.previewDevice || !width || !height) return;

    const maxPreviewWidth = 340;
    const maxPreviewHeight = 560;
    const minPreviewSize = 120;

    const scale = Math.min(maxPreviewWidth / width, maxPreviewHeight / height);
    const previewWidth = Math.max(minPreviewSize, Math.round(width * scale));
    const previewHeight = Math.max(minPreviewSize, Math.round(height * scale));

    elements.previewDevice.style.width = `${previewWidth}px`;
    elements.previewDevice.style.height = `${previewHeight}px`;
    elements.previewDevice.classList.toggle('landscape', width > height);
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
    updateGoalPreview();
}

function animate() {
    // Update previews periodically
    updateUI();
    setTimeout(() => requestAnimationFrame(animate), 60000); // Update every minute
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-theme');
    const nextTheme = isLight ? 'dark' : 'light';
    applyTheme(nextTheme);

    try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
        console.warn('Failed to persist theme:', error);
    }
}

function applySavedTheme() {
    let savedTheme = 'dark';

    try {
        const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedValue === 'light' || storedValue === 'dark') {
            savedTheme = storedValue;
        }
    } catch (error) {
        console.warn('Failed to read saved theme:', error);
    }

    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const isLightTheme = theme === 'light';
    document.body.classList.toggle('light-theme', isLightTheme);

    if (elements.themeToggle) {
        elements.themeToggle.setAttribute('aria-pressed', String(isLightTheme));
        elements.themeToggle.setAttribute('title', isLightTheme ? '切换到深色模式' : '切换到浅色模式');
    }
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
