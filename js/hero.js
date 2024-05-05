'use strict'

var LASER_SPEED = 80
const EXPLOSION_DURATION = 200

var gHero
var gIntervalLaser
var gBlinkLaser
var gLaserPos
var gBlinkRock

// creates the hero and place it on board
function createHero(board) {
    gHero = {
        pos: { i: 12, j: 7 },
        isShoot: false,
        score: 0,
        fasterLaserCount: 3,
        isFasterLaser: false,
        health: 3,
        live: 3,
        
    }
    board[gHero.pos.i][gHero.pos.j].gameObject = gGame.HERO
}

// Move the hero right (1) or left (-1)
function moveHero(dir) {
    if(!gGame.isOn) return false
    gGame.isOn = true

    const nextJ = gHero.pos.j + dir
    if (nextJ < 0 || nextJ > gBoard[0].length - 1) return

    updateCell(gHero.pos, gGame.EMPTY) 
    
    gHero.pos.j = nextJ 
    updateCell(gHero.pos, gGame.HERO) 
    
}

// Function to handle blowing up neighbors when the player presses 'n'
function blowUpNeighbors() {
    if (!gHero.isShoot) return

    renderExplosion(gLaserPos)

    for (var i = gLaserPos.i - 1; i <= gLaserPos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length - 1) continue
        for (var j = gLaserPos.j - 1; j <= gLaserPos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (isAlien({ i, j })) {
                handleAlienHit({ i, j })
                renderExplosion({ i, j })
                
            } 
        }
    }
    
    clearInterval(gIntervalLaser)
    clearInterval(gLaserPos)
    gHero.isShoot = false
}


// onKeyDown(ev)
// Handle game keys
function onKeyDown(ev) {
    console.log('key pressed:', ev.key)

    if (!gGame.isOn) return

    switch (ev.key) {
        case 'ArrowLeft':
            moveHero(-1) // Move left
            break;
        case 'ArrowRight':
            moveHero(1) // Move right
            break;
        case ' ':
            shoot() // Shoot laser
            break;
        case 'n':
            blowUpNeighbors() // Blow up alien neighbors
            break;
        case 'x':
            fasterLaser()
            break;
        default:
            break;
    }
}

function shoot() {
    if (!gGame.isOn) return false
    if (gHero.isShoot) return

    setLaser()
    
    gHero.isShoot = true
    var hitAlien = false

    var laserPos = { i: gHero.pos.i, j: gHero.pos.j }

    gIntervalLaser = setInterval(() => {
        laserPos.i--
        if (isAlien(laserPos) && laserPos.i >= 0) {
            if (!hitAlien) {

                if (gBoard[laserPos.i][laserPos.j].gameObject !== gGame.CANDY) {
                    handleAlienHit(laserPos)
                    hitAlien = true
                }
            }
            clearInterval(gIntervalLaser)
            gHero.isShoot = false
        }
        if (gBoard[laserPos.i][laserPos.j].gameObject === gGame.CANDY) {
            updateCell(laserPos, gGame.EMPTY)
            handleHitCandy()
        }
        // If the laser reaches the top or doesn't hit anything, stop the interval
        if (laserPos.i <= 0 || isAlien(laserPos)) {
            clearInterval(gIntervalLaser)
            gHero.isShoot = false
        }
        gLaserPos = laserPos
        blinkLaser(laserPos, gGame.LASER)
    }, LASER_SPEED)
    
}

function handleHitCandy(){
    gIsAlienFreeze = true
    setTimeout(() => gIsAlienFreeze = false, 5000)
    clearInterval(rockInterval)
    clearInterval(gIntervalLaser)
    gHero.isShoot = false
}

function setLaser() {
    if (gHero.isFasterLaser) {

        console.log('SUPER')
        LASER_SPEED = 50
        gGame.LASER = '<img src="images/superL2.png" width="20">'

        setTimeout(() => {
            console.log('SUPER mode ended')
            LASER_SPEED = 80
            gGame.LASER = '<img src="images/laser.png" width="20">'
            gHero.isFasterLaser = false
        }, 3000)
        
    } else {
        console.log('NOT SUPER')
        LASER_SPEED = 80
        gGame.LASER = '<img src="images/laser.png" width="20">'
    }
}

function fasterLaser() {
    if (gHero.fasterLaserCount === 0) return
    gHero.isFasterLaser = true
    gHero.fasterLaserCount--
    renderFasterLaserCount()
}


function renderFasterLaserCount() {
    const elSpan = document.querySelector('.fasterLaser span')
    elSpan.innerHTML = '⚡'.repeat(gHero.fasterLaserCount)
}

function renderHealthHero() {
    const elSpan = document.querySelector('.health span');
    const healthCount = Math.max(0, gHero.health) // Ensure health count is non-negative
    elSpan.innerHTML = '🚀'.repeat(healthCount)
}

function renderExplosion(pos) {
    updateCell(pos, '💥')
    
    setTimeout(() => {
        updateCell(pos, gGame.EMPTY)
    }, EXPLOSION_DURATION)
}

// renders a LASER at specific cell for short time and removes it
function blinkLaser(pos) {
    updateCell(pos,gGame.LASER)
    gBlinkLaser = setTimeout(() => {
        updateCell(pos, gGame.EMPTY)
    }, LASER_SPEED - 30)
}

// renders a Rock at specific cell for short time and removes it
function blinkRock(pos){
    updateCell(pos, gGame.ROCK)
    gBlinkRock = setTimeout(() => {
        updateCell(pos, gGame.EMPTY)
    }, LASER_SPEED - 30)
}