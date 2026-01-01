// ==========================================
//  クッキークリッカー 完全版 (v5.0)
// ==========================================

// --- 設定データ ---
let cookies = 0;
let totalCookies = 0; // 累計（転生用）
let prestigeLevel = 0; // 天界チップ
let difficulty = 1.0; // 難易度倍率
let difficultyName = "normal";
let currentTheme = "default";

// アイテムリスト
let items = [
    { name: "カーソル", cost: 15, gps: 0.1, count: 0 },
    { name: "おばあちゃん", cost: 100, gps: 1, count: 0 },
    { name: "農場", cost: 1100, gps: 8, count: 0 },
    { name: "鉱山", cost: 12000, gps: 47, count: 0 },
    { name: "工場", cost: 130000, gps: 260, count: 0 },
    { name: "銀行", cost: 1400000, gps: 1400, count: 0 },
    { name: "寺院", cost: 20000000, gps: 7800, count: 0 }
];

// 研究所（アップグレード）リスト
let skills = [
    { name: "強化人差し指", cost: 500, desc: "クリック効率 2倍", unlocked: false, trigger: () => items[0].count >= 1 },
    { name: "おばあちゃんの眼鏡", cost: 1000, desc: "おばあちゃん効率 2倍", unlocked: false, trigger: () => items[1].count >= 1 },
    { name: "金のクリック", cost: 5000, desc: "クリック効率 さらに2倍", unlocked: false, trigger: () => items[0].count >= 10 },
    { name: "ラッキー", cost: 10000, desc: "たまにクリックで10倍", unlocked: false, trigger: () => totalCookies >= 10000 },
    { name: "クッキー神の祝福", cost: 100000, desc: "全生産量 1.2倍", unlocked: false, trigger: () => prestigeLevel >= 1 }
];

// 音声準備
const baseSound = new Audio('click.mp3');

// --- メイン機能 ---

// クッキーをクリック
function clickCookie() {
    // 音を鳴らす
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.8 + (Math.random() * 0.4);
    sound.play().catch(() => {}); // エラー無視

    // クリック力の計算
    let clickPower = 1;
    if (skills[0].unlocked) clickPower *= 2;
    if (skills[2].unlocked) clickPower *= 2;
    if (skills[3].unlocked && Math.random() < 0.1) clickPower *= 10;

    // 転生ボーナス
    let multiplier = 1 + (prestigeLevel * 0.1);
    
    // 難易度ボーナス
    addCookies(clickPower * multiplier * difficulty);

    // アニメーション
    const cookieImg = document.getElementById('cookie');
    cookieImg.style.transform = "scale(0.95)";
    setTimeout(() => cookieImg.style.transform = "scale(1)", 50);
}

// クッキーを増やす共通関数
function addCookies(amount) {
    cookies += amount;
    totalCookies += amount;
    updateDisplay();
}

// 秒間生産量(GPS)の計算
function calculateGPS() {
    let totalGps = 0;
    items.forEach(item => {
        let production = item.gps * item.count;
        if (item.name === "おばあちゃん" && skills[1].unlocked) production *= 2;
        totalGps += production;
    });

    if (skills[4].unlocked) totalGps *= 1.2;

    let multiplier = 1 + (prestigeLevel * 0.1);
    return totalGps * multiplier * difficulty;
}

// 画面更新
function updateDisplay() {
    document.getElementById('score').innerText = Math.floor(cookies).toLocaleString();
    document.getElementById('cps').innerText = calculateGPS().toFixed(1);
    
    // 転生情報の更新
    document.getElementById('prestige-chips').innerText = prestigeLevel.toLocaleString();
    document.getElementById('prestige-effect').innerText = Math.floor(prestigeLevel * 10).toLocaleString();

    // タブタイトル更新
    document.title = Math.floor(cookies).toLocaleString() + " クッキー";
}

// --- ゲームシステム（難易度・テーマ・転生） ---

function setMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'easy') { difficulty = 2.0; difficultyName = "イージー"; document.getElementById('mode-easy').classList.add('active'); }
    else if (mode === 'normal') { difficulty = 1.0; difficultyName = "ノーマル"; document.getElementById('mode-normal').classList.add('active'); }
    else if (mode === 'hard') { difficulty = 0.5; difficultyName = "ハード"; document.getElementById('mode-hard').classList.add('active'); }
    else if (mode === 'veryhard') { difficulty = 0.2; difficultyName = "ベリーハード"; document.getElementById('mode-veryhard').classList.add('active'); }
    
    document.getElementById('current-mode-name').innerText = difficultyName;
}

function changeTheme(themeName) {
    currentTheme = themeName;
    document.body.className = ""; 
    if (themeName !== "default") document.body.classList.add(themeName);
}

function prestige() {
    if (totalCookies < 1000000) {
        alert("転生するには累計 1,000,000 枚のクッキーが必要です！");
        return;
    }
    if (confirm("転生しますか？\n所持クッキーと施設はリセットされますが、\n「天界チップ」を獲得して生産力が上がります！")) {
        let earnedChips = Math.floor(totalCookies / 1000000);
        prestigeLevel += earnedChips;
        cookies = 0;
        totalCookies = 0;
        items.forEach(item => { item.count = 0; item.cost = getInitialCost(item.name); });
        skills.forEach(skill => skill.unlocked = false);
        saveGame();
        location.reload();
    }
}

// 初期コスト取得（転生リセット用）
function getInitialCost(name) {
    const list = [
        { name: "カーソル", cost: 15 }, { name: "おばあちゃん", cost: 100 },
        { name: "農場", cost: 1100 }, { name: "鉱山", cost: 12000 },
        { name: "工場", cost: 130000 }, { name: "銀行", cost: 1400000 },
        { name: "寺院", cost: 20000000 }
    ];
    let found = list.find(i => i.name === name);
    return found ? found.cost : 99999999;
}

// --- ボタン生成機能 ---

function createShopButtons() {
    const container = document.getElementById('shop-container');
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = "item-btn";
        btn.id = "shop-btn-" + index;
        btn.innerHTML = `
            <div style="font-weight:bold;">${item.name}</div>
            <div>価格: ${Math.floor(item.cost).toLocaleString()}</div>
            <div>所持: ${item.count}</div>
        `;
        btn.onclick = () => {
            if (cookies >= item.cost) {
                cookies -= item.cost;
                item.count++;
                item.cost *= 1.15;
                updateDisplay();
                createShopButtons(); // 価格更新のため再描画
                checkSkills(); // スキル解放チェック
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
            const btn = document.createElement("button");
            btn.className = "skill-btn";
            btn.innerHTML = `
                <div><b>${skill.name}</b></div>
                <div>${skill.desc}</div>
                <div>価格: ${skill.cost.toLocaleString()}</div>
            `;
            btn.style.backgroundColor = "#e1bee7"; // 薄紫
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

function checkSkills() {
    createSkillButtons();
}

// --- セーブ＆ロード＆リセット ---

function saveGame() {
    const saveData = {
        cookies: cookies,
        totalCookies: totalCookies,
        prestigeLevel: prestigeLevel,
        items: items,
        skills: skills,
        difficultyMode: difficultyName === "イージー" ? 'easy' : difficultyName === "ハード" ? 'hard' : difficultyName === "ベリーハード" ? 'veryhard' : 'normal',
        theme: currentTheme
    };
    localStorage.setItem("myClickerSaveV5", JSON.stringify(saveData));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("myClickerSaveV5"));
    if (data) {
        cookies = data.cookies || 0;
        totalCookies = data.totalCookies || data.cookies;
        prestigeLevel = data.prestigeLevel || 0;
        
        if (data.items) {
            data.items.forEach((saved, i) => {
                if (items[i]) { items[i].count = saved.count; items[i].cost = saved.cost; }
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
    }
}

function resetGame() {
    if (confirm("【警告】データを完全に消去しますか？")) {
        let id = window.setInterval(function() {}, 0);
        while (id--) window.clearInterval(id);
        localStorage.clear();
        localStorage.setItem("myClickerSaveV5", null);
        alert("データを初期化しました。");
        location.reload();
    }
}

// --- エンジン始動（ここがゲームを動かす！） ---

window.onload = function() {
    loadGame();       // 1. ロード
    createShopButtons(); // 2. ショップ作成
    checkSkills();    // 3. 研究所作成
    updateDisplay();  // 4. 表示更新

    // メインループ（0.1秒ごと）
    setInterval(() => {
        let gps = calculateGPS();
        addCookies(gps / 10);
        
        // ボタンの色の濃さを変える（買えるかどうか）
        items.forEach((item, i) => {
            const btn = document.getElementById("shop-btn-" + i);
            if (btn) btn.style.opacity = (cookies >= item.cost) ? "1.0" : "0.5";
        });
    }, 100);

    // オートセーブ（10秒ごと）
    setInterval(saveGame, 10000);
};
