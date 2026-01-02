// ==========================================
//  クッキークリッカー改 天界機能付き (v8.1 Fix)
// ==========================================

// ==========================================
//  翻訳データ (日本語 / 英語)
// ==========================================
let currentLang = 'en'; // 初期値

const translations = {
    ja: {
        score: "クッキー",
        perSecond: "毎秒:",
        storeTitle: "ショップ",
        labTitle: "研究所",
        "Cursor": "カーソル",
        "Grandma": "おばあちゃん",
        "Farm": "農場",
        "Mine": "鉱山",
        "Factory": "工場",
        "Bank": "銀行",
        "Temple": "寺院",
        "Wizard Tower": "魔法の塔",
        "Shipment": "ロケット便",
        "Alchemy Lab": "錬金術ラボ",
        "Portal": "ポータル"
    },
    en: {
        score: "Cookies",
        perSecond: "per second:",
        storeTitle: "Store",
        labTitle: "Laboratory",
        "Cursor": "Cursor",
        "Grandma": "Grandma"
    }
};

function t(key) {
    if (currentLang === 'en') return key;
    return translations.ja[key] || key;
}

// ==========================================
//  基本データ定義
// ==========================================
let cookies = 0;
let totalCookies = 0;
let prestigeLevel = 0;
let lifetimeCookies = 0;
let buffMultiplier = 1;
let difficulty = 1.0;
let difficultyName = "normal";
let currentTheme = "default";
let totalClicks = 0;
let startTime = Date.now();
const baseSound = new Audio('click.mp3'); // 音源ファイルが必要

// --- 実績（トロフィー）データ ---
const achievements = [
    { id: "a1", name: "Humble Beginnings", desc: "Bake 100 cookies.", icon: "🍪", unlocked: false, trigger: () => totalCookies >= 100 },
    { id: "a2", name: "Fingertastic", desc: "Click 1,000 times.", icon: "👆", unlocked: false, trigger: () => totalClicks >= 1000 },
    { id: "a3", name: "Grandma's Love", desc: "Own 10 Grandmas.", icon: "👵", unlocked: false, trigger: () => items[1].count >= 10 },
    { id: "a4", name: "Millionaire", desc: "Bake 1,000,000 cookies.", icon: "💰", unlocked: false, trigger: () => totalCookies >= 1000000 },
    { id: "a5", name: "Ascension", desc: "Prestige for the first time.", icon: "👼", unlocked: false, trigger: () => prestigeLevel > 0 }
];

// --- 天界アップグレード ---
const heavenlyUpgrades = [
    { id: "h1", name: "Heavenly Chip Secret", cost: 10, desc: "Unlocks 5% CpS bonus per chip potential.", icon: "👼", unlocked: false },
    { id: "h2", name: "Persistent Memory", cost: 100, desc: "Research is 5x faster in next life.", icon: "🧠", unlocked: false },
    { id: "h3", name: "Divine Discount", cost: 500, desc: "Buildings are 5% cheaper.", icon: "🏷️", unlocked: false },
    { id: "h4", name: "Twin Gates", cost: 1000, desc: "Cookies gain while offline (50%).", icon: "🚪", unlocked: false },
    { id: "h5", name: "Angelic Luck", cost: 5000, desc: "Golden cookies appear 2x more often.", icon: "🍀", unlocked: false }
];

// --- アイテムデータ ---
let items = [
    { name: "Cursor", cost: 15, baseCost: 15, gps: 0.1, count: 0, unlocked: true, trigger: () => true, iconStr: "👆" },
    { name: "Grandma", cost: 100, baseCost: 100, gps: 1, count: 0, unlocked: false, trigger: () => items[0].count >= 1, iconStr: "👵" },
    { name: "Farm", cost: 1100, baseCost: 1100, gps: 8, count: 0, unlocked: false, trigger: () => items[1].count >= 1, iconStr: "🌾" },
    { name: "Mine", cost: 12000, baseCost: 12000, gps: 47, count: 0, unlocked: false, trigger: () => items[2].count >= 1, iconStr: "⛏️" },
    { name: "Factory", cost: 130000, baseCost: 130000, gps: 260, count: 0, unlocked: false, trigger: () => items[3].count >= 1, iconStr: "🏭" },
    { name: "Bank", cost: 1400000, baseCost: 1400000, gps: 1400, count: 0, unlocked: false, trigger: () => items[4].count >= 1, iconStr: "🏦" },
    { name: "Temple", cost: 20000000, baseCost: 20000000, gps: 7800, count: 0, unlocked: false, trigger: () => items[5].count >= 1, iconStr: "🏛️" },
    { name: "Wizard Tower", cost: 330000000, baseCost: 330000000, gps: 44000, count: 0, unlocked: false, trigger: () => items[6].count >= 1, iconStr: "🧙‍♂️" },
    { name: "Shipment", cost: 5100000000, baseCost: 5100000000, gps: 260000, count: 0, unlocked: false, trigger: () => items[7].count >= 1, iconStr: "🚀" },
    { name: "Alchemy Lab", cost: 75000000000, baseCost: 75000000000, gps: 1600000, count: 0, unlocked: false, trigger: () => items[8].count >= 1, iconStr: "⚗️" },
    { name: "Portal", cost: 1000000000000, baseCost: 1000000000000, gps: 10000000, count: 0, unlocked: false, trigger: () => items[9].count >= 1, iconStr: "🌀" }
];

// --- スキルデータ (修正済み) ---
let skills = [
    { name: "Reinforced Index", cost: 100, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 1, iconStr: "👆", target: "Click" },
    { name: "Carpal Tunnel", cost: 500, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 10, iconStr: "👆", target: "Click" },
    { name: "Forwards from grandma", cost: 1000, desc: "Grandmas are 2x as efficient.", unlocked: false, trigger: () => items[1].count >= 1, iconStr: "👵", target: "Grandma" },
    { name: "Lucky Cookie", cost: 77777, desc: "Clicks have a 10% chance to be x10.", unlocked: false, trigger: () => totalCookies >= 7777, iconStr: "🍀", target: "Special" },
    
    // ▼ ここでカンマが抜けていました。修正済み ▼
    { name: "Cheap Hoes", cost: 11000, desc: "Farms are 2x as efficient.", unlocked: false, trigger: () => items[2].count >= 10, iconStr: "🌾", target: "Farm" },
    { name: "Fertilizer", cost: 55000, desc: "Farms are 2x as efficient.", unlocked: false, trigger: () => items[2].count >= 50, iconStr: "💩", target: "Farm" },
    { name: "Sugar Gas", cost: 120000, desc: "Mines are 2x as efficient.", unlocked: false, trigger: () => items[3].count >= 10, iconStr: "⛏️", target: "Mine" },
    { name: "Megadrill", cost: 600000, desc: "Mines are 2x as efficient.", unlocked: false, trigger: () => items[3].count >= 50, iconStr: "🔩", target: "Mine" },
    { name: "Sturdier Conveyor Belts", cost: 1300000, desc: "Factories are 2x as efficient.", unlocked: false, trigger: () => items[4].count >= 10, iconStr: "🏭", target: "Factory" },
    { name: "Gold Bullion", cost: 14000000, desc: "Banks are 2x as efficient.", unlocked: false, trigger: () => items[5].count >= 10, iconStr: "🏦", target: "Bank" },
    { name: "Golden Idols", cost: 200000000, desc: "Temples are 2x as efficient.", unlocked: false, trigger: () => items[6].count >= 10, iconStr: "🏛️", target: "Temple" },
    { name: "Grimoires", cost: 3300000000, desc: "Wizard Towers are 2x as efficient.", unlocked: false, trigger: () => items[7].count >= 10, iconStr: "🧙‍♂️", target: "Wizard Tower" },
    { name: "Vanilla Planet", cost: 51000000000, desc: "Shipments are 2x as efficient.", unlocked: false, trigger: () => items[8].count >= 10, iconStr: "🚀", target: "Shipment" },
    { name: "Antimony", cost: 750000000000, desc: "Alchemy Labs are 2x as efficient.", unlocked: false, trigger: () => items[9].count >= 10, iconStr: "⚗️", target: "Alchemy Lab" },
    { name: "Ancient Tablet", cost: 10000000000000, desc: "Portals are 2x as efficient.", unlocked: false, trigger: () => items[10] && items[10].count >= 10, iconStr: "🌀", target: "Portal" }
];

// ==========================================
//  コアゲーム機能
// ==========================================

// クッキーを追加する基本関数（これが消えていました！）
function addCookies(n) {
    cookies += n;
    totalCookies += n;
    lifetimeCookies += n;
    // ここで表示更新すると重くなるので、メインループでの更新に任せるか、
    // 数字が飛ぶ演出の時だけ呼ぶようにします。
    // 今回は整合性のため変数操作だけにします。
}

function clickCookie(event) {
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.8 + (Math.random() * 0.4);
    sound.play().catch(() => {});
    totalClicks++;

    let clickPower = 1;

    // スキル適用 (target: "Click")
    skills.forEach(skill => {
        if (skill.unlocked && skill.target === "Click") {
            clickPower *= 2;
        }
    });

    // Lucky Cookie
    const luckySkill = skills.find(s => s.name === "Lucky Cookie");
    if (luckySkill && luckySkill.unlocked && Math.random() < 0.1) {
        clickPower *= 10;
    }

    // 天界ボーナス
    let prestigeMultiplier = 1 + (prestigeLevel * (isHeavenlyUnlocked("h1") ? 0.05 : 0.01));
    
    let amount = clickPower * prestigeMultiplier * difficulty * buffMultiplier;

    addCookies(amount);
    updateDisplay(); // クリック時は即座に反映

    if (event) {
        createFloatingText(event.clientX, event.clientY, "+" + formatNumber(amount));
    }
}

function calculateGPS() {
    let totalGps = 0;
    items.forEach(item => {
        let production = item.gps * item.count;
        // スキル適用 (targetが建物名と一致するもの)
        skills.forEach(skill => {
            if (skill.unlocked && skill.target === item.name) {
                production *= 2;
            }
        });
        totalGps += production;
    });

    let prestigeMultiplier = 1 + (prestigeLevel * (isHeavenlyUnlocked("h1") ? 0.05 : 0.01));
    return totalGps * prestigeMultiplier * difficulty * buffMultiplier;
}

function isHeavenlyUnlocked(id) {
    const upgrade = heavenlyUpgrades.find(u => u.id === id);
    return upgrade ? upgrade.unlocked : false;
}

// ==========================================
//  表示・UI関連
// ==========================================

function updateDisplay() {
    document.getElementById('score').innerText = formatNumber(cookies);
    document.getElementById('cps').innerText = formatNumber(calculateGPS());
    
    // 天界チップ表示
    const pChips = document.getElementById('prestige-chips');
    if(pChips) pChips.innerText = formatNumber(prestigeLevel);
    
    const pendChips = document.getElementById('pending-chips');
    if(pendChips) {
        let pending = Math.floor(totalCookies / 1000000);
        pendChips.innerText = formatNumber(pending);
    }
    
    document.title = formatNumber(cookies) + " cookies";

    // 統計
    const statClicks = document.getElementById('stat-clicks');
    if (statClicks) {
        statClicks.innerText = totalClicks.toLocaleString();
        document.getElementById('stat-total').innerText = formatNumber(lifetimeCookies);
        let totalBuildings = items.reduce((sum, item) => sum + item.count, 0);
        document.getElementById('stat-buildings').innerText = totalBuildings.toLocaleString();
        document.getElementById('stat-time').innerText = formatTime(Date.now() - startTime);
    }
}

function createShopButtons() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = "";
    
    items.forEach((item, index) => {
        if (!item.unlocked) return;
        
        let displayCost = item.cost;
        if (isHeavenlyUnlocked("h3")) displayCost = Math.floor(displayCost * 0.95);

        const btn = document.createElement("div");
        btn.className = "store-item";
        btn.id = "shop-btn-" + index;
        
        if (cookies >= displayCost) btn.classList.add('affordable');
        
        btn.innerHTML = `
            <div class="item-icon-placeholder" style="display:flex;justify-content:center;align-items:center;font-size:30px;">${item.iconStr}</div>
            <div class="item-info">
                <div class="item-name">${t(item.name)}</div>
                <div class="item-cost">${formatNumber(displayCost)}</div>
            </div>
            <div class="item-owned">${item.count}</div>
        `;
        btn.onclick = () => buyItem(index);
        container.appendChild(btn);
    });
}

function buyItem(id) {
    const item = items[id];
    let currentCost = item.cost;
    if (isHeavenlyUnlocked("h3")) currentCost = Math.floor(currentCost * 0.95);

    if (cookies >= currentCost) {
        cookies -= currentCost;
        item.count++;
        item.cost = Math.ceil(item.baseCost * Math.pow(1.15, item.count));
        updateDisplay();
        createShopButtons();
        checkUnlocks();
        
        const sound = baseSound.cloneNode();
        sound.playbackRate = 1.0 + (id * 0.1); 
        sound.play().catch(() => {});
    }
}

function createSkillButtons() {
    const container = document.getElementById('lab-container');
    if (!container) return;
    container.innerHTML = "";
    skills.forEach((skill) => {
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

// ==========================================
//  天界・転生システム
// ==========================================

function prestige() {
    let pending = Math.floor(totalCookies / 1000000);
    if (pending <= 0) { alert("You need at least 1 million cookies baked this run to ascend!"); return; }
    
    if (confirm("Are you sure? You will reset your progress to enter the Ascension Tree.")) {
        prestigeLevel += pending;
        cookies = 0;
        totalCookies = 0;
        openAscensionScreen();
    }
}

function openAscensionScreen() {
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('ascension-screen').style.display = 'flex';
    updateAscensionDisplay();
}

function updateAscensionDisplay() {
    document.getElementById('heavenly-currency').innerText = formatNumber(prestigeLevel);
    const container = document.getElementById('heavenly-upgrades-container');
    container.innerHTML = "";

    heavenlyUpgrades.forEach(upg => {
        const node = document.createElement("div");
        node.className = "heavenly-node";
        if (upg.unlocked) node.classList.add("unlocked");
        else if (prestigeLevel >= upg.cost) node.classList.add("can-buy");

        node.innerHTML = `
            <div>${upg.icon}</div>
            <div class="tooltip">
                <strong>${upg.name}</strong><br>
                ${upg.desc}<br>
                <span style="color:${upg.unlocked ? '#fff' : '#ffcc00'}">
                    ${upg.unlocked ? 'PURCHASED' : 'Cost: ' + upg.cost + ' HC'}
                </span>
            </div>
        `;
        node.onclick = () => buyHeavenlyUpgrade(upg.id);
        container.appendChild(node);
    });
}

function buyHeavenlyUpgrade(id) {
    const upg = heavenlyUpgrades.find(u => u.id === id);
    if (upg && !upg.unlocked && prestigeLevel >= upg.cost) {
        prestigeLevel -= upg.cost;
        upg.unlocked = true;
        updateAscensionDisplay();
        saveGame();
    }
}

function finishAscension() {
    cookies = 0;
    totalCookies = 0;
    items.forEach(item => { 
        item.count = 0; 
        item.cost = item.baseCost; 
        item.unlocked = item.trigger(); 
    });
    skills.forEach(skill => skill.unlocked = false);
    checkUnlocks();

    document.getElementById('ascension-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    saveGame();
    location.reload();
}

// ==========================================
//  ユーティリティ・演出
// ==========================================

function formatNumber(num) {
    if (num < 1000000) return Math.floor(num).toLocaleString();
    const definitions = [
        { val: 1e6, suffix: ' million' }, { val: 1e9, suffix: ' billion' },
        { val: 1e12, suffix: ' trillion' }, { val: 1e15, suffix: ' quadrillion' }
    ];
    for (let i = definitions.length - 1; i >= 0; i--) {
        if (num >= definitions[i].val) return (num / definitions[i].val).toFixed(3) + definitions[i].suffix;
    }
    return num.toExponential(3);
}

function formatTime(ms) {
    let seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + "s";
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds %= 60;
    minutes %= 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'click-visual';
    el.innerText = text;
    el.style.left = (x - 20 + Math.random() * 40) + 'px'; 
    el.style.top = (y - 20) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// --- 実績チェック ---
function checkAchievements() {
    achievements.forEach(ach => {
        if (!ach.unlocked && ach.trigger()) {
            ach.unlocked = true;
            showAchievementNotification(ach);
            updateAchievementDisplay();
        }
    });
}
function showAchievementNotification(ach) {
    const notif = document.getElementById('achievement-notification');
    if(!notif) return;
    document.getElementById('ach-title').innerText = "🏆 Achievement Unlocked!";
    document.getElementById('ach-desc').innerText = ach.name;
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.5; 
    sound.play().catch(() => {});
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 4000);
}
function updateAchievementDisplay() {
    const container = document.getElementById('achievement-container');
    if (!container) return;
    container.innerHTML = "";
    achievements.forEach(ach => {
        const div = document.createElement("div");
        div.className = "achievement-list-item" + (ach.unlocked ? " unlocked" : "");
        div.innerHTML = `
            <div style="font-size:24px;">${ach.unlocked ? ach.icon : "❓"}</div>
            <div>
                <div style="font-weight:bold; font-size:12px;">${ach.unlocked ? ach.name : "???"}</div>
                <div style="font-size:10px;">${ach.unlocked ? ach.desc : "Keep playing..."}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

// ==========================================
//  セーブ & ロード
// ==========================================
function saveGame() {
    const saveData = {
        cookies: cookies,
        totalCookies: totalCookies,
        lifetimeCookies: lifetimeCookies,
        prestigeLevel: prestigeLevel,
        lastSaveTime: Date.now(),
        items: items.map(i => ({ count: i.count, unlocked: i.unlocked })), // countとunlockedだけ保存
        skills: skills.map(s => ({ unlocked: s.unlocked })),
        achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        heavenlyUpgrades: heavenlyUpgrades.map(h => ({ id: h.id, unlocked: h.unlocked })),
        difficultyMode: difficultyName === "Easy" ? 'easy' : difficultyName === "Hard" ? 'hard' : difficultyName === "V.Hard" ? 'veryhard' : 'normal',
        theme: currentTheme,
        totalClicks: totalClicks,
        startTime: startTime
    };
    localStorage.setItem("myClickerSaveV8", JSON.stringify(saveData));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("myClickerSaveV8"));
    if (data) {
        cookies = data.cookies || 0;
        totalCookies = data.totalCookies || data.cookies;
        lifetimeCookies = data.lifetimeCookies || 0;
        prestigeLevel = data.prestigeLevel || 0;
        totalClicks = data.totalClicks || 0;
        startTime = data.startTime || Date.now();

        if (data.items) {
            data.items.forEach((saved, i) => {
                if (items[i]) {
                    items[i].count = saved.count;
                    items[i].unlocked = saved.unlocked;
                    // 価格は再計算
                    items[i].cost = Math.ceil(items[i].baseCost * Math.pow(1.15, items[i].count));
                }
            });
        }
        if (data.skills) {
            data.skills.forEach((saved, i) => { if (skills[i]) skills[i].unlocked = saved.unlocked; });
        }
        if (data.achievements) {
            data.achievements.forEach(saved => {
                const ach = achievements.find(a => a.id === saved.id);
                if (ach) ach.unlocked = saved.unlocked;
            });
        }
        if (data.heavenlyUpgrades) {
            data.heavenlyUpgrades.forEach(saved => {
                const upg = heavenlyUpgrades.find(u => u.id === saved.id);
                if (upg) upg.unlocked = saved.unlocked;
            });
        }
        
        setMode(data.difficultyMode || 'normal');
        changeTheme(data.theme || 'default');
        updateAchievementDisplay();
        
        // オフラインボーナス
        if (data.lastSaveTime) {
            const now = Date.now();
            const secondsOffline = (now - data.lastSaveTime) / 1000;
            if (secondsOffline > 60) {
                let gps = calculateGPS();
                // 天界スキルh4でオフライン生産
                let rate = isHeavenlyUnlocked("h4") ? 0.5 : 0; 
                // ここではデバッグ用にh4持ってなくても少し入るようにしてもいいが、
                // 一応条件通りにするなら rate = 0;
                // 今回は「誰でも50%」のままにするなら rate = 0.5
                rate = 0.5;

                const offlineProduction = Math.floor(secondsOffline * gps * rate);
                if (offlineProduction > 0) {
                    addCookies(offlineProduction);
                    alert(`Welcome back!\nYou were gone for ${formatTime(secondsOffline * 1000)}.\nYour bakers produced ${formatNumber(offlineProduction)} cookies.`);
                }
            }
        }
    } else {
        setMode('normal');
        items[0].unlocked = true; 
    }
}

function startGame(lang) {
    currentLang = lang;
    if (document.getElementById('cookie-label')) document.getElementById('cookie-label').innerText = t("score");
    if (document.getElementById('store-title')) document.getElementById('store-title').innerText = t("storeTitle");

    createShopButtons();
    createSkillButtons();
    document.getElementById('opening-overlay').classList.add('fade-out');
}

// ==========================================
//  設定・その他
// ==========================================

function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'easy') { difficulty = 2.0; difficultyName = "Easy"; document.getElementById('mode-easy').classList.add('active'); }
    else if (mode === 'normal') { difficulty = 1.0; difficultyName = "Normal"; document.getElementById('mode-normal').classList.add('active'); }
    else if (mode === 'hard') { difficulty = 0.5; difficultyName = "Hard"; document.getElementById('mode-hard').classList.add('active'); }
    else if (mode === 'veryhard') { difficulty = 0.2; difficultyName = "V.Hard"; document.getElementById('mode-veryhard').classList.add('active'); }
    if(document.getElementById('current-mode-name')) document.getElementById('current-mode-name').innerText = difficultyName;
}

function changeTheme(themeName) {
    currentTheme = themeName;
    document.body.className = ""; 
    document.body.classList.add(themeName);
}

function resetGame() {
    if (confirm("WARNING: Wipe SAVE?")) {
        localStorage.clear();
        location.reload();
    }
}

// ==========================================
//  ゴールデンクッキー
// ==========================================
function spawnGoldenCookie() {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    const golden = document.createElement("div");
    golden.innerText = "🍪";
    golden.className = "golden-cookie";
    golden.style.left = x + "px";
    golden.style.top = y + "px";
    golden.onclick = (e) => { clickGoldenCookie(e); golden.remove(); };
    document.body.appendChild(golden);
    setTimeout(() => { if (golden.parentNode) golden.remove(); }, 15000);
    scheduleNextGoldenCookie();
}

function scheduleNextGoldenCookie() {
    let minTime = 30000; 
    let maxTime = 90000;
    if (isHeavenlyUnlocked("h5")) { minTime /= 2; maxTime /= 2; }
    const randomTime = minTime + Math.random() * (maxTime - minTime);
    setTimeout(spawnGoldenCookie, randomTime);
}

let buffTimer = null;
function clickGoldenCookie(event) {
    const sound = baseSound.cloneNode();
    sound.playbackRate = 1.5;
    sound.play().catch(() => {});

    const rand = Math.random();
    if (rand < 0.5) {
        buffMultiplier = 7;
        updateDisplay();
        createFloatingText(event.clientX, event.clientY, "Frenzy! (x7)");
        if (buffTimer) clearTimeout(buffTimer);
        buffTimer = setTimeout(() => {
            buffMultiplier = 1;
            updateDisplay();
            createFloatingText(window.innerWidth/2, window.innerHeight/2, "Frenzy ended...");
        }, 77000);
    } else {
        let gps = calculateGPS();
        let bonus = Math.max(777, gps * 900);
        addCookies(bonus);
        createFloatingText(event.clientX, event.clientY, "Lucky!");
        setTimeout(() => createFloatingText(event.clientX, event.clientY - 30, "+" + formatNumber(bonus)), 200);
    }
}

// ==========================================
//  ニュースティッカー
// ==========================================
const newsData = [
    { text: "Cookie Clicker game found to be highly addictive!", condition: () => true },
    { text: "Local bakery shortage reported due to mysterious cookie production.", condition: () => true },
    { text: "Your cookies are becoming popular in the neighborhood.", condition: () => totalCookies > 1000 },
    { text: "Cookie universe expanding rapidly!", condition: () => totalCookies > 1000000 },
    { text: "Grandmas demand higher wages and better rolling pins.", condition: () => items[1].count > 0 },
    { text: "Strange rituals observed at local retirement home.", condition: () => items[1].count > 50 },
    { text: "Scientists discover genetically modified chocolate chips.", condition: () => items[2].count > 0 },
    { text: "Your fingers must be tired by now.", condition: () => totalClicks > 1000 },
    { text: "People say they feel like they've lived this life before...", condition: () => prestigeLevel > 0 }
];

function updateNews() {
    const content = document.getElementById('news-content');
    if (!content) return;
    const availableNews = newsData.filter(n => n.condition());
    const randomNews = availableNews[Math.floor(Math.random() * availableNews.length)];
    content.style.opacity = 0;
    setTimeout(() => {
        content.innerText = randomNews.text;
        content.style.opacity = 1;
    }, 500);
}

// ==========================================
//  初期化
// ==========================================
window.onload = function() {
    loadGame();
    checkUnlocks();
    createSkillButtons(); 
    createShopButtons();
    updateDisplay();
    scheduleNextGoldenCookie();
    
    // ニュースティッカー
    setTimeout(updateNews, 1000);
    setInterval(updateNews, 10000);

    // メインループ
    setInterval(() => {
        let gps = calculateGPS();
        if (gps > 0) addCookies(gps / 10);
        updateDisplay(); // ここで定期更新を入れると滑らかになる
        checkAchievements();
    }, 100);
    
    // オートセーブ
    setInterval(saveGame, 10000);
};

window.onbeforeunload = function() {
    saveGame();
};
