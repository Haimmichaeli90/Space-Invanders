'use strict'

var ALIEN_ROW_LENGTH = 8
var ALIEN_ROW_COUNT = 3

const SKY = 'SKY'

var gIntervalCandy
var gCandyTimeout

// Matrix of cell objects. e.g.: {type: SKY, gameObject: ALIEN}
var gBoard

var gGame = {
    isOn: false,
    alienCount: 0,
    BOARD_SIZE: 14,
    HERO: '<img src="images/rocket-ship.png" width="30">',
    ALIEN: '<img src="images/invader1.png" width="20">',
    ALIEN2: '<img src="images/invader2.png" width="20">',
    ALIEN3: '<img src="images/alien2.png" width="20">',
    EMPTY: '',
    LASER: '<img src="images/laser.png" width="20">',
    CANDY: '<img src="images/candyCrush.png" width="20">',
    ROCK: '🪨',
    SKY: 'SKY',
}


function init() {
    console.log('Initializing game...')

    gGame.alienCount = 0
    gGame.isOn = true
  
    gBoard = createBoard()
    createHero(gBoard)
    createAliens(gBoard)

    renderBoard(gBoard)
    setCountAliens()
    renderFasterLaserCount()
    renderHealthHero()

    moveAliens()
    addCandy()
    throwRock()
    
    gIntervalCandy = setInterval(addCandy, 10000)
}

function restartGame(elBtn) {
    // console.log('Restart button')
    // console.log('clear interval',rockFallInterval)
    // console.log('clear interval',rockInterval)
    clearIntervalsGame()

    // Reset game state

    gGame.isOn = true
    gGame.alienCount = 0
    gHero.score = 0

    displayScore()
    renderHealthHero()// Ensure hero's health is rendered

    elBtn.blur()
    init()


}

function createBoard() {
    const board = []

    for (var i = 0; i < gGame.BOARD_SIZE; i++){
        board.push([])

        for (var j = 0; j < gGame.BOARD_SIZE; j++){
            board[i][j] = {type: SKY}
        }
    }
   
   return board
   
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++){
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++){

            const cell = board[i][j]
            var className = cell.type

            strHTML += `<td class="${className}"
            data-i="${i}" data-j="${j}">`

            strHTML += (cell.gameObject) ? `${cell.gameObject}</td>` : `</td>`
        }
        strHTML += '</tr>'
    }
   const elBoard = document.querySelector('.board')
   elBoard.innerHTML = strHTML
}

function addCandy() {
    clearTimeout(gCandyTimeout)

    const jRandomIdx = getRandomInt(0, gBoard[0].length)
    const candyPos = { i: 0, j: jRandomIdx }

     // Check if candy is already occupied
     if (isAlien(candyPos)) {
        addCandy()
        return
    }

    updateCell(candyPos, gGame.CANDY)

    gCandyTimeout = setTimeout(() => {
        // Check if candy is still on the board (not eaten)
        if (gBoard[candyPos.i][candyPos.j].gameObject === gGame.CANDY) {
            // Remove candy from the game board
            updateCell(candyPos)
        }
    }, 5000)
}

function setLevel(elBtn) {
    if (elBtn.innerText === 'Easy') {
        ALIEN_ROW_LENGTH = 8
        ALIEN_ROW_COUNT = 3
        ALIEN_SPEED = 500
    } else if (elBtn.innerText === 'Normal') {
        ALIEN_ROW_LENGTH = 8
        ALIEN_ROW_COUNT = 4
        ALIEN_SPEED = 400
    } else {
        ALIEN_ROW_LENGTH = 10
        ALIEN_ROW_COUNT = 5
        ALIEN_SPEED = 300
    }
    cleanLevelBtnColor()
    elBtn.style.backgroundColor = '#814f78'
    clearIntervalsGame()
    renderHealthHero()
    elBtn.blur()
    init()
}



function isGameOver() {
    const heroRow = gBoard[gHero.pos.i]
    for (var j = 0; j < gGame.BOARD_SIZE; j++) {
        if (heroRow[j].gameObject === gGame.ALIEN || heroRow[j].gameObject === gGame.ALIEN2 || heroRow[j].gameObject === gGame.ALIEN3 || gGame.alienCount === 0) {
            clearIntervalsGame()
            gGame.isOn = false
            console.log('Game Over!')
            return true
        } 
    }
    return false
}

// position such as: {i: 2, j: 7}
function updateCell(pos, gameObject = null) {
    gBoard[pos.i][pos.j].gameObject = gameObject
    var elCell = getElCell(pos)
    elCell.innerHTML = gameObject || gGame.EMPTY
}

// set the count of aliens on board
function setCountAliens() {
    const elSpan = document.querySelector('h2 span')
    elSpan.innerHTML = gGame.alienCount
}
// set score of hero on board
function displayScore() {
    var elSpan = document.querySelector('h3 span')
    elSpan.innerText = gHero.score
}

function cleanLevelBtnColor() {
    var elBtn = document.querySelectorAll('.levels button')
    for (var i = 0; i < elBtn.length; i++) {
        elBtn[i].style.backgroundColor = 'orange'
    }
}

function clearIntervalsGame(){
    clearInterval(gIntervalAliens);
    clearInterval(gIntervalCandy);
    clearTimeout(gCandyTimeout);
    clearInterval(gBlinkLaser);
    clearInterval(rockFallInterval); 
    clearInterval(rockInterval); 
}

