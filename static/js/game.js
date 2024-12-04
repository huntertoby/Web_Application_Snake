    // game.js

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const gridSize = 40;
    const tileCountX = canvas.width / gridSize;
    const tileCountY = canvas.height / gridSize;

    let snake = [
        { x: gridSize * 3, y: 0 },
        { x: gridSize * 2, y: 0 },
        { x: gridSize, y: 0 }
    ];
    let direction = 'right';
    let food = {};
    let specialFoods = [];
    let score = 0;

    const FOOD_TYPES = {
        NORMAL: { color: 'red', effect: 'normal' },
        SPEED_UP: { color: 'green', effect: 'speed_up' },
        SLOW_DOWN: { color: 'blue', effect: 'slow_down' },
        POISON: { color: 'purple', effect: 'poison' },
        DOUBLE_SCORE: { color: 'gold', effect: 'double_score' }
    };

    let speed = 200;
    let originalSpeed = 200;
    let gameInterval;
    let speedUpActive = false;
    let slowDownActive = false;
    let doubleScoreActive = false;
    let effectTimeout;

    function init() {
        generateFood();
        startGameLoop();
        document.addEventListener('keydown', keyDownEvent);
        updateScoreDisplay();
        fetchLeaderboard();
    }

    function generateFood() {
        let x = Math.floor(Math.random() * tileCountX) * gridSize;
        let y = Math.floor(Math.random() * tileCountY) * gridSize;

        while (snake.some(segment => segment.x === x && segment.y === y) ||
               specialFoods.some(f => f.x === x && f.y === y)) {
            x = Math.floor(Math.random() * tileCountX) * gridSize;
            y = Math.floor(Math.random() * tileCountY) * gridSize;
        }

        food = {
            x: x,
            y: y,
            color: FOOD_TYPES.NORMAL.color,
            effect: FOOD_TYPES.NORMAL.effect
        };
    }

    function generateSpecialFood() {
    const chance = Math.random();
    if (chance < 0.5) {
        const numSpecialFoods = Math.floor(Math.random() * 3) + 1; // 1 到 3
        for (let i = 0; i < numSpecialFoods; i++) {
            const foodTypes = [FOOD_TYPES.SPEED_UP, FOOD_TYPES.SLOW_DOWN, FOOD_TYPES.POISON, FOOD_TYPES.DOUBLE_SCORE];
            const randomIndex = Math.floor(Math.random() * foodTypes.length);
            const type = foodTypes[randomIndex];

            let x = Math.floor(Math.random() * tileCountX) * gridSize;
            let y = Math.floor(Math.random() * tileCountY) * gridSize;

            while (snake.some(segment => segment.x === x && segment.y === y) ||
                   specialFoods.some(f => f.x === x && f.y === y) ||
                   (food.x === x && food.y === y)) {
                x = Math.floor(Math.random() * tileCountX) * gridSize;
                y = Math.floor(Math.random() * tileCountY) * gridSize;
            }

            const specialFood = {
                x: x,
                y: y,
                color: type.color,
                effect: type.effect
            };

            specialFoods.push(specialFood);

            setTimeout(() => {
                specialFoods = specialFoods.filter(f => f !== specialFood);
            }, 10000);
        }
    }
}


    function startGameLoop() {
        clearInterval(gameInterval);
        gameInterval = setInterval(() => {
            update();
            draw();
        }, speed);
    }

    function update() {
        const head = { ...snake[0] };
        switch (direction) {
            case 'left':
                head.x -= gridSize;
                break;
            case 'up':
                head.y -= gridSize;
                break;
            case 'right':
                head.x += gridSize;
                break;
            case 'down':
                head.y += gridSize;
                break;
        }

        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            gameOver();
            return;
        }

        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += doubleScoreActive ? 2 : 1;
            updateScoreDisplay();
            generateFood();
            generateSpecialFood();
        } else {
            snake.pop();
        }
        for (let i = 0; i < specialFoods.length; i++) {
            const specialFood = specialFoods[i];
            if (head.x === specialFood.x && head.y === specialFood.y) {
                handleFoodEffect(specialFood.effect);
                specialFoods.splice(i, 1); // 移除已經吃掉的特殊食物
                break;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        snake.forEach((segment, index) => {
            let x = segment.x;
            let y = segment.y;
            let gradient = ctx.createLinearGradient(x, y, x + gridSize, y + gridSize);
            let colorValue = Math.floor(255 * (index / snake.length));
            let startColor = `rgb(0, ${255 - colorValue}, 0)`;
            let endColor = `rgb(0, ${255 - colorValue * 0.5}, 0)`;

            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, gridSize, gridSize);
        });

        ctx.fillStyle = food.color;
        ctx.fillRect(food.x, food.y, gridSize, gridSize);

        specialFoods.forEach(specialFood => {
            ctx.fillStyle = specialFood.color;
            ctx.fillRect(specialFood.x, specialFood.y, gridSize, gridSize);
        });
    }

    function keyDownEvent(e) {
        switch (e.keyCode) {
            case 37:
                if (direction !== 'right') direction = 'left';
                break;
            case 38:
                if (direction !== 'down') direction = 'up';
                break;
            case 39:
                if (direction !== 'left') direction = 'right';
                break;
            case 40:
                if (direction !== 'up') direction = 'down';
                break;
        }
    }

    function handleFoodEffect(effect) {
        clearTimeout(effectTimeout);

        switch (effect) {
            case 'speed_up':
                speedUpActive = true;
                slowDownActive = false;
                speed = originalSpeed / 2; // 加速
                startGameLoop();
                effectTimeout = setTimeout(() => {
                    speedUpActive = false;
                    speed = originalSpeed;
                    startGameLoop();
                }, 5000);
                break;
            case 'slow_down':
                slowDownActive = true;
                speedUpActive = false;
                speed = originalSpeed * 1.5; // 減速
                startGameLoop();
                effectTimeout = setTimeout(() => {
                    slowDownActive = false;
                    speed = originalSpeed;
                    startGameLoop();
                }, 5000);
                break;
            case 'double_score':
                doubleScoreActive = true;
                effectTimeout = setTimeout(() => {
                    doubleScoreActive = false;
                }, 10000);
                break;
            case 'poison':
                gameOver();
                break;
        }
    }

    function gameOver() {
        clearInterval(gameInterval);
        alert("遊戲結束！您的分數是：" + score);
        // 提交分數
        submitScore();
        // 重置遊戲
        resetGame();
    }

    function resetGame() {
        snake = [
            { x: gridSize * 3, y: 0 },
            { x: gridSize * 2, y: 0 },
            { x: gridSize, y: 0 }
        ];
        direction = 'right';
        score = 0;
        updateScoreDisplay();
        speed = originalSpeed;
        speedUpActive = false;
        slowDownActive = false;
        doubleScoreActive = false;
        specialFoods = [];
        generateFood();
        startGameLoop();
    }

    function updateScoreDisplay() {
        document.getElementById('scoreDisplay').textContent = "分數: " + score;
    }

    function submitScore() {
        fetch('/submit_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score: score })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 更新排行榜
                fetchLeaderboard();
            } else {
                // 處理錯誤
                alert(data.error);
            }
        });
    }

    function fetchLeaderboard() {
        fetch('/get_leaderboard')
            .then(response => response.json())
            .then(data => {
                const leaderboard = data.leaderboard;
                const leaderboardElement = document.getElementById('leaderboard');
                leaderboardElement.innerHTML = '';
                leaderboard.forEach(entry => {
                    const li = document.createElement('li');
                    li.textContent = `${entry.name}: ${entry.score}`;
                    leaderboardElement.appendChild(li);
                });
            });
    }

    // 啟動遊戲
    init();
