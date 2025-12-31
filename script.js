// 変数の準備
let cookies = 0;
let cursorCost = 15;
let cursors = 0;

// 起動時にセーブデータを読み込む
loadGame();

// 画面を更新する関数
function updateDisplay() {
    document.getElementById("score").innerText = Math.floor(cookies);
    document.getElementById("cost").innerText = Math.floor(cursorCost);
    document.getElementById("gps").innerText = cursors;
    
    // お金が足りない時はボタンを灰色にする
    document.getElementById("buy-btn").disabled = cookies < cursorCost;
    
    // タイトルバーにも枚数を表示
    document.title = Math.floor(cookies) + " クッキー";
}

// クッキーをクリックした時
function clickCookie() {
    cookies++;
    updateDisplay();
}

// アイテムを買う時
function buyCursor() {
    if (cookies >= cursorCost) {
        cookies -= cursorCost;
        cursors++;
        cursorCost = cursorCost * 1.15; // 価格を1.15倍にする
        updateDisplay();
        saveGame();
    }
}

// 1秒ごとの自動増加
setInterval(function() {
    cookies += cursors;
    updateDisplay();
    saveGame(); // 毎秒セーブ
}, 1000);

// セーブ機能 (ローカルストレージ)
function saveGame() {
    localStorage.setItem("myClickerSave", JSON.stringify({
        cookies: cookies,
        cursorCost: cursorCost,
        cursors: cursors
    }));
}

// ロード機能
function loadGame() {
    let savedGame = JSON.parse(localStorage.getItem("myClickerSave"));
    if (savedGame) {
        cookies = savedGame.cookies;
        cursorCost = savedGame.cursorCost;
        cursors = savedGame.cursors;
    }
    updateDisplay();
}