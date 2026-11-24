const SECRET_PAGE = "secret.html";

let player = [];
let neplayer = [];
let playerHits = 0;
let neplayerHits = 0;
let pShipsPlaced = 0;
let started = false;
let gameOver = false;
let isPlayerTurn = true;
let botTimeout = null;

const start = document.getElementById("start");
const startText = document.getElementById("start-text");
const randomBtn = document.getElementById("random");
const statusText = document.getElementById("status");
const playerHitsEl = document.getElementById("player-hits");
const enemyHitsEl = document.getElementById("enemy-hits");
const playerTable = document.getElementById("pole1");
const neplayerTable = document.getElementById("pole2");
const pageCurl = document.getElementById("page-curl");
const notebookPage = document.querySelector(".notebook-page");

const winIcon = `<svg class="status-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
const loseIcon = `<svg class="status-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4H8"/><circle cx="9" cy="14" r="1.2" fill="#dc2626"/><circle cx="15" cy="14" r="1.2" fill="#dc2626"/><path d="M9 17h6"/></svg>`;

function InitEnemShips() {
    let enemShips = 0;
    while (enemShips < 20) {
        let r = Math.floor(Math.random() * 10);
        let c = Math.floor(Math.random() * 10);
        if (neplayer[r][c] === 0) {
            neplayer[r][c] = 1;
            enemShips++;
        }
    }
}

function randomPlayerShips() {
    if (started) return;

    pShipsPlaced = 0;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            player[i][j] = 0;
            document.getElementById(`p${i},${j}`).classList.remove("ship");
        }
    }

    while (pShipsPlaced < 20) {
        let r = Math.floor(Math.random() * 10);
        let c = Math.floor(Math.random() * 10);
        if (player[r][c] === 0) {
            player[r][c] = 1;
            document.getElementById(`p${r},${c}`).classList.add("ship");
            pShipsPlaced++;
        }
    }

    updateSetupUI();
}

function updateSetupUI() {
    startText.textContent = `Почати гру (${pShipsPlaced}/20)`;
    start.disabled = pShipsPlaced < 20;
    statusText.textContent = pShipsPlaced === 20
        ? "Усі кораблі на місці! Натисни «Почати гру»."
        : `Розстав ще ${20 - pShipsPlaced} клітинок кораблів.`;
}

function PlayerClick(cell, row, col) {
    if (started) return;

    if (player[row][col] === 0 && pShipsPlaced < 20) {
        player[row][col] = 1;
        cell.classList.add("ship");
        pShipsPlaced++;
    } else if (player[row][col] === 1) {
        player[row][col] = 0;
        cell.classList.remove("ship");
        pShipsPlaced--;
    }

    updateSetupUI();
}

function NePlayerClick(cell, row, col) {
    if (!started || gameOver || !isPlayerTurn) return;

    if (cell.classList.contains("hit") || cell.classList.contains("miss")) {
        return;
    }

    if (neplayer[row][col] === 1) {
        cell.classList.add("hit");
        playerHits++;
        playerHitsEl.textContent = `(твоїх влучань: ${playerHits}/20)`;

        if (playerHits === 20) {
            gameOver = true;
            neplayerTable.classList.add("disabled");
            statusText.innerHTML = `${winIcon}<span>Ти переміг!</span>`;
        } else {
            statusText.textContent = "Влучив! Стріляй ще раз.";
        }
    } else {
        cell.classList.add("miss");
        isPlayerTurn = false;
        neplayerTable.classList.add("disabled");
        statusText.textContent = "Промах! Хід бота...";
        botTimeout = setTimeout(enemyTurn, 400);
    }
}

function enemyTurn() {
    if (gameOver) return;

    let shot = false;
    while (!shot) {
        let r = Math.floor(Math.random() * 10);
        let c = Math.floor(Math.random() * 10);
        let td = document.getElementById(`p${r},${c}`);

        if (!td.classList.contains("hit") && !td.classList.contains("miss")) {
            shot = true;
            if (player[r][c] === 1) {
                td.classList.add("hit");
                neplayerHits++;
                enemyHitsEl.textContent = `(влучань бота: ${neplayerHits}/20)`;

                if (neplayerHits === 20) {
                    gameOver = true;
                    statusText.innerHTML = `${loseIcon}<span>Бот переміг...</span>`;
                } else {
                    statusText.textContent = "Бот влучив! Стріляє ще...";
                    botTimeout = setTimeout(enemyTurn, 400);
                }
            } else {
                td.classList.add("miss");
                isPlayerTurn = true;
                neplayerTable.classList.remove("disabled");
                statusText.textContent = "Бот промахнувся. Твій хід!";
            }
        }
    }
}

function initGame() {
    clearTimeout(botTimeout);
    playerHits = 0;
    neplayerHits = 0;
    pShipsPlaced = 0;
    started = false;
    gameOver = false;
    isPlayerTurn = true;

    playerTable.innerHTML = "";
    neplayerTable.innerHTML = "";
    playerTable.classList.remove("disabled");
    neplayerTable.classList.add("disabled");
    randomBtn.disabled = false;

    playerHitsEl.textContent = "(твоїх влучань: 0/20)";
    enemyHitsEl.textContent = "(влучань бота: 0/20)";
    updateSetupUI();

    for (let i = 0; i < 10; i++) {
        player[i] = [];
        neplayer[i] = [];
        for (let j = 0; j < 10; j++) {
            player[i][j] = 0;
            neplayer[i][j] = 0;
        }
    }

    InitEnemShips();

    for (let i = 0; i < 10; i++) {
        let trPlayer = document.createElement("tr");
        let trEnemy = document.createElement("tr");

        for (let j = 0; j < 10; j++) {
            let tdPlayer = document.createElement("td");
            tdPlayer.id = `p${i},${j}`;
            tdPlayer.addEventListener("click", () => PlayerClick(tdPlayer, i, j));
            trPlayer.appendChild(tdPlayer);

            let tdEnemy = document.createElement("td");
            tdEnemy.id = `e${i},${j}`;
            tdEnemy.addEventListener("click", () => NePlayerClick(tdEnemy, i, j));
            trEnemy.appendChild(tdEnemy);
        }
        playerTable.appendChild(trPlayer);
        neplayerTable.appendChild(trEnemy);
    }
}

randomBtn.addEventListener("click", randomPlayerShips);

start.addEventListener("click", () => {
    if (!started) {
        if (pShipsPlaced < 20) return;
        started = true;
        randomBtn.disabled = true;
        playerTable.classList.add("disabled");
        neplayerTable.classList.remove("disabled");
        startText.textContent = "Почати заново";
        statusText.textContent = "Гру розпочато! Стріляй по полю супротивника.";
    } else {
        initGame();
    }
});

let isDraggingCurl = false;
let isTurningPage = false;
let curlStartX = 0;
let curlStartY = 0;

function openSecretPage() {
    if (isTurningPage) return;
    isTurningPage = true;
    isDraggingCurl = false;
    pageCurl.classList.remove("dragging");
    pageCurl.style.width = "";
    pageCurl.style.height = "";
    pageCurl.classList.add("turning");
    notebookPage.classList.add("page-flip-out");

    setTimeout(() => {
        window.location.href = SECRET_PAGE;
    }, 600);
}

pageCurl.addEventListener("pointerdown", (e) => {
    if (isTurningPage) return;
    isDraggingCurl = true;
    curlStartX = e.clientX;
    curlStartY = e.clientY;
    pageCurl.classList.add("dragging");
    pageCurl.setPointerCapture(e.pointerId);
});

pageCurl.addEventListener("pointermove", (e) => {
    if (!isDraggingCurl || isTurningPage) return;
    const pullX = window.innerWidth - e.clientX;
    const pullY = window.innerHeight - e.clientY;
    const size = Math.max(48, Math.min(420, Math.max(pullX, pullY) + 24));
    pageCurl.style.width = `${size}px`;
    pageCurl.style.height = `${size}px`;

    if (size >= 210) {
        openSecretPage();
    }
});

function releaseCurl(e) {
    if (!isDraggingCurl || isTurningPage) return;
    isDraggingCurl = false;
    pageCurl.classList.remove("dragging");

    const moved = Math.hypot(e.clientX - curlStartX, e.clientY - curlStartY);
    if (moved < 6) {
        openSecretPage();
    } else {
        pageCurl.style.width = "";
        pageCurl.style.height = "";
    }
}

pageCurl.addEventListener("pointerup", releaseCurl);
pageCurl.addEventListener("pointercancel", releaseCurl);

window.addEventListener("DOMContentLoaded", initGame);