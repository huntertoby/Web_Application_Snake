// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leaderboardElement = document.getElementById('leaderboard');

let gameState;
let gameOver = false;
let score = 0;
let currentDirection = 1; // 初始方向为右（1）
let gameLoop; // 用于存储游戏循环的定时器
let gameStarted = false; // 标记游戏是否已经开始

function showMessage(message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function startGame() {
    fetch('/start_game', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        gameState = data.state;
        drawGame();
        gameOver = false;
        score = 0;
        currentDirection = 1; // 重置方向为右
        gameStarted = true;
        // 开始游戏循环
        gameLoop = setInterval(() => {
            move(currentDirection);
        }, 200); // 每 200 毫秒移动一次
    })
    .catch(error => console.error('Error starting game:', error));
}

function move(action) {
    if (gameOver) return;
    fetch('/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        gameState = data.state;
        score += data.reward;
        gameOver = data.done;
        drawGame();
        if (gameOver) {
            clearInterval(gameLoop); // 停止游戏循环
            submitScore();
            showMessage('游戏结束！按下任意键重新开始');
            gameStarted = false;
        }
    })
    .catch(error => console.error('Error moving:', error));
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 40;

    // 畫蛇
    gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#228B22" : "#32CD32"; // 頭和身體不同顏色
        ctx.fillRect(segment[0], segment[1], cellSize, cellSize);
    });

    // 畫食物
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(gameState.food[0], gameState.food[1], cellSize, cellSize);
}


document.addEventListener('keydown', event => {
    if (!gameStarted) {
        // 如果游戏尚未开始，按下任意键开始游戏
        startGame();
        return;
    }
    if (event.key === 'ArrowUp' && currentDirection !== 2) {
        currentDirection = 0;
    } else if (event.key === 'ArrowRight' && currentDirection !== 3) {
        currentDirection = 1;
    } else if (event.key === 'ArrowDown' && currentDirection !== 0) {
        currentDirection = 2;
    } else if (event.key === 'ArrowLeft' && currentDirection !== 1) {
        currentDirection = 3;
    }
});

function submitScore() {
    fetch('/submit_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score: score })
    })
    .then(() => {
        getLeaderboard();
    })
    .catch(error => console.error('Error submitting score:', error));
}

function getLeaderboard() {
    fetch('/get_leaderboard')
        .then(response => response.json())
        .then(data => {
            leaderboardElement.innerHTML = '';
            data.leaderboard.forEach(entry => {
                const li = document.createElement('li');
                li.textContent = `${entry.name}: ${entry.score}`;
                leaderboardElement.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching leaderboard:', error));
}

// 初始显示提示信息
showMessage('按下任意键开始');

getLeaderboard();
