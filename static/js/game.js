const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leaderboardElement = document.getElementById('leaderboard');


let snake = [[200, 200], [160, 200], [120, 200]];
let food = [320, 200];
let cellSize = 40;
let currentDirection = 1;
let gameLoop;
let gameOver = false;
let score = 0;
let gameStarted = false;


function startGame() {
    resetGame();
    gameLoop = setInterval(() => move(), 150);
    gameStarted = true; //

}



function resetGame() {
    snake = [[200, 200], [160, 200], [120, 200]];
    food = spawnFood();
    currentDirection = 1;
    gameOver = false;
    score = 0;
    drawGame();
}


function spawnFood() {
    while (true) {
        const x = Math.floor(Math.random() * (canvas.width / cellSize)) * cellSize;
        const y = Math.floor(Math.random() * (canvas.height / cellSize)) * cellSize;

        // 確保食物不生成在蛇身上
        if (!snake.some(segment => segment[0] === x && segment[1] === y)) {
            return [x, y];
        }
    }
}



// 蛇移動邏輯
function move() {
    if (gameOver) return;

    const head = [...snake[0]];

    // 根據方向更新蛇頭的位置
    if (currentDirection === 0) head[1] -= cellSize; // 上
    if (currentDirection === 1) head[0] += cellSize; // 右
    if (currentDirection === 2) head[1] += cellSize; // 下
    if (currentDirection === 3) head[0] -= cellSize; // 左

    // 檢查碰撞
    if (isCollision(head)) {
        gameOver = true;
        clearInterval(gameLoop);
        showMessage('遊戲結束！按下任何鍵重新開始');
        submitScore();
        return;
    }

    // 將蛇頭插入蛇陣列
    snake.unshift(head);

    // 檢查是否吃到食物
    if (head[0] === food[0] && head[1] === food[1]) {
        food = spawnFood();
        score += 10;

    } else {
        snake.pop();
    }

    drawGame();
}

// 碰撞檢測
function isCollision(head) {

    if (head[0] < 0 || head[1] < 0 || head[0] >= canvas.width || head[1] >= canvas.height) {
        return true;
    }
    return snake.slice(1).some(segment => segment[0] === head[0] && segment[1] === head[1]);
}

// 繪製遊戲畫面
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#228B22" : "#32CD32"; // 頭部和身體顏色不同
        ctx.fillRect(segment[0], segment[1], cellSize, cellSize);
    });


    ctx.fillStyle = "#FF0000";
    ctx.fillRect(food[0], food[1], cellSize, cellSize);
}

function showMessage(message) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}


document.addEventListener('keydown', event => {
    if (!gameStarted || gameOver) {
        startGame();
        return;
    }
    if (event.key === 'ArrowUp' && currentDirection !== 2) currentDirection = 0;
    if (event.key === 'ArrowRight' && currentDirection !== 3) currentDirection = 1;
    if (event.key === 'ArrowDown' && currentDirection !== 0) currentDirection = 2;
    if (event.key === 'ArrowLeft' && currentDirection !== 1) currentDirection = 3;
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

showMessage('按下任意鍵開始');
getLeaderboard();