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

let cookies = 0;

// 音の準備（1つのファイルをピッチ変更して使う）
const baseSound = new Audio('click.mp3'); 

// --- メイン処理 ---

window.onload = function() {
    loadGame();
    createShop();
    createSkills();
    updateDisplay();
};

// 1秒ごとのループ（オートセーブ含む）
setInterval(function() {
    let gps = calculateGPS();
    cookies += gps;
    updateDisplay();
    saveGame();
}, 1000);

// クリック処理（音程変化つき）
function clickCookie() {
    // --- 音を鳴らす ---
    // 音を複製して、連打でも途切れないようにする
    const sound = baseSound.cloneNode();
    // 音程をランダムに変える (0.8倍〜1.2倍)
    sound.playbackRate = 0.8 + (Math.random() * 0.4);
    sound.play().catch(e => {
        // 音声再生エラー（ブラウザ設定など）は無視
        console.log("Audio play failed:", e);
    });
    // ------------------

    // 基本のクリック力
    let clickPower = 1;

    // スキル効果：クリック力アップ
    if (skills[0].unlocked) clickPower *= 2;
    if (skills[2].unlocked) clickPower *= 2;

    // スキル効果：クリティカル
    if (skills[3].unlocked) {
        if (Math.random() < 0.1) { 
            clickPower *= 10;
        }
    }

    cookies += clickPower;
    updateDisplay();
}

// GPS（秒間生産量）の計算
function calculateGPS() {
    let totalGps = 0;
    items.forEach(item => {
        let production = item.gps * item.count;
        
        // スキル効果：おばあちゃん強化
        if (item.name === "おばあちゃん" && skills[1].unlocked) {
            production *= 2;
        }
        totalGps += production;
    });

    // スキル効果：全体強化
    if (skills[4].unlocked) {
        totalGps *= 1.2;
    }

    return totalGps;
}

// 画面更新
function updateDisplay() {
    document.getElementById("score").innerText = Math.floor(cookies);
    document.getElementById("gps").innerText = Math.floor(calculateGPS());
    document.title = Math.floor(cookies) + " クッキー";

    // ショップボタンの更新
    items.forEach((item, index) => {
        // まだボタンが生成されていない場合は無視（エラー回避）
        let costElem = document.getElementById(`cost-${index}`);
        if(costElem) {
            costElem.innerText = Math.floor(item.cost);
            document.getElementById(`count-${index}`).innerText = item.count;
            document.getElementById(`btn-${index}`).disabled = cookies < item.cost;
        }
    });

    // スキルボタンの更新
    createSkills(); 
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
        // 前提スキルを持っていないと表示されない
        if (skill.reqId !== null && !skills[skill.reqId].unlocked) {
            return; 
        }

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
        items: items,
        skills: skills
    };
    localStorage.setItem("myClickerSaveV4", JSON.stringify(saveData));
}

function loadGame() {
    const data = JSON.parse(localStorage.getItem("myClickerSaveV4"));
    if (data) {
        cookies = data.cookies;
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
        // タイマー停止
        let highestId = window.setInterval(";");
        for (let i = 0; i < highestId; i++) {
            window.clearInterval(i);
        }
        // データ削除
        localStorage.clear();
        alert("データを完全にリセットしました。");
        location.reload();
    }
}
