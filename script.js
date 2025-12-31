// ゲームのデータ（アイテムリスト）
// ここに好きなアイテムを追加できます！
let items = [
    { name: "カーソル", cost: 15, gps: 1, count: 0 },
    { name: "おばあちゃん", cost: 100, gps: 5, count: 0 },
    { name: "農場", cost: 500, gps: 20, count: 0 },
    { name: "工場", cost: 2000, gps: 100, count: 0 },
    { name: "魔法の神殿", cost: 10000, gps: 500, count: 0 },
    { name: "地面", cost: 40000, gps: 2000, count: 0 },
    { name: "水力生成", cost: 200000, gps: 8000, count: 0 },
    { name: "太陽光生成", cost: 1500000, gps: 40000, count: 0 },
    { name: "マントル", cost: 50000000, gps: 200000, count: 0 },
    { name: "宇宙ステーション", cost: 700000000, gps: 1500000, count: 0 },
    { name: "タイムマシン", cost: 9999999999, gps: 10000000, count: 0 }
];

let cookies = 0;
const clickSound = new Audio('click.mp3'); // 音がある場合

// 起動時の処理
window.onload = function() {
    loadGame();
    createShop(); // ショップのボタンを作る
    updateDisplay();
};

// ショップのボタンを自動で作る関数
function createShop() {
    const container = document.getElementById("shop-container");
    container.innerHTML = ""; // 一度空にする

    items.forEach((item, index) => {
        // ボタンを作る
        let btn = document.createElement("button");
        btn.id = "btn-" + index;
        btn.onclick = () => buyItem(index);
        
        // ボタンの中身（文字）
        btn.innerHTML = `
            ${item.name}<br>
            <small>価格: <span id="cost-${index}">${Math.floor(item.cost)}</span></small><br>
            <small>所持: <span id="count-${index}">${item.count}</span></small>
        `;
        
        container.appendChild(btn);
    });
}

// 画面表示を更新する関数
function updateDisplay() {
    document.getElementById("score").innerText = Math.floor(cookies);
    
    // 秒間の生産量を計算
    let totalGps = 0;
    items.forEach(item => {
        totalGps += item.gps * item.count;
    });
    document.getElementById("gps").innerText = totalGps;
    document.title = Math.floor(cookies) + " クッキー";

    // 各ボタンの表示更新
    items.forEach((item, index) => {
        // 価格と所持数を更新
        document.getElementById(`cost-${index}`).innerText = Math.floor(item.cost);
        document.getElementById(`count-${index}`).innerText = item.count;

        // お金が足りないボタンは灰色にする
        const btn = document.getElementById(`btn-${index}`);
        btn.disabled = cookies < item.cost;
    });
}

// クッキーをクリック
function clickCookie() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => {}); // エラー防止
    cookies++;
    updateDisplay();
}

// アイテムを買う
function buyItem(index) {
    if (cookies >= items[index].cost) {
        cookies -= items[index].cost;
        items[index].count++;
        items[index].cost = items[index].cost * 1.15; // 価格上昇
        updateDisplay();
        saveGame();
    }
}

// 1秒ごとの自動増加
setInterval(function() {
    items.forEach(item => {
        cookies += (item.gps * item.count); // 秒間生産量を少しずつ足すのではなく一括でもOKですが、今回はシンプルに
    });
    // ※本来は秒間生産量をまとめて足すのが一般的ですが、
    // ここではわかりやすくそのままにしています
    updateDisplay();
    saveGame();
}, 1000);

// セーブ機能
function saveGame() {
    const saveData = {
        cookies: cookies,
        items: items
    };
    localStorage.setItem("myClickerSaveV2", JSON.stringify(saveData));
}

// ロード機能
function loadGame() {
    const data = JSON.parse(localStorage.getItem("myClickerSaveV2"));
    if (data) {
        cookies = data.cookies;
        // 保存されたアイテム情報を読み込む（名前が変わっていないか確認しつつ）
        data.items.forEach((savedItem, index) => {
            if (items[index] && items[index].name === savedItem.name) {
                items[index].cost = savedItem.cost;
                items[index].count = savedItem.count;
            }
        });
    }
}
