let input = {
    up: false,
    down: false,
    left: false,
    right: false
};

let paused = false;
let playerLives = 3;

initializeLives(); // Initialize lives display when the game starts

// DOM Elements
const main = document.querySelector('main');
const startButton = document.getElementById('gamestart');

const playerSpeedInput = document.getElementById('playerSpeed');
const enemySpeedInput = document.getElementById('enemySpeed');
const playerSpeedValue = document.getElementById('playerSpeedValue');
const enemySpeedValue = document.getElementById('enemySpeedValue');

let playerSpeed = 3;
let enemySpeed = 2;

function initializeLives() {
    const livesList = document.querySelector('.lives ul');
    livesList.innerHTML = ''; // Clear the list before adding new lives

    // Add the appropriate number of <li> elements based on playerLives
    for (let i = 0; i < playerLives; i++) {
        const li = document.createElement('li');
        livesList.appendChild(li);
    }
}

function updateLives() {
    const livesList = document.querySelector('.lives ul');
    const livesItems = livesList.querySelectorAll('li');

    if (playerLives > 0) {
        playerLives--;
        console.log(`Lives left: ${playerLives}`);

        if (livesItems.length > 0) {
            livesItems[livesItems.length - 1].remove();
        }

        if (playerLives === 0) {
            gameOver();
        }
    }
}


function gameLoop() {
    if (!gameRunning || paused) return;

    movePlayer();
    checkPointCollection();
    moveEnemies();

    requestAnimationFrame(gameLoop);
}

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
// Maze layout goes here

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
]

const levels = [
    // Define different mazes for levels
    [
        [1, 1, 1, 1, 1],
        [1, 2, 0, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 0, 1]
    ],
    [
        [1, 1, 1, 1, 1],
        [1, 2, 0, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 3, 0, 1, 1]
    ]
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
    if (!gameRunning || paused) return;

    movePlayer();
    checkPointCollection();
    moveEnemies();

    requestAnimationFrame(gameLoop);
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

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('.puase');
    const resumeBtn = document.getElementById('resume');
    const restartBtn = document.getElementById('restart');
    const exitBtn = document.getElementById('exit');
    const mainMenuBtn = document.getElementById('mainMenu');

    // Shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (['p', 'r', 'e', 'm'].includes(key)) e.preventDefault(); // Stops unwanted behavior

        switch (key) {
            case 'p':
                togglePause();
                break;
            case 'r':
                if (isPaused()) restartGame();
                break;
            case 'e':
                if (isPaused()) exitGame();
                break;
            case 'm':
                if (isPaused()) returnToMainMenu();
                break;
        }
    });

    // Click handlers (for buttons)
    resumeBtn.addEventListener('click', () => {
        togglePause();
    });

    restartBtn.addEventListener('click', () => {
        console.log("Restarting game...");
    });

    exitBtn.addEventListener('click', () => {
        console.log("Exiting game...");
    });

    mainMenuBtn.addEventListener('click', () => {
        console.log("Going to Main Menu...");
    });

    function togglePause() {
        const isVisible = menu.classList.contains('visible');

        if (isVisible) {
            menu.classList.remove('visible');
            resumeGame();
        } else {
            menu.classList.add('visible');
            pauseGame();
        }
    }

    function pauseGame() {
        console.log("Game paused");
        paused = true;
        main.classList.add('paused'); // Adds 'paused' class for pause visuals or blocking controls
    }

    function resumeGame() {
        console.log("Game resumed");
        paused = false;
        requestAnimationFrame(gameLoop); // Resume the loop
        main.classList.remove('paused'); // Removes 'paused' class
    }

    function restartGame() {
        console.log("Game restarting...");
        gameRunning = false;
        paused = false;
        score = 0;
        document.querySelector('.score p').textContent = score;

        // Clear the current maze and reset everything
        main.innerHTML = ''; // Clear maze
        loadLevel(0); // Reload the initial level (or level 0)

        // Reset player position
        const player = document.getElementById('player');
        player.style.top = '0px';
        player.style.left = '0px';

        // Reset enemies
        enemies = document.querySelectorAll('.enemy');

        // Start the game loop again
        gameRunning = true;
        startGame(); // Restart game loop
    }

    function exitGame() {
        console.log("Exiting game...");
        gameRunning = false;
        paused = false;

        // Clear the maze and stop the game
        main.innerHTML = ''; // Clear maze and any game state

        // Display an exit message
        const exitMessage = document.createElement('div');
        exitMessage.textContent = "Game exited!";
        exitMessage.classList.add('exit-message');
        main.appendChild(exitMessage);

        // After a short timeout, remove the message and reload the page (or redirect to a different page)
        setTimeout(() => {
            exitMessage.remove();
            window.location.reload(); // Reload the page to reset everything
        }, 2000);
    }

    function returnToMainMenu() {
        console.log("Returning to main menu...");
        gameRunning = false;
        paused = false;
        main.innerHTML = ''; // Clear the maze

        // Optionally, reset the game settings or show a message
        const mainMenuMessage = document.createElement('div');
        mainMenuMessage.textContent = "Returned to main menu!";
        mainMenuMessage.classList.add('main-menu-message');
        main.appendChild(mainMenuMessage);

        setTimeout(() => {
            mainMenuMessage.remove();
            // You can redirect to a main menu page if applicable
        }, 2000);
    }
});



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
// Move enemies and check for collisions with the player
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

        


        // Check for collision with player and decrease one life
        if (intersect(player.getBoundingClientRect(), rect)) {
            if (playerLives > 0) {
                playerLives--; // Decrease lives on collision

                // Update the lives display by removing one <li> for each lost life
                const livesList = document.querySelector('.lives ul');
                const livesItems = livesList.querySelectorAll('li');

                // Remove one <li> element to reflect the lost life
                if (livesItems.length > 0) {
                    livesItems[livesItems.length - 1].remove();
                }

                // Check if game over
                if (playerLives <= 0) {
                    alert("Game Over! You ran out of lives.");
                    location.reload(); // Restart the game
                }
            }
        }
    });
}

function intersect(rect1, rect2) {
    return (
        rect1.right > rect2.left &&
        rect1.left < rect2.right &&
        rect1.bottom > rect2.top &&
        rect1.top < rect2.bottom
    );
}

function hitByEnemy() {
    if (playerLives > 0) {
        playerLives--;

        // Update lives display
        const livesList = document.querySelector('.lives ul');
        const livesItems = livesList.querySelectorAll('li');
        if (livesItems.length > 0) {
            livesItems[livesItems.length - 1].remove();
        }

        if (playerLives <= 0) {
            gameOver(); // Call custom game over screen
        }
    }
}


function updateLives() {
    const livesList = document.querySelector('.lives ul');
    const livesItems = livesList.querySelectorAll('li');

    if (playerLives > 0) {
        playerLives--;
        console.log(`Lives left: ${playerLives}`);

        if (livesItems.length > 0) {
            livesItems[livesItems.length - 1].remove();
        }

        if (playerLives === 0) {
            gameOver(); // Custom function for end screen or alert
        }
    }
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

startButton.addEventListener('click', startGame);
