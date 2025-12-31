// --- 設定データ ---

// アイテムリスト
let items = [
    { name: "カーソル", cost: 15, gps: 1, count: 0 },
    { name: "おばあちゃん", cost: 100, gps: 5, count: 0 },
    { name: "農場", cost: 500, gps: 20, count: 0 },
    { name: "工場", cost: 2000, gps: 100, count: 0 },
    { name: "見習いコマンダー", cost: 10000, gps: 500, count: 0 },
    { name: "地面", cost: 40000, gps: 2000, count: 0 },
    { name: "水力生成", cost: 200000, gps: 8000, count: 0 },
    { name: "太陽光生成", cost: 1500000, gps: 40000, count: 0 },
    { name: "マントル", cost: 50000000, gps: 200000, count: 0 },
    { name: "宇宙ステーション", cost: 700000000, gps: 1500000, count: 0 },
    { name: "タイムマシン", cost: 9999999999, gps: 10000000, count: 0 }
];

// スキルリスト
let skills = [
    { id: 0, name: "強化人差し指", cost: 500, desc: "クリック効率 2倍", unlocked: false, reqId: null },
    { id: 1, name: "おばあちゃんの眼鏡", cost: 1000, desc: "おばあちゃん効率 2倍", unlocked: false, reqId: null },
    { id: 2, name: "鋼鉄のツルハシ", cost: 5000, desc: "カーソル効率 さらに2倍", unlocked: false, reqId: 0 },
    { id: 3, name: "ラッキー・クッキー", cost: 20000, desc: "10%でクリティカル(x10)", unlocked: false, reqId: 0 },
    { id: 4, name: "時間圧縮", cost: 100000, desc: "全生産スピード 1.2倍", unlocked: false, reqId: 1 }
];

// ゲーム変数
let cookies = 0;           // 現在持っているクッキー
let totalCookies = 0;      // 今まで焼いた累計クッキー（転生計算用）
let prestigeLevel = 0;     // 天界チップの所持数

// 音の準備
const baseSound = new Audio('click.mp3'); 

// --- メイン処理 ---

window.onload = function() {
    loadGame();
    createShop();
    createSkills();
    updateDisplay();
};

// 1秒ごとのループ
setInterval(function() {
    let gps = calculateGPS();
    addCookies(gps); // ここで専用の関数を使う
    saveGame();
}, 1000);

// クッキーを増やす共通関数（累計もカウントするため）
function addCookies(amount) {
    cookies += amount;
    totalCookies += amount;
    updateDisplay();
}

// クリック処理
function clickCookie() {
    // 音再生
    const sound = baseSound.cloneNode();
    sound.playbackRate = 0.8 + (Math.random() * 0.4);
    sound.play().catch(e => console.log(e));

    // クリック力計算
    let clickPower = 1;
    if (skills[0].unlocked) clickPower *= 2;
    if (skills[2].unlocked) clickPower *= 2;
    if (skills[3].unlocked && Math.random() < 0.1) clickPower *= 10;

    // ★転生ボーナスを適用 (1枚につき+10%)
    let multiplier = 1 + (prestigeLevel * 0.1);
    clickPower *= multiplier;

    addCookies(clickPower);
}

// GPS（秒間生産量）の計算
function calculateGPS() {
    let totalGps = 0;
    items.forEach(item => {
        let production = item.gps * item.count;
        if (item.name === "おばあちゃん" && skills[1].unlocked) production *= 2;
        totalGps += production;
    });

    if (skills[4].unlocked) totalGps *= 1.2;

    // ★転生ボーナスを適用
    let multiplier = 1 + (prestigeLevel * 0.1);
    return totalGps * multiplier;
}

// 画面更新
function updateDisplay() {
    document.getElementById("score").innerText = Math.floor(cookies);
    document.getElementById("gps").innerText = Math.floor(calculateGPS());
    document.title = Math.floor(cookies) + " クッキー";

    // 転生情報の更新
    document.getElementById("prestige-level").innerText = prestigeLevel;
    document.getElementById("prestige-boost").innerText = Math.floor(prestigeLevel * 10);

    // ショップ更新
    items.forEach((item, index) => {
        let costElem = document.getElementById(`cost-${index}`);
        if(costElem) {
            costElem.innerText = Math.floor(item.cost);
            document.getElementById(`count-${index}`).innerText = item.count;
            document.getElementById(`btn-${index}`).disabled = cookies < item.cost;
        }
    });

    // スキル更新（購入したら再描画してボタンの状態を変える）
    createSkills();
}

// --- 転生機能（修正版） ---

function reincarnate() {
    // 獲得できるチップを計算（累計100万枚ごとに1枚）
    let potentialChips = Math.floor(totalCookies / 1000000);
    let newChips = potentialChips - prestigeLevel;

    if (newChips <= 0) {
        alert(`転生するにはもっとクッキーが必要です！\n(現在: ${Math.floor(totalCookies)} / 次のレベルまで: ${(prestigeLevel + 1) * 1000000})`);
        return;
    }

    if (confirm(`転生しますか？\n\n・クッキーと施設は全て失われます\n・天界チップを ${newChips}枚 獲得します\n・生産力が永続的に ${newChips * 10}% アップします`)) {
        
        // 1. 天界チップを加算
        prestigeLevel += newChips;
        
        // 2. クッキーを0にする
        cookies = 0;

        // 3. ★ここが重要★
        // アイテムを「初期価格」のリストで丸ごと上書きする
        // (以前のコードでは count=0 にしただけで、costが高いままでした)
        items = [
            { name: "カーソル", cost: 15, gps: 1, count: 0 },
            { name: "おばあちゃん", cost: 100, gps: 5, count: 0 },
            { name: "農場", cost: 500, gps: 20, count: 0 },
            { name: "工場", cost: 2000, gps: 100, count: 0 },
            { name: "見習いコマンダー", cost: 10000, gps: 500, count: 0 },
            { name: "地面", cost: 40000, gps: 2000, count: 0 },
            { name: "水力生成", cost: 200000, gps: 8000, count: 0 },
            { name: "太陽光生成", cost: 1500000, gps: 40000, count: 0 },
            { name: "マントル", cost: 50000000, gps: 200000, count: 0 },
            { name: "宇宙ステーション", cost: 700000000, gps: 1500000, count: 0 },
            { name: "タイムマシン", cost: 9999999999, gps: 10000000, count: 0 }
        ];

        // 4. スキルも未習得に戻す
        skills.forEach(skill => skill.unlocked = false);

        // 5. データを保存して強制リロード
        // (これで初期価格のデータがセーブされます)
        saveGame();
        location.reload();
    }
}
// --- ショップ＆スキル作成 ---
function createShop() {
    const container = document.getElementById("shop-container");
    container.innerHTML = "";
    items.forEach((item, index) => {
        let btn = document.createElement("button");
        btn.id = `btn-${index}`;
        btn.onclick = () => buyItem(index);
        btn.innerHTML = `
            ${item.name}<br>
            <small>価格: <span id="cost-${index}">${item.cost}</span></small><br>
            <small>所持: <span id="count-${index}">${item.count}</span></small>
        `;
        container.appendChild(btn);
    });
}

function createSkills() {
    const container = document.getElementById("skill-container");
    container.innerHTML = "";
    skills.forEach((skill, index) => {
        if (skill.reqId !== null && !skills[skill.reqId].unlocked) return; 

        let btn = document.createElement("button");
        btn.className = "skill-btn";
        if (skill.unlocked) btn.classList.add("purchased");
        btn.onclick = () => buySkill(index);
        
        if (skill.unlocked) {
            btn.innerHTML = `✅ ${skill.name}<br><small>習得済み</small>`;
            btn.disabled = true;
        } else {
            btn.innerHTML = `${skill.name}<br><small>${skill.desc}</small><br><strong>${skill.cost}</strong>`;
            btn.disabled = cookies < skill.cost;
        }
        container.appendChild(btn);
    });
}

// --- 購入処理 ---
function buyItem(index) {
    if (cookies >= items[index].cost) {
        cookies -= items[index].cost;
        items[index].count++;
        items[index].cost *= 1.15;
        updateDisplay();
        saveGame();
    }
}

function buySkill(index) {
    if (!skills[index].unlocked && cookies >= skills[index].cost) {
        cookies -= skills[index].cost;
        skills[index].unlocked = true;
        updateDisplay();
        saveGame();
    }
}

// --- セーブ＆ロード＆リセット ---

function saveGame() {
    const saveData = {
        cookies: cookies,
        totalCookies: totalCookies, // 累計も保存
        prestigeLevel: prestigeLevel, // チップも保存
        items: items,
        skills: skills
    };
    localStorage.setItem("myClickerSaveV5", JSON.stringify(saveData));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("myClickerSaveV5")); // V5に変更
    if (data) {
        cookies = data.cookies;
        // データがない場合は0にする（古いデータからの引き継ぎ対策）
        totalCookies = data.totalCookies || data.cookies; 
        prestigeLevel = data.prestigeLevel || 0;

        data.items.forEach((savedItem, index) => {
            if (items[index]) {
                items[index].cost = savedItem.cost;
                items[index].count = savedItem.count;
            }
        });
        if (data.skills) {
            data.skills.forEach((savedSkill, index) => {
                if (skills[index]) skills[index].unlocked = savedSkill.unlocked;
            });
        }
    }
}

function resetGame() {
    if (confirm("本当にデータを削除して最初からにしますか？")) {
        let highestId = window.setInterval(";");
        for (let i = 0; i < highestId; i++) {
            window.clearInterval(i);
        }
        localStorage.clear();
        alert("データを完全にリセットしました。");
        location.reload();
    }
}
