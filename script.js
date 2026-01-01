// ==========================================
//  クッキークリッカー改 天界機能付き (v8.0)
// ==========================================
// ==========================================
//  翻訳データ (日本語 / 英語)
// ==========================================
let currentLang = 'en'; // 初期値
// --- 実績（トロフィー）データ ---
const achievements = [
    { id: "a1", name: "Humble Beginnings", desc: "Bake 100 cookies.", icon: "🍪", unlocked: false, trigger: () => totalCookies >= 100 },
    { id: "a2", name: "Fingertastic", desc: "Click 1,000 times.", icon: "👆", unlocked: false, trigger: () => totalClicks >= 1000 },
    { id: "a3", name: "Grandma's Love", desc: "Own 10 Grandmas.", icon: "👵", unlocked: false, trigger: () => items[1].count >= 10 },
    { id: "a4", name: "Millionaire", desc: "Bake 1,000,000 cookies.", icon: "💰", unlocked: false, trigger: () => totalCookies >= 1000000 },
    { id: "a5", name: "Ascension", desc: "Prestige for the first time.", icon: "👼", unlocked: false, trigger: () => prestigeLevel > 0 }
];

// 実績チェック関数
function checkAchievements() {
    achievements.forEach(ach => {
        if (!ach.unlocked && ach.trigger()) {
            ach.unlocked = true;
            showAchievementNotification(ach); // 通知を出す
            updateAchievementDisplay(); // リスト表示を更新
        }
    });
}
function showAchievementNotification(ach) {
    const notif = document.getElementById('achievement-notification');
    document.getElementById('ach-title').innerText = "🏆 Achievement Unlocked!";
    document.getElementById('ach-desc').innerText = ach.name;
    
    // 音を鳴らす（既存の音を流用、少し音程を変える）
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.5; 
    sound.play().catch(() => {});

    // 表示クラスをつけてスライドイン
    notif.classList.add('show');

    // 4秒後に隠す
    setTimeout(() => {
        notif.classList.remove('show');
    }, 4000);
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
const translations = {
    ja: {
        score: "クッキー",
        perSecond: "毎秒:",
        storeTitle: "ショップ",
        labTitle: "研究所",
        // アイテム名
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
        "Portal": "ポータル",
        // スキル名（一部例）
        "Reinforced Index": "強化人差し指",
        "Carpal Tunnel": "手根管症候群",
        "Forwards from grandma": "おばあちゃんの支援",
        "Lucky Cookie": "ラッキークッキー"
    },
    en: {
        score: "Cookies",
        perSecond: "per second:",
        storeTitle: "Store",
        labTitle: "Laboratory",
        // 英語はそのまま返すので空でも良いが、念のため
        "Cursor": "Cursor",
        "Grandma": "Grandma"
        // ...他はキーと同じなら省略可能
    }
};

// 翻訳ヘルパー関数
function t(key) {
    if (currentLang === 'en') return key; // 英語ならそのまま
    return translations.ja[key] || key;   // 日本語辞書になければそのまま
}

let cookies = 0;
let totalCookies = 0; // 今回の人生の累計
let prestigeLevel = 0; // 所持している天界チップ（通貨）
let lifetimeCookies = 0; // 全人生の累計（統計用）
let buffMultiplier = 1; // バフ倍率（通常は1、確変中は7になる）

// ★天界アップグレードのデータ
// id: 識別子, name: 名前, cost: 価格, desc: 説明, icon: 絵文字
const heavenlyUpgrades = [
    { id: "h1", name: "Heavenly Chip Secret", cost: 10, desc: "Unlocks 5% CpS bonus per chip potential.", icon: "👼", unlocked: false },
    { id: "h2", name: "Persistent Memory", cost: 100, desc: "Research is 5x faster in next life.", icon: "🧠", unlocked: false },
    { id: "h3", name: "Divine Discount", cost: 500, desc: "Buildings are 5% cheaper.", icon: "🏷️", unlocked: false },
    { id: "h4", name: "Twin Gates", cost: 1000, desc: "Cookies gain while offline (50%).", icon: "🚪", unlocked: false },
    { id: "h5", name: "Angelic Luck", cost: 5000, desc: "Golden cookies appear 2x more often.", icon: "🍀", unlocked: false }
];

let difficulty = 1.0;
let difficultyName = "normal";
let currentTheme = "default";
let totalClicks = 0;
let startTime = Date.now();

// --- ヘルパー関数 ---
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
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- アイテム & スキルデータ ---
// ★ baseCost を追加して、価格計算が狂わないようにしました
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

let skills = [
    { name: "Reinforced Index", cost: 100, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 1, iconStr: "👆" },
    { name: "Carpal Tunnel", cost: 500, desc: "Clicking is 2x as efficient.", unlocked: false, trigger: () => items[0].count >= 10, iconStr: "👆" },
    { name: "Forwards from grandma", cost: 1000, desc: "Grandmas are 2x as efficient.", unlocked: false, trigger: () => items[1].count >= 1, iconStr: "👵" },
    { name: "Lucky Cookie", cost: 77777, desc: "Clicks have a 10% chance to be x10.", unlocked: false, trigger: () => totalCookies >= 7777, iconStr: "🍀" }
];

const baseSound = new Audio('click.mp3');

// --- ゲームロジック ---

// 引数 (event) を受け取るように変更！
function clickCookie(event) {
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.8 + (Math.random() * 0.4);
    sound.play().catch(() => {});
    totalClicks++;

    let clickPower = 1;
    if (skills[0].unlocked) clickPower *= 2;
    if (skills[1].unlocked) clickPower *= 2;
    if (skills[3].unlocked && Math.random() < 0.1) clickPower *= 10;

    // ★天界ボーナス
    let prestigeMultiplier = 1 + (prestigeLevel * (isHeavenlyUnlocked("h1") ? 0.05 : 0.01));
    
    // ★ここが重要：計算結果を一度変数「amount」に入れる
    let amount = clickPower * prestigeMultiplier * difficulty * buffMultiplier;

    addCookies(amount);

    // ★クリック演出：数字を浮かび上がらせる
    if (event) {
        // formatNumberを使って「+10」のように表示
        createFloatingText(event.clientX, event.clientY, "+" + formatNumber(amount));
    }
}
// 数字を画面に浮かび上がらせる専用の関数
function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'click-visual'; // CSSで動きを設定したクラス
    el.innerText = text;
    
    // クリックした場所(x,y)に配置（少しランダムにずらす）
    el.style.left = (x - 20 + Math.random() * 40) + 'px'; 
    el.style.top = (y - 20) + 'px';
    
    document.body.appendChild(el);

    // 1秒後に要素を消して掃除する
    setTimeout(() => {
        el.remove();
    }, 1000);
}
function addCookies(amount) {
    cookies += amount;
    totalCookies += amount;
    lifetimeCookies += amount;
    updateDisplay();
    checkUnlocks();
}

function calculateGPS() {
    let totalGps = 0;
    items.forEach(item => {
        let production = item.gps * item.count;
        if (item.name === "Grandma" && skills[2].unlocked) production *= 2;
        totalGps += production;
    });

    // ★天界ボーナス
    let prestigeMultiplier = 1 + (prestigeLevel * (isHeavenlyUnlocked("h1") ? 0.05 : 0.01));

    return totalGps * prestigeMultiplier * difficulty * buffMultiplier;
}

// ヘルパー：天界スキルを持ってるか確認
function isHeavenlyUnlocked(id) {
    const upgrade = heavenlyUpgrades.find(u => u.id === id);
    return upgrade ? upgrade.unlocked : false;
}

function updateDisplay() {
    document.getElementById('score').innerText = formatNumber(cookies);
    document.getElementById('cps').innerText = formatNumber(calculateGPS());
    
    document.getElementById('prestige-chips').innerText = formatNumber(prestigeLevel);
    // 次の転生でもらえるチップ計算
    let pending = Math.floor(totalCookies / 1000000);
    document.getElementById('pending-chips').innerText = formatNumber(pending);
    
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

    // ストア更新
    items.forEach((item, i) => {
        if (!item.unlocked) return;
        const btn = document.getElementById("shop-btn-" + i);
        if (btn) {
            let cost = item.cost;
            // ★天界ボーナス（建物割引）
            if (isHeavenlyUnlocked("h3")) cost = Math.floor(cost * 0.95);

            btn.querySelector('.item-cost').innerText = formatNumber(cost);
            btn.querySelector('.item-owned').innerText = item.count;
            if (cookies >= cost) btn.classList.add('affordable');
            else btn.classList.remove('affordable');
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

// --- システム設定 ---
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

// --- ★天界・転生システム ---

// 1. 転生ボタンを押したとき
function prestige() {
    let pending = Math.floor(totalCookies / 1000000);
    if (pending <= 0) { alert("You need at least 1 million cookies baked this run to ascend!"); return; }
    
    if (confirm("Are you sure? You will reset your progress to enter the Ascension Tree.")) {
        // チップを加算して、今回のCookieはリセット
        prestigeLevel += pending;
        cookies = 0;
        totalCookies = 0;
        
        // 天界画面を表示
        openAscensionScreen();
    }
}

// 2. 天界画面を開く
function openAscensionScreen() {
    document.getElementById('game-container').style.display = 'none'; // ゲームを隠す
    document.getElementById('ascension-screen').style.display = 'flex'; // 天界を表示
    updateAscensionDisplay();
}

// 3. 天界画面の表示更新
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

// 4. 天界アップグレード購入
function buyHeavenlyUpgrade(id) {
    const upg = heavenlyUpgrades.find(u => u.id === id);
    if (upg && !upg.unlocked && prestigeLevel >= upg.cost) {
        prestigeLevel -= upg.cost;
        upg.unlocked = true;
        updateAscensionDisplay();
        saveGame(); // 購入のたびに保存
    }
}

// 5. 転生完了（ゲームに戻る）
function finishAscension() {
    // ★ここが修正ポイント：最後にもう一度クッキーを強制的に0にする
    cookies = 0;
    totalCookies = 0;

    // 建物をリセット（所持数を0に、価格を初期値に）
    items.forEach(item => { 
        item.count = 0; 
        item.cost = getInitialCost(item.name); 
        item.unlocked = item.trigger(); 
    });
    
    // スキルをリセット
    skills.forEach(skill => skill.unlocked = false);
    
    // スキルの再ロック解除チェック
    checkUnlocks();

    // 画面を戻す
    document.getElementById('ascension-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    
    // この状態で保存してリロード
    saveGame();
    location.reload(); // リフレッシュして新しい人生を開始
}

const initialCosts = items.map(i => i.cost);
function getInitialCost(name) {
    let idx = items.findIndex(i => i.name === name);
    return idx !== -1 ? initialCosts[idx] : 99999999;
}

// --- 購入処理（新しく追加！） ---
function buyItem(id) {
    const item = items[id];
    let currentCost = item.cost;
    
    // 天界スキルでの割引計算
    if (isHeavenlyUnlocked("h3")) {
        currentCost = Math.floor(currentCost * 0.95);
    }

    // お金が足りているかチェック
    if (cookies >= currentCost) {
        // 1. お金を払う
        cookies -= currentCost;
        
        // 2. アイテムを増やす
        item.count++;

        // 3. 次の価格を計算（基本価格 × 1.15の個数乗）
        // ※こうすることで、毎回正しい価格が再計算されます
        item.cost = Math.ceil(item.baseCost * Math.pow(1.15, item.count));

        // 4. 画面更新
        updateDisplay();
        createShopButtons(); // ボタンの表示価格も更新
        checkUnlocks();      // 解禁要素チェック
        
        // 音を鳴らす
        const sound = baseSound.cloneNode();
        sound.playbackRate = 1.0 + (id * 0.1); 
        sound.play().catch(() => {});
    }
}

// --- ボタン生成（修正版） ---
function createShopButtons() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    
    // ※毎回クリアせずに、中身の数字だけ更新する方が軽量ですが、
    // 今回はバグ修正優先で再描画します
    container.innerHTML = "";
    
    items.forEach((item, index) => {
        if (!item.unlocked) return;
        
        // 表示用の価格計算
        let displayCost = item.cost;
        if (isHeavenlyUnlocked("h3")) displayCost = Math.floor(displayCost * 0.95);

        const btn = document.createElement("div");
        btn.className = "store-item";
        btn.id = "shop-btn-" + index;
        
        // お金が足りるかチェックしてクラス付与
        if (cookies >= displayCost) btn.classList.add('affordable');
        
        btn.innerHTML = `
            <div class="item-icon-placeholder" style="display:flex;justify-content:center;align-items:center;font-size:30px;">${item.iconStr}</div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-cost">${formatNumber(displayCost)}</div>
            </div>
            <div class="item-owned">${item.count}</div>
        `;

        // クリックしたら buyItem関数 を呼ぶように変更！
        btn.onclick = () => {
            buyItem(index);
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

// --- セーブ機能 ---
function saveGame() {
    const saveData = {
        cookies: cookies,
        totalCookies: totalCookies,
        lifetimeCookies: lifetimeCookies,
        prestigeLevel: prestigeLevel,
        lastSaveTime: Date.now(), // 現在時刻（ミリ秒）を記録
        items: items.map(i => ({ count: i.count, cost: i.cost, unlocked: i.unlocked })),
        skills: skills.map(s => ({ unlocked: s.unlocked })),
        achievements: achievements.map(a => ({ id: a.id, unlocked: a.unlocked })),
        // ★天界データも保存
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

        // ★★★ ここが最重要修正ポイント！ ★★★
        if (data.items) {
            data.items.forEach((saved, i) => {
                if (items[i]) {
                    // 個数とロック状態だけ復元する
                    items[i].count = saved.count;
                    items[i].unlocked = saved.unlocked;
                    
                    // 値段はセーブデータを信用せず、正しい計算式で作り直す！
                    // (基本価格 × 1.15 の n乗)
                    items[i].cost = Math.ceil(items[i].baseCost * Math.pow(1.15, items[i].count));
                }
            });
        }
        // ★★★ 修正ここまで ★★★

        if (data.skills) {
            data.skills.forEach((saved, i) => { if (skills[i]) skills[i].unlocked = saved.unlocked; });
        }
        if (data.achievements) {
            data.achievements.forEach(saved => {
                const ach = achievements.find(a => a.id === saved.id);
                if (ach) ach.unlocked = saved.unlocked;
            });
        }
        updateAchievementDisplay(); 

        // 天界データのロード
        if (data.heavenlyUpgrades) {
            data.heavenlyUpgrades.forEach(saved => {
                const upg = heavenlyUpgrades.find(u => u.id === saved.id);
                if (upg) upg.unlocked = saved.unlocked;
            });
        }

        setMode(data.difficultyMode || 'normal');
        changeTheme(data.theme || 'default');
        
        // オフラインボーナス計算
        if (data.lastSaveTime) {
            const now = Date.now();
            const secondsOffline = (now - data.lastSaveTime) / 1000;

            if (secondsOffline > 60) {
                let gps = calculateGPS();
                // 天界スキルh4を持っていたらオフライン生産有効（なければ0）
                // ※以前のコードだと無条件でしたが、天界スキルの説明に合わせて修正する場合はここを調整
                // 今回はシンプルに「誰でも50%」のままにしておきます
                const offlineProduction = Math.floor(secondsOffline * gps * 0.5);

                if (offlineProduction > 0) {
                    addCookies(offlineProduction);
                    alert(`Welcome back!\nYou were gone for ${formatTime(secondsOffline)}.\nYour bakers produced ${formatNumber(offlineProduction)} cookies while you were away.`);
                }
            }
        }
    } else {
        setMode('normal');
        items[0].unlocked = true; 
    }
}

function resetGame() {
    if (confirm("WARNING: Wipe SAVE?")) {
        localStorage.clear();
        location.reload();
    }
}
function startGame(lang) {
    currentLang = lang; // 選んだ言語（'en' か 'ja'）を保存

    // 画面の固定テキストを翻訳（IDがある場所のみ）
    if (document.getElementById('cookie-label')) {
        document.getElementById('cookie-label').innerText = t("score");
    }
    if (document.getElementById('store-title')) {
        document.getElementById('store-title').innerText = t("storeTitle");
    }

    // ボタンの中身を翻訳後の言語で作り直す
    createShopButtons();
    createSkillButtons();
    
    // 黒い幕（オープニング）をフワッと消す
    document.getElementById('opening-overlay').classList.add('fade-out');
}
// --- ゴールデンクッキーシステム ---

function spawnGoldenCookie() {
    // 画面のランダムな位置（端っこすぎないように調整）
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);

    const golden = document.createElement("div");
    golden.innerText = "🍪"; // 絵文字を使用（画像に変えてもOK）
    golden.className = "golden-cookie";
    golden.style.left = x + "px";
    golden.style.top = y + "px";

    // クリックしたときの処理
    golden.onclick = (e) => {
        clickGoldenCookie(e);
        golden.remove(); // クリックしたら消す
    };

    document.body.appendChild(golden);

    // 15秒間クリックしなかったら自然消滅
    setTimeout(() => {
        if (golden.parentNode) {
            golden.remove();
        }
    }, 15000);

    // 次の出現予約（再帰呼び出し）
    scheduleNextGoldenCookie();
}

function scheduleNextGoldenCookie() {
    // 基本：30秒〜90秒の間に1回出る
    let minTime = 30000; 
    let maxTime = 90000;

    // ★天界スキル「Angelic Luck (h5)」を持っていたら出現頻度が2倍（時間は半分）
    if (isHeavenlyUnlocked("h5")) {
        minTime /= 2;
        maxTime /= 2;
    }

    const randomTime = minTime + Math.random() * (maxTime - minTime);
    setTimeout(spawnGoldenCookie, randomTime);
}

let buffTimer = null; // タイマー管理用（連続で引いたときのリセット用）

function clickGoldenCookie(event) {
    // 乱数で効果を決める（0〜0.99...）
    const rand = Math.random();
    
    // 音を鳴らす
    const sound = baseSound.cloneNode();
    sound.playbackRate = 1.5;
    sound.play().catch(() => {});

    // --- パターンA：Frenzy (7倍モード) ---
    // 50%の確率 (rand < 0.5) で発動
    if (rand < 0.5) {
        buffMultiplier = 7;
        updateDisplay(); // 画面の数字(CpS)をすぐに更新！
        
        // 演出
        createFloatingText(event.clientX, event.clientY, "Frenzy! (x7)");
        createFloatingText(event.clientX, event.clientY + 30, "for 77 seconds");
        
        // もし既に7倍中なら、前のタイマーを消して時間をリセット
        if (buffTimer) clearTimeout(buffTimer);

        // 77秒後に元に戻す予約
        buffTimer = setTimeout(() => {
            buffMultiplier = 1;
            updateDisplay(); // 元に戻ったことを画面に反映
            createFloatingText(window.innerWidth/2, window.innerHeight/2, "Frenzy ended...");
        }, 77000);
    } 
    // --- パターンB：Lucky (大量ゲット) ---
    else {
        let gps = calculateGPS();
        // 7倍中なら、その7倍のGPSを基準にボーナスをあげる（超お得！）
        let bonus = Math.max(777, gps * 900);
        
        addCookies(bonus);

        // 演出
        createFloatingText(event.clientX, event.clientY, "Lucky!");
        setTimeout(() => {
            createFloatingText(event.clientX, event.clientY - 30, "+" + formatNumber(bonus));
        }, 200);
    }
}
window.onload = function() {
    loadGame();
    checkUnlocks();
    createSkillButtons(); 
    createShopButtons();
    updateDisplay();
    scheduleNextGoldenCookie();

    setInterval(() => {
        let gps = calculateGPS();
        addCookies(gps / 10);
        checkAchievements();
    }, 100);
    setInterval(saveGame, 10000);
};
// ウィンドウやタブを閉じるときに強制セーブ
window.onbeforeunload = function() {
    saveGame();
};
// 秒数を「1h 20m 30s」のような読みやすい形式にする関数
function formatTime(seconds) {
    if (seconds < 60) return Math.floor(seconds) + "s";
    
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);

    seconds = Math.floor(seconds % 60);
    minutes = minutes % 60;
    hours = hours % 24;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
}
// ==========================================
//  ニュースティッカー機能
// ==========================================

// ニュースのネタ帳
const newsData = [
    // 条件なし（いつでも出る）
    { text: "Cookie Clicker game found to be highly addictive!", condition: () => true },
    { text: "Local bakery shortage reported due to mysterious cookie production.", condition: () => true },
    
    // クッキーの枚数によるニュース
    { text: "Your cookies are becoming popular in the neighborhood.", condition: () => totalCookies > 1000 },
    { text: "Cookie universe expanding rapidly!", condition: () => totalCookies > 1000000 },
    
    // 建物によるニュース（おばあちゃん）
    { text: "Grandmas demand higher wages and better rolling pins.", condition: () => items[1].count > 0 },
    { text: "Strange rituals observed at local retirement home.", condition: () => items[1].count > 50 },
    
    // 建物によるニュース（農場）
    { text: "Scientists discover genetically modified chocolate chips.", condition: () => items[2].count > 0 },
    
    // カーソル
    { text: "Your fingers must be tired by now.", condition: () => totalClicks > 1000 },
    
    // 天界・転生
    { text: "People say they feel like they've lived this life before...", condition: () => prestigeLevel > 0 }
];

function updateNews() {
    const content = document.getElementById('news-content');
    if (!content) return;

    // 今の状況で表示できるニュースだけを抽出
    const availableNews = newsData.filter(n => n.condition());
    
    // その中からランダムに1つ選ぶ
    const randomNews = availableNews[Math.floor(Math.random() * availableNews.length)];
    
    // フェードアウトさせてから切り替える演出
    content.style.opacity = 0;
    
    setTimeout(() => {
        content.innerText = randomNews.text;
        content.style.opacity = 1;
    }, 500); // 0.5秒かけて消えて、切り替わって、また出る
}

// 10秒ごとにニュースを切り替える
setInterval(updateNews, 10000);

// ゲーム開始時に一回すぐ実行
setTimeout(updateNews, 1000);
