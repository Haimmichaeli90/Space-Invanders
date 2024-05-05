'use strict'

var ALIEN_SPEED = 500

var gIntervalAliens
// var gAlienInterval

var gAliensTopRowIdx 
var gAliensBottomRowIdx 

var gAlienDir = 'right'
var gIsAlienFreeze = false  
var rockInterval
var rockFallInterval

function createAliens(board) {
    const startIdx = Math.floor((board.length - ALIEN_ROW_LENGTH) / 2);
    const alienLength = startIdx + ALIEN_ROW_LENGTH

    for (var i = 0; i < ALIEN_ROW_COUNT; i++) {
        for (var j = startIdx; j < alienLength; j++) {
            if (i === 0) board[i][j].gameObject = gGame.ALIEN
            else if (i === 1) board[i][j].gameObject = gGame.ALIEN2
            else board[i][j].gameObject = gGame.ALIEN3
            gGame.alienCount++
        
        }
    }

    gAliensTopRowIdx = 0 // Initialize top row index
    gAliensBottomRowIdx = ALIEN_ROW_COUNT - 1
}

function handleAlienHit(pos) {
    updateCell(pos)
    
    gGame.alienCount--
    gHero.score += 10
    gHero.health -= 10
    setCountAliens()
    displayScore()

    if (gGame.alienCount === 0) isGameOver()
    // if (gHero.health <= 0) isGameOver()
}

function handleAlienMovement() {
    if(gIsAlienFreeze) return

    if (shouldMoveDown()) {
        moveAliensDown()
        changeNextDirection()

        if (isGameOver()) {
            clearInterval(gIntervalAliens)
            isGameOver()
        }
    } else {
        gAlienDir === 'right' ? moveAliensRight() : moveAliensLeft()
    }
}

function moveAliens() {
    // Start the interval for moving the aliens
    gIntervalAliens = setInterval(() => {
        handleAlienMovement()
        renderBoard(gBoard)
    },ALIEN_SPEED)
}

function moveAliensRight() {
    for (var i = 0; i < gGame.BOARD_SIZE; i++) {
        for (var j = gGame.BOARD_SIZE - 1; j >= 0; j--) {
            const currCell = gBoard[i][j];
            const alienType = currCell.gameObject;

            if (alienType === gGame.ALIEN || alienType === gGame.ALIEN2 || alienType === gGame.ALIEN3) {
                updateCell({ i, j })

                const nextCoord = { i, j: j + 1 }
                updateCell(nextCoord, alienType)
            }
        }
    }
}

function moveAliensLeft() {
    for (var i = 0; i < gGame.BOARD_SIZE; i++) {
        for (var j = 0; j < gGame.BOARD_SIZE; j++) {
            const currCell = gBoard[i][j]
            const alienType = currCell.gameObject

            if (alienType === gGame.ALIEN || alienType === gGame.ALIEN2 || alienType === gGame.ALIEN3) {
                updateCell({ i, j })

                const nextCoord = { i, j: j - 1 }
                updateCell(nextCoord, alienType)
            }
        }
    }
}

function moveAliensDown() {
    for (var i = gGame.BOARD_SIZE - 1; i >= 0; i--) {
        for (var j = 0; j < gGame.BOARD_SIZE; j++) {
            const currCell = gBoard[i][j]
            const alienType = currCell.gameObject

            if (alienType === gGame.ALIEN || alienType === gGame.ALIEN2 || alienType === gGame.ALIEN3) {
                updateCell({ i, j })

                const nextCoord = { i: i + 1, j }
                updateCell(nextCoord, alienType)
            }
        }
    }
    gAliensTopRowIdx++
    gAliensBottomRowIdx++

}


function isAlien(pos){

    var alienPos =  gBoard[pos.i][pos.j].gameObject === gGame.ALIEN ||
     gBoard[pos.i][pos.j].gameObject === gGame.ALIEN2 ||
     gBoard[pos.i][pos.j].gameObject === gGame.ALIEN3
    return alienPos
}

function isMonsterAtRightEdge() {
    for (var i = 0; i < gGame.BOARD_SIZE; i++) {
        const gameElement = gBoard[i][gGame.BOARD_SIZE - 1].gameObject
        if (gameElement === gGame.ALIEN || gameElement ===  gGame.ALIEN2 ||gameElement ===  gGame.ALIEN) {
            return gAlienDir === 'right'
        }
    }
    return false
}

function isMonsterAtLeftEdge() {
    for (var i = 0; i < gGame.BOARD_SIZE; i++) {
        const gameElement = gBoard[i][0].gameObject
        if (gameElement === gGame.ALIEN || gameElement ===  gGame.ALIEN2 || gameElement ===  gGame.ALIEN3) {
            return gAlienDir === 'left'
        }
    }
    return false
}

function shouldMoveDown() {
    if (gAlienDir === 'right') return isMonsterAtRightEdge()
    else return isMonsterAtLeftEdge()
}

function changeNextDirection() {
    gAlienDir = gAlienDir === 'right' ? 'left' : 'right'
}


function throwRock() {
    if (!gGame.isOn) {
        return;
    }

     rockInterval = setInterval(() => {
        var rockPos = getRandomAlienPos()

        if (!rockPos) {
            clearInterval(rockInterval)
            return
        }
        rockFallInterval = setInterval(() => {
            rockPos.i++

            if (rockPos.i >= gGame.BOARD_SIZE - 1) {
                clearInterval(rockFallInterval)
                clearInterval(rockInterval)
                throwRock() // Throw another rock
                return
            }

            if (isAlien(rockPos)) {
                clearInterval(rockFallInterval)
                return
            }

            if (gBoard[rockPos.i][rockPos.j].gameObject === gGame.HERO) {
                clearInterval(rockFallInterval)
                handleHeroHit()
            }

            blinkRock(rockPos)
        }, 100)
    }, 2000) 
}

function handleHeroHit(){
    gHero.health--
    renderHealthHero()
    if (gHero.health === 0) {
        gGame.isOn = false
        clearIntervalsGame()
        return
    }
}

function getRandomAlienPos() {
    var dangerAliens = []
    for (var j = 0; j < gBoard[0].length; j++) {
        var currPos = { i: gAliensBottomRowIdx, j }
        if (isAlien(currPos)) {
            dangerAliens.push(currPos)
        } else {
            for (var i = gAliensBottomRowIdx - 1; i >= 0; i--) {
                if (isAlien({ i, j })) {
                    dangerAliens.push({ i, j })
                    break
                }
            }
        }
    }
    var randIdx = getRandomInt(0, dangerAliens.length)
    return dangerAliens[randIdx]
}