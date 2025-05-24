let input = {
    up: false,
    down: false,
    left: false,
    right: false
};

let paused = false;
let playerLives = 3;
let playermaxLives = 5; // Maximum lives
let collisionCooldown = false; // Prevents multiple life loss in quick succession


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
    checkLifeItemCollection(); // Check for life pickups
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

function startNewLevel() {
    main.innerHTML = ''; // Clear the old level
    nextButton.style.display = 'none'; // Hide next button if used

    generateRandomMaze(); // Create and display the maze
    startGame();          // Start player controls
    moveEnemy();          // Start enemy movement
    pointCheck();         // Start checking for point collection
}

// Maze Layout (2D Array)
let currentLevel = 0;
// Maze layout goes here

let maze = [// will hold the current level's maze
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

function generateRandomMaze(rows, cols) {
    const newMaze = [];

    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            if (y === 0 || x === 0 || y === rows - 1 || x === cols - 1) {
                row.push(1); // Wall border
            } else {
                row.push(Math.random() < 0.2 ? 1 : 0); // 20% chance wall, else point
            }
        }
        newMaze.push(row);
    }

   
// Add 3 enemies
    let enemiesPlaced = 0;
    while (enemiesPlaced < 3) {
        let ry = Math.floor(Math.random() * rows);
        let rx = Math.floor(Math.random() * cols);
        if (newMaze[ry][rx] === 0) {
            newMaze[ry][rx] = 3;
            enemiesPlaced++;
        }
    }

    return newMaze;
}

// Render the maze

function renderMaze(mazeData) {
    main.innerHTML = '';
    for (let row of mazeData) {
        for (let cell of row) {
            const block = document.createElement('div');
            block.classList.add('block');
            switch (cell) {
                case 1:
                    block.classList.add('wall');
                    break;
                case 2:
                    block.id = 'player';
                    const mouth = document.createElement('div');
                    mouth.classList.add('mouth');
                    block.appendChild(mouth);
                    break;
                case 3:
                    block.classList.add('enemy');
                    break;
                default:
                    block.classList.add('point');
                    block.style.height = '1vh';
                    block.style.width = '1vh';
            }
            main.appendChild(block);
        }
    }
}
// Initialize the maze
function initializeMaze() {
    maze = levels[currentLevel];
    renderMaze(maze);
}
    


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
let player = document.getElementById('player');
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


function loadLevel(index) {
    maze = levels[index];
    currentLevel = index;
    renderMaze();
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
    const startButton = document.getElementById('gamestart');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }


    // Shortcuts
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (['p', 'r', 'e', 'm'].includes(key)) e.preventDefault();

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

    resumeBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    exitBtn.addEventListener('click', exitGame);
    mainMenuBtn.addEventListener('click', returnToMainMenu);

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


    // Click handlers (for buttons)
    resumeBtn.addEventListener('click', () => {
        resumeGame();
    });

    restartBtn.addEventListener('click', () => {
        togglePause();
        restartGame();
    });

    exitBtn.addEventListener('click', () => {
        togglePause();
        exitGame();
    });

    mainMenuBtn.addEventListener('click', () => {
        togglePause();
        returnToMainMenu();
    });

    // Toggle Pause Menu

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

    const restartButton = document.querySelector('.restart');
    restartButton.style.display = 'none';


    function restartGame() {
        console.log("Restarting game...");

        // Remove all enemies from DOM
        document.querySelectorAll('.enemy').forEach(e => e.remove());

        // Reset game state
        playerTop = 0;
        playerLeft = 0;
        score = 0;
        gameRunning = false;
        paused = false;
        waitTillStartEnemyMove = false;

        upPressed = false;
        downPressed = false;
        leftPressed = false;
        rightPressed = false;
        pausePressed = false;

        // Reset visuals
        restartButton.style.display = 'none';
        player.classList.remove('dead');
        player.style.top = '0px';
        player.style.left = '0px';
        document.querySelector('.score p').textContent = score;

        // Remove listeners to avoid duplicates
        document.removeEventListener('keydown', keyDown);
        document.removeEventListener('keyup', keyUp);


        // Re-add listeners
        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);

        // Resume game
        gameRunning = true;
        startGame();
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

    function spawnEnemies() {
        // Example: create 3 enemies at fixed positions
        for (let i = 0; i < 3; i++) {
            const enemy = document.createElement('div');
            enemy.classList.add('enemy');
            enemy.style.top = (i * 50) + 'px';
            enemy.style.left = (i * 100) + 'px';
            main.appendChild(enemy);
        }
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
    function isPaused() {
        return paused === true;
    }
});



// Point Collection
function checkPointCollection() {
    const playerRect = player.getBoundingClientRect();

    let pointsRemaining = 0;

    document.querySelectorAll('.point').forEach(point => {
        const pointRect = point.getBoundingClientRect();

        if (intersect(playerRect, pointRect)) {
            point.classList.remove('point'); // Remove point from the board
            point.style.background = 'none'; // Make sure it's not visible anymore
            score++;
            document.querySelector('.score p').textContent = score;
        } else {
            pointsRemaining++; // Count remaining points
        }
    });

    //  Check after processing all points
    if (pointsRemaining === 0) {
        gameWin();
    }
}


function gameWin() {
    alert(`Level Complete!`);

    // Optional: If you're tracking levels
    if (levels.length > 1) {
        let nextLevel;
        do {
            nextLevel = Math.floor(Math.random() * levels.length);
        } while (nextLevel === currentLevel);

        currentLevel = nextLevel;
    }

    // Clear the game board before loading new one
    main.innerHTML = '';
    score = 0; // Optionally reset score or continue from current
    document.querySelector('.score p').textContent = score;

    // Now load the new level
    randomNextLevel();
}
function randomNextLevel() {
    let next;
    do {
        next = Math.floor(Math.random() * levels.length);
    } while (next === currentLevel);
    loadLevel(next);
}


function updatePlayerPosition() {
    if (!player) return;
    player.style.position = 'absolute';
    player.style.top = `${playerPosition.top}px`;
    player.style.left = `${playerPosition.left}px`;
}


function nextLevel() {
    waitTillStartEnemyMove = false;
    upPressed = downPressed = leftPressed = rightPressed = false;
    playerTop = playerLeft = 0;

    maze = generateRandomMaze(10, 10); // 10x10 grid
    renderMaze(maze);

    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);

    startGame();
}


function updateLeaderboard() {
    let leaderboardElement = document.querySelector('.leaderboard ol');
    let scores = JSON.parse(localStorage.getItem('scores')) || [];

    scores.sort((a, b) => b[1] - a[1]);
    leaderboardElement.innerHTML = '';

    scores.slice(0, 5).forEach(([name, score], i) => {
        let li = document.createElement('li');
        li.textContent = `${name} ........ ${score}`;
        if (i === 0) li.style.color = 'gold';
        leaderboardElement.appendChild(li);
    });
}

function topFiveLocalStorage() {
    let playerName = sessionStorage.getItem('playerName') || prompt('What is your name?');

    if (!playerName) return;
    sessionStorage.setItem('playerName', playerName);

    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    const existing = scores.find(score => score[0] === playerName);

    if (existing) {
        if (pointScoreTrack > existing[1]) {
            existing[1] = pointScoreTrack;
        }
    } else {
        scores.push([playerName, pointScoreTrack]);
    }

    scores.sort((a, b) => b[1] - a[1]);
    localStorage.setItem('scores', JSON.stringify(scores.slice(0, 5)));

    updateLeaderboard();
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

        // Collision detection with cooldown
        const playerRect = player.getBoundingClientRect();
        if (intersect(playerRect, rect) && !collisionCooldown) {
            handlePlayerHit();
        }
    });
}




function getRandomDirection() {
    return Math.floor(Math.random() * 4) + 1;
}

function hasWall(rect, side) {
    // Replace with actual wall detection logic
    return false;
}

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
        console.log("Ouch! Lives left:", lives);


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

function dropLifeItem(x, y) {
    const life = document.createElement('div');
    life.classList.add('life-item');
    life.style.position = 'absolute';
    life.style.top = `${y}px`;
    life.style.left = `${x}px`;
    main.appendChild(life);

    // Animate or timeout the life item (optional)
    setTimeout(() => {
        if (main.contains(life)) {
            life.remove(); // Remove after 10 seconds if not collected
        }
    }, 10000);
}

function defeatEnemy(enemy) {
    const rect = enemy.getBoundingClientRect();

    // Remove enemy from the game
    enemy.remove();

    // 30% chance to drop a life item
    if (Math.random() < 0.3) {
        dropLifeItem(rect.left, rect.top);
    }
}

function checkLifeItemCollection() {
    const playerRect = player.getBoundingClientRect();

    document.querySelectorAll('.life-item').forEach(life => {
        const lifeRect = life.getBoundingClientRect();

        if (intersect(playerRect, lifeRect)) {
            // Increase lives only if below max
            if (playerLives < playermaxLives) {
                playerLives++;

                // Add a life indicator
                const livesList = document.querySelector('.lives ul');
                const li = document.createElement('li');
                livesList.appendChild(li);
            }

            // Remove the collected life item
            life.remove();
        }
    });
}



// Called when the player collects a special heart item
function collectHeart() {
    if (lives < maxLives) {
        lives++;
        console.log("Extra life collected! Lives:", lives);
    } else {
        // Optional: give bonus score if already full lives
        score += 50;
        console.log("Bonus points! Score:", score);
    }
}

function gameOver() {
    alert("Game Over! You ran out of lives.");
    location.reload(); // Or navigate to a game over screen
}

// Example helper: Random direction generator (1-4)
function getRandomDirection() {
    return Math.floor(Math.random() * 4) + 1;
}

// Dummy example function — replace with real logic
function hasWall(rect, side) {
    // Implement your wall-checking logic here based on rect and side (top, bottom, left, right)
    return false; // No walls by default
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
