
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');

//Player = 2, Wall = 1, Enemy = 3, Point = 0
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

//Populates the maze in the HTML
for (let y of maze) {
    for (let x of y) {
        let block = document.createElement('div');
        block.classList.add('block');

        switch (x) {
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
    }
}

//Player movement
function keyUp(event) {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
}

function keyDown(event) {
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
}

const player = document.querySelector('#player');
const playerMouth = player.querySelector('.mouth');
let playerTop = 0;
let playerLeft = 0;

setInterval(function () {
    pointcheck();
    if (downPressed) {
        let position = player.getBoundingClientRect()
        let newBottom = position.bottom + 1;
        let btmL = document.elementFromPoint(position.left, newBottom);
        let btmR = document.elementFromPoint(position.right, newBottom);
        if (btmL.classList.contains('wall') == false && btmR.classList.contains('wall') == false) {
            playerTop++;
            player.style.top = playerTop + 'px';
        }
        playerMouth.classList = 'down';
    }
    else if (upPressed) {
        let position = player.getBoundingClientRect();
        let newTop = position.top - 1;
        let topL = document.elementFromPoint(position.left, newTop);
        let topR = document.elementFromPoint(position.right, newTop);
        if (topL.classList.contains('wall') == false && topR.classList.contains('wall') == false) {
            playerTop--;
            player.style.top = playerTop + 'px';
        }
        playerMouth.classList = 'up';
    }
    else if (leftPressed) {
        let position = player.getBoundingClientRect();
        let newLeft = position.left - 1;
        let leftT = document.elementFromPoint(newLeft, position.top);
        let leftB = document.elementFromPoint(newLeft, position.bottom);
        if (leftT.classList.contains('wall') == false && leftB.classList.contains('wall') == false) {
            playerLeft--;
            player.style.left = playerLeft + 'px';
        }
        playerMouth.classList = 'left';
    }

    else if (rightPressed) {
        let position = player.getBoundingClientRect();
        let newRight = position.right + 1;
        let rightT = document.elementFromPoint(newRight, position.top);
        let rightB = document.elementFromPoint(newRight, position.bottom);
        if (rightT.classList.contains('wall') == false && rightB.classList.contains('wall') == false) {
            playerLeft++;
            player.style.left = playerLeft + 'px';
        }
        playerMouth.classList = 'right';
    }
}, 10);



function pointcheck() {
    const position = player.getBoundingClientRect();
    const points = document.querySelectorAll('.point');

    for (let i = 0; i < points.length; i++) {
        let pos = points[i].getBoundingClientRect();
        if (
            position.right > pos.left &&
            position.left < pos.right &&
            position.bottom > pos.top &&
            position.top < pos.bottom
        ) {
            points[i].classList.remove('point');
            points[i].style.background = 'none';

            pointScoreTrack++; // Increase score
            document.querySelector('.score p').textContent = pointScoreTrack; // Update scoreboard
        }
    }
}




// ======================================================================================================
// Points Detection
let pointScoreTrack = 0; //let start of game score = 0 always;
let maxPoints = document.querySelectorAll('.score').length; //get the maximum points achiveable in the maze by selecting All '.point'.length and store it in maxPoints
function pointCheck() {
    const position = player.getBoundingClientRect(); //get player position
    let points = document.querySelectorAll('.score'); //select all with class with points

    if (points.length == 0) {
        newLevelSound.play()
        nextLevel();
        randomNextLevel();
    }

    for (let i = 0; i < points.length; i++) {
        let pos = points[i].getBoundingClientRect();
        if (position.right > pos.left &&
            position.left < pos.right &&
            position.bottom > pos.top &&
            position.top < pos.bottom
        ) {
            points[i].classList.remove('score');    //remove the class of the point when player touches it
            points[i].style.background = 'none'; //remove the background of the point when player touches it
            console.log('score Got')        //log the score got
            pointScoreTrack++; //increment the score by 1 when player touches the point
            console.log(pointScoreTrack); //log the score got
            pointScoreTrack++;
            document.querySelector('.score p').textContent = pointScoreTrack;
        }
    }
};

const startButton = document.querySelector('#gamestart');

startButton.addEventListener('click', () => {

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    waitTillStartEnemyMove = true;

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

    // On-screen button support
document.getElementById('lbttn').addEventListener('mousedown', () => leftPressed = true);
document.getElementById('rbttn').addEventListener('mousedown', () => rightPressed = true);
document.getElementById('ubttn').addEventListener('mousedown', () => upPressed = true);
document.getElementById('dbttn').addEventListener('mousedown', () => downPressed = true);

// When mouse button is released
document.getElementById('lbttn').addEventListener('mouseup', () => leftPressed = false);
document.getElementById('rbttn').addEventListener('mouseup', () => rightPressed = false);
document.getElementById('ubttn').addEventListener('mouseup', () => upPressed = false);
document.getElementById('dbttn').addEventListener('mouseup', () => downPressed = false);

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

    startButton.style.display = 'none';

    console.log('Game Started');
});




// ======================================================================================================
// Enemy Detection






