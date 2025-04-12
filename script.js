// Game Control State
let input = {
    up: false,
    down: false,
    left: false,
    right: false
};


// DOM Elements
const main = document.querySelector('main');
const startButton = document.getElementById('gamestart');

const playerSpeedInput = document.getElementById('playerSpeed');
const enemySpeedInput = document.getElementById('enemySpeed');
const playerSpeedValue = document.getElementById('playerSpeedValue');
const enemySpeedValue = document.getElementById('enemySpeedValue');

let playerSpeed = 3;
let enemySpeed = 2;

playerSpeedInput.addEventListener('input', () => {
    playerSpeed = parseInt(playerSpeedInput.value);
    playerSpeedValue.textContent = playerSpeed;
});
enemySpeedInput.addEventListener('input', () => {
    enemySpeed = parseInt(enemySpeedInput.value);
    enemySpeedValue.textContent = enemySpeed;
});

// Game Constants
const TILE = {
    WALL: 1,
    PLAYER: 2,
    ENEMY: 3,
    POINT: 0
};

// Maze Layout (2D Array)
let currentLevel = 0;
 // will hold the current level's maze

const maze = [// will hold the current level's maze
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 1, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Render Maze
maze.flat().forEach((tile, index) => {
    const block = document.createElement('div');
    block.classList.add('block');

    switch (tile) {
        case TILE.WALL:
            block.classList.add('wall');
            break;
        case TILE.PLAYER:
            block.id = 'player';
            const mouth = document.createElement('div');
            mouth.classList.add('mouth');
            block.appendChild(mouth);
            break;
        case TILE.ENEMY:
            block.classList.add('enemy');
            break;
        default:
            block.classList.add('point');
            block.style.height = '1vh';
            block.style.width = '1vh';
    }

    main.appendChild(block);
});

// Player Setup
const player = document.getElementById('player');
const playerMouth = player.querySelector('.mouth');

let playerPosition = { top: 0, left: 0 };
let score = 0;
let enemies = document.querySelectorAll('.enemy');
let gameRunning = false;

// Input Handling
document.addEventListener('keydown', e => {
    if (e.key.startsWith('Arrow')) input[e.key.replace('Arrow', '').toLowerCase()] = true;
});
document.addEventListener('keyup', e => {
    if (e.key.startsWith('Arrow')) input[e.key.replace('Arrow', '').toLowerCase()] = false;
});

// Touch Controls
const buttons = [
    { id: 'lbttn', direction: 'left' },
    { id: 'rbttn', direction: 'right' },
    { id: 'ubttn', direction: 'up' },
    { id: 'dbttn', direction: 'down' },
];

buttons.forEach(btn => {
    const el = document.getElementById(btn.id);
    el.addEventListener('mousedown', () => input[btn.direction] = true);
    el.addEventListener('mouseup', () => input[btn.direction] = false);
    el.addEventListener('touchstart', () => input[btn.direction] = true);
    el.addEventListener('touchend', () => input[btn.direction] = false);
});

// Game Loop
function gameLoop() {
    if (!gameRunning) return;

    movePlayer();
    checkPointCollection();
    moveEnemies();

    requestAnimationFrame(gameLoop); // Optimized animation frame
}

// Player Movement
function movePlayer() {
    const pos = player.getBoundingClientRect();

    const directionChecks = {
        down: () => !hasWall(pos, 'bottom'),
        up: () => !hasWall(pos, 'top'),
        left: () => !hasWall(pos, 'left'),
        right: () => !hasWall(pos, 'right')
    };

    for (const dir in input) {
        if (input[dir] && directionChecks[dir]()) {
            switch (dir) {
                case 'up': playerPosition.top -= playerSpeed; playerMouth.className = 'mouth up'; break;
                case 'down': playerPosition.top += playerSpeed; playerMouth.className = 'mouth down'; break;
                case 'left': playerPosition.left -= playerSpeed; playerMouth.className = 'mouth left'; break;
                case 'right': playerPosition.left += playerSpeed; playerMouth.className = 'mouth right'; break;
            }
        }
    }

    player.style.top = `${playerPosition.top}px`;
    player.style.left = `${playerPosition.left}px`;
}

// Point Collection
function checkPointCollection() {
    const playerRect = player.getBoundingClientRect();
    document.querySelectorAll('.point').forEach(point => {
        const pointRect = point.getBoundingClientRect();
        if (intersect(playerRect, pointRect)) {
            point.classList.remove('point');
            point.style.background = 'none';
            score++;
            document.querySelector('.score p').textContent = score;
        }
    });
}

// Start Game
function startGame() {
    gameRunning = true;
    startButton.style.display = 'none';
    requestAnimationFrame(gameLoop); // Start the game loop
}

// Enemy AI Movement
function moveEnemies() {
    enemies.forEach(enemy => {
        const rect = enemy.getBoundingClientRect();
        let top = parseInt(enemy.style.top) || 0;
        let left = parseInt(enemy.style.left) || 0;

        let direction = enemy.direction || getRandomDirection();
        let moved = false;

        const directions = [1, 2, 3, 4]; // 1=Down, 2=Up, 3=Left, 4=Right

        const tryMove = dir => {
            switch (dir) {
                case 1:
                    if (!hasWall(rect, 'bottom')) {
                        top += enemySpeed;
                        moved = true;
                    }
                    break;
                case 2:
                    if (!hasWall(rect, 'top')) {
                        top -= enemySpeed;
                        moved = true;
                    }
                    break;
                case 3:
                    if (!hasWall(rect, 'left')) {
                        left -= enemySpeed;
                        moved = true;
                    }
                    break;
                case 4:
                    if (!hasWall(rect, 'right')) {
                        left += enemySpeed;
                        moved = true;
                    }
                    break;
            }
            if (moved) {
                enemy.style.top = `${top}px`;
                enemy.style.left = `${left}px`;
            }
            return moved;
        };

        moved = tryMove(direction);
        if (!moved) {
            const altDirs = directions.filter(d => d !== direction);
            for (let i = 0; i < altDirs.length && !moved; i++) {
                const newDir = altDirs.splice(Math.floor(Math.random() * altDirs.length), 1)[0];
                moved = tryMove(newDir);
                if (moved) direction = newDir;
            }
        }

        enemy.direction = direction;

        if (intersect(player.getBoundingClientRect(), rect)) {
            alert("Game Over! The enemy caught you.");
            location.reload();
        }
    });
}

function loadLevel(levelIndex) {
    main.innerHTML = ''; // clear old maze
    maze = levels[levelIndex];

    // Reset score and positions
    score = 0;
    document.querySelector('.score p').textContent = score;
    enemies = [];

    maze.flat().forEach((tile, index) => {
        const block = document.createElement('div');
        block.classList.add('block');

        switch (tile) {
            case TILE.WALL:
                block.classList.add('wall');
                break;
            case TILE.PLAYER:
                block.id = 'player';
                const mouth = document.createElement('div');
                mouth.classList.add('mouth');
                block.appendChild(mouth);
                break;
            case TILE.ENEMY:
                block.classList.add('enemy');
                break;
            default:
                block.classList.add('point');
                block.style.height = '1vh';
                block.style.width = '1vh';
        }

        main.appendChild(block);
    });

    // Reset player and enemy references
    const newPlayer = document.getElementById('player');
    if (newPlayer) {
        playerPosition = { top: 0, left: 0 };
        player.style.top = '0px';
        player.style.left = '0px';
    }

    enemies = document.querySelectorAll('.enemy');
}


// Utility Functions
function hasWall(rect, direction) {
    const checkPoints = {
        top: [rect.left, rect.top - 1, rect.right, rect.top - 1],
        bottom: [rect.left, rect.bottom + 1, rect.right, rect.bottom + 1],
        left: [rect.left - 1, rect.top, rect.left - 1, rect.bottom],
        right: [rect.right + 1, rect.top, rect.right + 1, rect.bottom]
    };
    const [x1, y1, x2, y2] = checkPoints[direction];
    return document.elementFromPoint(x1, y1)?.classList.contains('wall') ||
           document.elementFromPoint(x2, y2)?.classList.contains('wall');
}

function getRandomDirection() {
    return Math.floor(Math.random() * 4) + 1;
}

function intersect(rect1, rect2) {
    return (
        rect1.right > rect2.left &&
        rect1.left < rect2.right &&
        rect1.bottom > rect2.top &&
        rect1.top < rect2.bottom
    );
}

startButton.addEventListener('click', startGame);






