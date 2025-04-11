let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');
const startButton = document.querySelector('#gamestart');

// Player = 2, Wall = 1, Enemy = 3, Point = 0
let maze = [
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
maze.flat().forEach(tile => {
    let block = document.createElement('div');
    block.classList.add('block');

    switch (tile) {
        case 1:
            block.classList.add('wall');
            break;
        case 2:
            block.id = 'player';
            let mouth = document.createElement('div');
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
});

// Player movement
function keyDown(e) {
    if (e.key === 'ArrowUp') upPressed = true;
    else if (e.key === 'ArrowDown') downPressed = true;
    else if (e.key === 'ArrowLeft') leftPressed = true;
    else if (e.key === 'ArrowRight') rightPressed = true;
}
function keyUp(e) {
    if (e.key === 'ArrowUp') upPressed = false;
    else if (e.key === 'ArrowDown') downPressed = false;
    else if (e.key === 'ArrowLeft') leftPressed = false;
    else if (e.key === 'ArrowRight') rightPressed = false;
}

const player = document.querySelector('#player');
const playerMouth = player.querySelector('.mouth');
let playerTop = 0;
let playerLeft = 0;
let pointScoreTrack = 0;
let waitTillStartEnemyMove = false;
let enemies = document.querySelectorAll('.enemy');

setInterval(() => {
    checkPoints();
    movePlayer();
}, 10);

function movePlayer() {
    let position = player.getBoundingClientRect();
    if (downPressed) {
        let btmL = document.elementFromPoint(position.left, position.bottom + 1);
        let btmR = document.elementFromPoint(position.right, position.bottom + 1);
        if (!btmL.classList.contains('wall') && !btmR.classList.contains('wall')) playerTop++;
        playerMouth.className = 'mouth down';
    } else if (upPressed) {
        let topL = document.elementFromPoint(position.left, position.top - 1);
        let topR = document.elementFromPoint(position.right, position.top - 1);
        if (!topL.classList.contains('wall') && !topR.classList.contains('wall')) playerTop--;
        playerMouth.className = 'mouth up';
    } else if (leftPressed) {
        let leftT = document.elementFromPoint(position.left - 1, position.top);
        let leftB = document.elementFromPoint(position.left - 1, position.bottom);
        if (!leftT.classList.contains('wall') && !leftB.classList.contains('wall')) playerLeft--;
        playerMouth.className = 'mouth left';
    } else if (rightPressed) {
        let rightT = document.elementFromPoint(position.right + 1, position.top);
        let rightB = document.elementFromPoint(position.right + 1, position.bottom);
        if (!rightT.classList.contains('wall') && !rightB.classList.contains('wall')) playerLeft++;
        playerMouth.className = 'mouth right';
    }

    player.style.top = `${playerTop}px`;
    player.style.left = `${playerLeft}px`;
}

function checkPoints() {
    const position = player.getBoundingClientRect();
    const points = document.querySelectorAll('.point');

    points.forEach(point => {
        const pos = point.getBoundingClientRect();
        if (
            position.right > pos.left &&
            position.left < pos.right &&
            position.bottom > pos.top &&
            position.top < pos.bottom
        ) {
            point.classList.remove('point');
            point.style.background = 'none';
            pointScoreTrack++;
            document.querySelector('.score p').textContent = pointScoreTrack;
        }
    });
}

// Enemy logic
function randomNumber() {
    return Math.floor(Math.random() * 4) + 1;
}

function moveEnemies() {
    setInterval(() => {
        if (!waitTillStartEnemyMove) return;

        enemies = document.querySelectorAll('.enemy');
        enemies.forEach(enemy => {
            const enemyPos = enemy.getBoundingClientRect();
            let top = parseInt(enemy.style.top) || 0;
            let left = parseInt(enemy.style.left) || 0;
            let direction = enemy.direction || randomNumber();

            let canMove = false;

            switch (direction) {
                case 1:
                    if (!hasWallBelow(enemyPos)) {
                        top++; canMove = true;
                    }
                    break;
                case 2:
                    if (!hasWallAbove(enemyPos)) {
                        top--; canMove = true;
                    }
                    break;
                case 3:
                    if (!hasWallLeft(enemyPos)) {
                        left--; canMove = true;
                    }
                    break;
                case 4:
                    if (!hasWallRight(enemyPos)) {
                        left++; canMove = true;
                    }
                    break;
            }

            if (canMove) {
                enemy.style.top = `${top}px`;
                enemy.style.left = `${left}px`;
            }

            enemy.direction = randomNumber();

            const playerPos = player.getBoundingClientRect();
            if (
                enemyPos.left < playerPos.right &&
                enemyPos.right > playerPos.left &&
                enemyPos.top < playerPos.bottom &&
                enemyPos.bottom > playerPos.top
            ) {
                alert("Game Over! The enemy caught you.");
                location.reload();
            }
        });
    }, 200);
}

function hasWallBelow(pos) {
    return document.elementFromPoint(pos.left, pos.bottom + 1).classList.contains('wall') ||
           document.elementFromPoint(pos.right, pos.bottom + 1).classList.contains('wall');
}
function hasWallAbove(pos) {
    return document.elementFromPoint(pos.left, pos.top - 1).classList.contains('wall') ||
           document.elementFromPoint(pos.right, pos.top - 1).classList.contains('wall');
}
function hasWallLeft(pos) {
    return document.elementFromPoint(pos.left - 1, pos.top).classList.contains('wall') ||
           document.elementFromPoint(pos.left - 1, pos.bottom).classList.contains('wall');
}
function hasWallRight(pos) {
    return document.elementFromPoint(pos.right + 1, pos.top).classList.contains('wall') ||
           document.elementFromPoint(pos.right + 1, pos.bottom).classList.contains('wall');
}

function startGame() {
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    waitTillStartEnemyMove = true;
    moveEnemies();

    const buttons = [
        { id: "lbttn", press: () => leftPressed = true, release: () => leftPressed = false },
        { id: "rbttn", press: () => rightPressed = true, release: () => rightPressed = false },
        { id: "ubttn", press: () => upPressed = true, release: () => upPressed = false },
        { id: "dbttn", press: () => downPressed = true, release: () => downPressed = false },
    ];

    buttons.forEach(btn => {
        const el = document.getElementById(btn.id);
        el.addEventListener('mousedown', btn.press);
        el.addEventListener('mouseup', btn.release);
        el.addEventListener('touchstart', btn.press);
        el.addEventListener('touchend', btn.release);
    });

    startButton.style.display = 'none';
    console.log('Game Started');
}

startButton.addEventListener('click', startGame);









