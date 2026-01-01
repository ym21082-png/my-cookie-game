// ==========================================
//  クッキークリッカー改 統計機能付き (v7.1)
// ==========================================

// --- 設定データ ---
let cookies = 0;
let totalCookies = 0; // 累計（転生用兼、統計用）
let prestigeLevel = 0;
let difficulty = 1.0;
let difficultyName = "normal";
let currentTheme = "default";

// ★統計用変数
let totalClicks = 0;       // 累計クリック回数
let startTime = Date.now(); // ゲーム開始日時

// ヘルパー関数：大きな数字を短縮表示
function formatNumber(num) {
    if (num < 1000000) return Math.floor(num).toLocaleString();
    const definitions = [
        { val: 1e6, suffix: ' million' }, { val: 1e9, suffix: ' billion' },
        { val: 1e12, suffix: ' trillion' }, { val: 1e15, suffix: ' quadrillion' },
        { val: 1e18, suffix: ' quintillion' }, { val: 1e21, suffix: ' sextillion' }
    ];
    for (let i = definitions.length - 1; i >= 0; i--) {
        if (num >= definitions[i].val) {
            return (num / definitions[i].val).toFixed(3) + definitions[i].suffix;
        }
    }
    return num.toExponential(3);
}

// ヘルパー関数：秒数を「HH:MM:SS」形式に変換
function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// アイテムリスト
let items = [
    { name: "Cursor", cost: 15, gps: 0.1, count: 0, unlocked: true, trigger: () => true, iconStr: "👆" },
    { name: "Grandma", cost: 100, gps: 1, count: 0, unlocked: false, trigger: () => items[0].count >= 1, iconStr: "👵" },
    { name: "Farm", cost: 1100, gps: 8, count: 0, unlocked: false, trigger: () => items[1].count >= 1, iconStr: "🌾" },
    { name: "Mine", cost: 12000, gps: 47, count: 0, unlocked: false, trigger: () => items[2].count >= 1, iconStr: "⛏️" },
    { name: "Factory", cost: 130000, gps: 260, count: 0, unlocked: false, trigger: () => items[3].count >= 1, iconStr: "🏭" },
    { name: "Bank", cost: 1400000, gps: 1400, count: 0, unlocked: false, trigger: () => items[4].count >= 1, iconStr: "🏦" },
    { name: "Temple", cost: 20000000, gps: 7800, count: 0, unlocked: false, trigger: () => items[5].count >= 1, iconStr: "🏛️" },
    { name: "Wizard Tower", cost: 330000000, gps: 44000, count: 0, unlocked: false, trigger: () => items[6].count >= 1, iconStr: "🧙‍♂️" },
    { name: "Shipment", cost: 5100000000, gps: 260000, count: 0, unlocked: false, trigger: () => items[7].count >= 1, iconStr: "🚀" },
    { name: "Alchemy Lab", cost: 75000000000, gps: 1600000, count: 0, unlocked: false, trigger: () => items[8].count >= 1, iconStr: "⚗️" },
    { name: "Portal", cost: 1000000000000, gps: 10000000, count: 0, unlocked: false, trigger: () => items[9].count >= 1, iconStr: "🌀" },
    { name: "Time Machine", cost: 14000000000000, gps: 65000000, count: 0, unlocked: false, trigger: () => items[10].count >= 1, iconStr: "⏳" },
    { name: "Antimatter", cost: 170000000000000, gps: 430000000, count: 0, unlocked: false, trigger: () => items[11].count >= 1, iconStr: "⚛️" },
    { name: "Prism", cost: 2100000000000000, gps: 2900000000, count: 0, unlocked: false, trigger: () => items[12].count >= 1, iconStr: "🌈" },
    { name: "Chancemaker", cost: 26000000000000000, gps: 21000000000, count: 0, unlocked: false, trigger: () => items[13].count >= 1, iconStr: "🎲" },
    { name: "Fractal Engine", cost: 310000000000000000, gps: 150000000000, count: 0, unlocked: false, trigger: () => items[14].count >= 1, iconStr: "💠" },
    { name: "Java Console", cost: 71000000000000000000, gps: 1100000000000, count: 0, unlocked: false, trigger: () => items[15].count >= 1, iconStr: "💻" },
    { name: "Idleverse", cost: 12000000000000000000000, gps: 8300000000000, count: 0, unlocked: false, trigger: () => items[16].count >= 1, iconStr: "🌌" },
    { name: "Cortex Baker", cost: 1900000000000000000000000, gps: 64000000000000, count: 0, unlocked: false, trigger: () => items[17].count >= 1, iconStr: "🧠" },
    { name: "You", cost: 540000000000000000000000000, gps: 510000000000000, count: 0, unlocked: false, trigger: () => items[18].count >= 1, iconStr: "🫵" }
];

// 研究所リスト
let skills = [
    { name: "Reinforced Index", cost: 100, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 1, iconStr: "👆" },
    { name: "Carpal Tunnel", cost: 500, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 10, iconStr: "👆" },
    { name: "Ambidextrous", cost: 10000, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 50, iconStr: "👆" },
    { name: "Forwards from grandma", cost: 1000, desc: "Grandmas are 2x as efficient.", unlocked: false, trigger: () => items[1].count >= 1, iconStr: "👵" },
    { name: "Steel-plated rolling pins", cost: 5000, desc: "Grandmas are 2x as efficient.", unlocked: false, trigger: () => items[1].count >= 10, iconStr: "👵" },
    { name: "Lubricated dentures", cost: 50000, desc: "Grandmas are 2x as efficient.", unlocked: false, trigger: () => items[1].count >= 50, iconStr: "👵" },
    { name: "Lucky Cookie", cost: 77777, desc: "Clicks have a 10% chance to be x10.", unlocked: false, trigger: () => totalCookies >= 7777, iconStr: "🍀" },
    { name: "Heavenly chip secret", cost: 1000000, desc: "CpS +5% per Heavenly Chip (instead of 10%).", unlocked: false, trigger: () => prestigeLevel >= 1, iconStr: "👼" }
];

const baseSound = new Audio('click.mp3');

// --- メイン機能 ---

function clickCookie() {
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.8 + (Math.random() * 0.4);
    sound.play().catch(() => {});

    // ★統計：クリック数を加算
    totalClicks++;

    let clickPower = 1;
    if (skills[0].unlocked) clickPower *= 2;
    if (skills[1].unlocked) clickPower *= 2;
    if (skills[2].unlocked) clickPower *= 2;
    if (skills[6].unlocked && Math.random() < 0.1) clickPower *= 10;

    let prestigeMultiplier = 1 + (prestigeLevel * 0.1);
    if (skills[7].unlocked) prestigeMultiplier = 1 + (prestigeLevel * 0.05);

    addCookies(clickPower * prestigeMultiplier * difficulty);
}

function addCookies(amount) {
    cookies += amount;
    totalCookies += amount;
    updateDisplay();
    checkUnlocks();
}

function calculateGPS() {
    let totalGps = 0;
    items.forEach(item => {
        let production = item.gps * item.count;
        if (item.name === "Grandma") {
            if (skills[3].unlocked) production *= 2;
            if (skills[4].unlocked) production *= 2;
            if (skills[5].unlocked) production *= 2;
        }
        if (item.name === "Cursor" && item.count > 0) {
             let nonCursorBuildings = 0;
             items.forEach(i => { if(i.name !== "Cursor") nonCursorBuildings += i.count; });
             production += Math.floor(nonCursorBuildings / 10) * item.count;
        }
        totalGps += production;
    });

    let prestigeMultiplier = 1 + (prestigeLevel * 0.1);
    if (skills[7].unlocked) prestigeMultiplier = 1 + (prestigeLevel * 0.05);

    return totalGps * prestigeMultiplier * difficulty;
}

function updateDisplay() {
    document.getElementById('score').innerText = formatNumber(cookies);
    document.getElementById('cps').innerText = formatNumber(calculateGPS());
    
    document.getElementById('prestige-chips').innerText = formatNumber(prestigeLevel);
    document.getElementById('prestige-effect').innerText = formatNumber(Math.floor(prestigeLevel * (skills[7].unlocked ? 5 : 10)));
    document.title = formatNumber(cookies) + " cookies";

    // ★統計情報の更新処理
    const statClicks = document.getElementById('stat-clicks');
    const statTotal = document.getElementById('stat-total');
    const statTime = document.getElementById('stat-time');
    const statBuildings = document.getElementById('stat-buildings');

    if (statClicks) {
        statClicks.innerText = totalClicks.toLocaleString();
        statTotal.innerText = formatNumber(totalCookies);
        
        let totalBuildings = items.reduce((sum, item) => sum + item.count, 0);
        statBuildings.innerText = totalBuildings.toLocaleString();

        let elapsed = Date.now() - startTime;
        statTime.innerText = formatTime(elapsed);
    }

    // ストアのボタン更新
    items.forEach((item, i) => {
        if (!item.unlocked) return;
        const btn = document.getElementById("shop-btn-" + i);
        if (btn) {
            btn.querySelector('.item-cost').innerText = formatNumber(item.cost);
            btn.querySelector('.item-owned').innerText = item.count;
            if (cookies >= item.cost) btn.classList.add('affordable');
            else btn.classList.remove('affordable');
        }
    });
}

// --- アンロック確認システム ---
function checkUnlocks() {
    let changed = false;
    items.forEach(item => {
        if (!item.unlocked && item.trigger()) {
            item.unlocked = true;
            changed = true;
        }
    });
    if (changed) {
        createShopButtons();
        createSkillButtons();
    }
}

// --- ゲームシステム ---
function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'easy') { difficulty = 2.0; difficultyName = "Easy"; document.getElementById('mode-easy').classList.add('active'); }
    else if (mode === 'normal') { difficulty = 1.0; difficultyName = "Normal"; document.getElementById('mode-normal').classList.add('active'); }
    else if (mode === 'hard') { difficulty = 0.5; difficultyName = "Hard"; document.getElementById('mode-hard').classList.add('active'); }
    else if (mode === 'veryhard') { difficulty = 0.2; difficultyName = "V.Hard"; document.getElementById('mode-veryhard').classList.add('active'); }
    document.getElementById('current-mode-name').innerText = difficultyName;
}
function changeTheme(themeName) {
    currentTheme = themeName;
    document.body.className = ""; 
    document.body.classList.add(themeName);
}
function prestige() {
    if (totalCookies < 1000000) { alert("You need 1 million total cookies to ascend!"); return; }
    if (confirm("Are you sure you want to ascend?")) {
        let earnedChips = Math.floor(totalCookies / 1000000);
        prestigeLevel += earnedChips;
        
        // 転生時のリセット
        cookies = 0;
        totalCookies = 0;
        items.forEach(item => { item.count = 0; item.cost = getInitialCost(item.name); item.unlocked = item.trigger(); });
        skills.forEach(skill => skill.unlocked = false);
        
        // 統計は維持する（リセットしたい場合は下記を有効化）
        // totalClicks = 0; startTime = Date.now();
        
        saveGame();
        location.reload();
    }
}
const initialCosts = items.map(i => i.cost);
function getInitialCost(name) {
    let idx = items.findIndex(i => i.name === name);
    return idx !== -1 ? initialCosts[idx] : 99999999;
}

// --- ボタン生成機能 ---
function createShopButtons() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item, index) => {
        if (!item.unlocked) return;
        const btn = document.createElement("div");
        btn.className = "store-item";
        btn.id = "shop-btn-" + index;
        btn.innerHTML = `
            <div class="item-icon-placeholder" style="display:flex;justify-content:center;align-items:center;font-size:30px;">${item.iconStr}</div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-cost">${formatNumber(item.cost)}</div>
            </div>
            <div class="item-owned">${item.count}</div>
        `;
        btn.onclick = () => {
            if (cookies >= item.cost) {
                cookies -= item.cost;
                item.count++;
                item.cost = Math.ceil(item.cost * 1.15);
                updateDisplay();
                checkUnlocks();
            }
        };
        container.appendChild(btn);
    });
}

function createSkillButtons() {
    const container = document.getElementById('lab-container');
    if (!container) return;
    container.innerHTML = "";
    skills.forEach((skill, index) => {
        if (!skill.unlocked && skill.trigger()) {
            const btn = document.createElement("div");
            btn.className = "skill-icon";
            btn.innerHTML = `<div style="font-size:30px;text-align:center;line-height:46px;">${skill.iconStr}</div>`;
            const tooltip = document.createElement("div");
            tooltip.className = "tooltip";
            tooltip.innerHTML = `
                <div style="font-weight:bold;margin-bottom:5px;">${skill.name}</div>
                <div style="font-size:0.9em;margin-bottom:5px;">${skill.desc}</div>
                <div style="color:${cookies >= skill.cost ? '#66cdaa' : '#f44336'};font-weight:bold;">Price: ${formatNumber(skill.cost)}</div>
            `;
            btn.appendChild(tooltip);
            if (cookies >= skill.cost) btn.classList.add('affordable');
            btn.onclick = () => {
                if (cookies >= skill.cost) {
                    cookies -= skill.cost;
                    skill.unlocked = true;
                    updateDisplay();
                    createSkillButtons();
                }
            };
            container.appendChild(btn);
        }
    });
}

// --- セーブ＆ロード＆リセット ---
function saveGame() {
    const saveData = {
        cookies: cookies,
        totalCookies: totalCookies,
        prestigeLevel: prestigeLevel,
        items: items.map(i => ({ count: i.count, cost: i.cost, unlocked: i.unlocked })),
        skills: skills.map(s => ({ unlocked: s.unlocked })),
        difficultyMode: difficultyName === "Easy" ? 'easy' : difficultyName === "Hard" ? 'hard' : difficultyName === "V.Hard" ? 'veryhard' : 'normal',
        theme: currentTheme,
        
        // ★統計データの保存
        totalClicks: totalClicks,
        startTime: startTime
    };
    localStorage.setItem("myClickerSaveV7", JSON.stringify(saveData));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("myClickerSaveV7"));
    if (data) {
        cookies = data.cookies || 0;
        totalCookies = data.totalCookies || data.cookies;
        prestigeLevel = data.prestigeLevel || 0;
        
        // ★統計データの読み込み
        totalClicks = data.totalClicks || 0;
        startTime = data.startTime || Date.now();

        if (data.items) {
            data.items.forEach((saved, i) => {
                if (items[i]) { items[i].count = saved.count; items[i].cost = saved.cost; items[i].unlocked = saved.unlocked; }
            });
        }
        if (data.skills) {
            data.skills.forEach((saved, i) => {
                if (skills[i]) skills[i].unlocked = saved.unlocked;
            });
        }
        setMode(data.difficultyMode || 'normal');
        changeTheme(data.theme || 'default');
    } else {
        setMode('normal');
        changeTheme('default');
        items[0].unlocked = true; 
    }
}

function resetGame() {
    if (confirm("WARNING: Do you want to WIPE your entire save file?")) {
        let id = window.setInterval(function() {}, 0); while (id--) window.clearInterval(id);
        localStorage.clear();
        localStorage.setItem("myClickerSaveV7", null);
        alert("Save file wiped.");
        location.reload();
    }
}

// --- エンジン始動 ---
window.onload = function() {
    loadGame();
    checkUnlocks();
    createSkillButtons(); 
    createShopButtons();
    updateDisplay();

    setInterval(() => {
        let gps = calculateGPS();
        addCookies(gps / 10);
    }, 100);
    setInterval(saveGame, 10000);
};
