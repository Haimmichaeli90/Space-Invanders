'use strict'

var LASER_SPEED = 80
const EXPLOSION_DURATION = 200

var gHero
var gIntervalLaser
var gBlinkLaser
var gLaserPos
var gBlinkRock
var gHeroShield = false

// creates the hero and place it on board
function createHero(board) {
    gHero = {
        pos: { i: 12, j: 7 },
        isShoot: false,
        score: 0,
        fasterLaserCount: 3,
        isFasterLaser: false,
        lives: 3,
        shield: 3,
        bunker: 3,
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
        case 'z':
            activateShield()
            break;
        default:
            break;
    }
}

function shoot() {
    if (!gGame.isOn || gHero.isShoot) return false;

    setLaser()
    
    gHero.isShoot = true
    var hitAlien = false
    var laserPos = { i: gHero.pos.i, j: gHero.pos.j };

    gIntervalLaser = setInterval(() => {
        laserPos.i--

        if (laserPos.i < 0) {
            clearInterval(gIntervalLaser)
            gHero.isShoot = false
            return false
        }
        if (isAlien(laserPos)) {
            if (!hitAlien) {
                if (gBoard[laserPos.i][laserPos.j].gameObject !== gGame.CANDY) {
                    handleAlienHit(laserPos)
                    hitAlien = true
                    clearInterval(gIntervalLaser)
                }
            }
            gHero.isShoot = false
            return true
        }
        if (gBoard[laserPos.i][laserPos.j].gameObject === gGame.CANDY) {
            updateCell(laserPos, gGame.EMPTY)
            handleHitCandy()
            clearInterval(gIntervalLaser)
            gHero.isShoot = false
            return true
        }
        if(gBoard[laserPos.i][laserPos.j].gameObject === gGame.BUNKER){
            clearInterval(gIntervalLaser)
            gHero.isShoot = false
            return true
        }

        gLaserPos = laserPos
        blinkLaser(laserPos, gGame.LASER)
    }, LASER_SPEED)

    return true 
}

function handleHeroHit(){
    if (gHero.heroShield) return

    gHero.lives--
    renderHealthHero()

    if (gHero.lives === 0) {
        gGame.isOn = false
        clearIntervalsGame()
        displayLoseModal()
        return
    }
}

function activateShield(){
    if (!gGame.isOn || gHero.shield === 0 || gHeroShield) return

    gHeroShield = true
    gGame.HERO = '<img src="images/sh3.png" width="30">'

    updateCell(gHero.pos, gGame.HERO)
    gHero.shield--
    renderShields()

    setTimeout(() => {
        deactivateShield()
    }, 5000)
}

function deactivateShield() {
    gHeroShield = false
    gGame.HERO = '<img src="images/rocket-ship.png" width="20">'
    updateCell(gHero.pos, gGame.HERO)
}

function handleHitCandy(){
    gIsAlienFreeze = true
    setTimeout(() => gIsAlienFreeze = false, 5000)
    clearInterval(rockInterval)
    clearInterval(gIntervalLaser)
    gHero.isShoot = false
    renderShields()
}

function setLaser() {
    clearInterval(gIntervalLaser)
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

function renderExplosion(pos) {
    updateCell(pos, '💥')
    
    setTimeout(() => {
        updateCell(pos, gGame.EMPTY)
    }, EXPLOSION_DURATION)
}

function displayLoseModal() {
    const loseModal = document.getElementById('loseModal');
    loseModal.style.display = 'block';
}

function renderFasterLaserCount() {
    const elSpan = document.querySelector('.fasterLaser span')
    elSpan.innerHTML = '⚡'.repeat(gHero.fasterLaserCount)
}

function renderHealthHero() {
    const elSpan = document.querySelector('.health span')
    const liveCount = Math.max(0, gHero.lives) 
    elSpan.innerHTML = '🚀'.repeat(liveCount)
}

function renderShields() {
    const elSpan = document.querySelector('.shield span')
    elSpan.innerHTML = '🛡️'.repeat(gHero.shield)
}

