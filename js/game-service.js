'use strict'

const STORAGE_KEY = 'leaderBoardsDB'
var gLeaderBoards

var gBoard
var gTime
var gTimeInterval
var gGame
var gLevel = {
    size: 12,
    mines: 30
}
var gIsHint
var gEmptyCells
var gLastEmptyCells
function newGame() {
    stopTime()
    gBoard = buildBoard(gLevel.size)
    gTime = {
        second: 0,
        minutes: 0
    }
    gGame = {
        isOn: true,
        emptyCellShownCount: 0,
        minesMarkedCount: 0,
        secsPassed: 0,
        lifeCount: 3,
        emoji: '😎',
        hintsCount: 3,
        countSafeClick: 3
    }
    gLeaderBoards = loadFromStorage(STORAGE_KEY)
    if (!gLeaderBoards) {
        gLeaderBoards = []
        _createPlayers()
    }
    gLeaderBoards = sortPlayersByScore(gLeaderBoards)
    gEmptyCells = []
    gLastEmptyCells = []
}

function _createPlayers() {
    var firstName = ['Ugi', 'Sugi', 'Pugi', 'Tuti', 'Fruti']
    var lastName = ['ben david', 'sugun', 'pugon', 'Tuton', 'Fruton']
    for (var i = 0; i < 5; i++) {
        gLeaderBoards.push(_createPlayer(firstName[i], lastName[i]))
    }
}

function startTime() {
    gTimeInterval = setInterval(timerUpdate, 1000)
}

function getBoard() {
    return gBoard
}
function getLeaderBoards() {
    return gLeaderBoards
}

function getGGame() {
    return gGame
}

function getIsHint() {
    return gIsHint
}

function updateIsHint(value) {
    gIsHint = value
}

function buildBoard(size) {
    var board = createMat(size)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isSafe: false,
                isIronMan: false
            }
            board[i][j] = cell
        }
    }
    return board
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) continue
            gBoard[i][j].minesAroundCount = minesAroundCount(gBoard, i, j)
        }
    }
}

function minesAroundCount(board, cellI, cellJ) {
    var neighborsSum = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (board[i][j].isMine) neighborsSum++
        }
    }
    return neighborsSum
}

function updateShownCount() {
    gGame.emptyCellShownCount++
    updateEmoji('😎')
}

function updateMarkedCount(diff) {
    if (!diff) return
    gGame.minesMarkedCount += diff
}

function updateLifeCount(pos) {
    if (gIsHint) return
    gGame.lifeCount--
    renderLife()
    updateEmoji('😵')
    checkGameOver(pos)
}

function checkGameOver(pos) {
    if (!gGame.isOn) return
    var countCell = gBoard.length ** 2
    if (gGame.emptyCellShownCount > countCell / 2) renderActionCard(4)
    if (gGame.emptyCellShownCount > countCell / 1.2) renderActionCard(5)

    if (gIsIronMan) {
        if (gBoard[gIronMan.pos.i][gIronMan.pos.j].isShown) {
            gameOver(true)
        }
    }

    if (gGame.minesMarkedCount + gGame.emptyCellShownCount === countCell) {
        gameOver(true)
    }
    if (gGame.lifeCount === 0) {
        gameOver(false)
    }
    return false
}
function stopTime() {
    clearInterval(gTimeInterval)
    clearInterval(gRenderTimer)
}

function gameOver(isVictory) {
    gGame.isOn = false
    stopTime()
    if (isVictory) {
        playBalloonEffect()
        updateEmoji('😏')
        updateGameOverModal(isVictory)
        setTimeout(onToggleModalByClass, 1200, '.game-over-panel', false)
    }
    gBoard[gIronMan.pos.i][gIronMan.pos.j].isShown = true
    updateGameOverModal(isVictory)
    setTimeout(onToggleModalByClass, 1200, '.game-over-panel', false)
    renderMines()
}

function updateCellShown(pos) {
    if (gBoard[pos.i][pos.j].isShown) return
    if (!gIsHint) {
        if (gBoard[pos.i][pos.j].isMine && !gBoard[pos.i][pos.j].isShown) {
            gBoard[pos.i][pos.j].isMarked = true
            updateMarkedCount(1)
        } else updateShownCount()

    }
    gBoard[pos.i][pos.j].isShown = true
    checkGameOver(pos)
}

function updateCellMarked(pos, value) {
    var currCell = gBoard[pos.i][pos.j]
    currCell.isMarked = value
    if (currCell.isMine && currCell.isMarked) updateMarkedCount(1)
    else if (currCell.isMine && !currCell.isMarked) updateMarkedCount(-1)
    checkGameOver()
}

function addRandomMines(i, j) {
    for (var idx = 0; idx < gLevel.mines; idx++) {
        var pos = {
            i: getRandomInt(0, gBoard.length),
            j: getRandomInt(0, gBoard.length)
        }
        while (pos.i === i && pos.j === j ||
            gBoard[pos.i][pos.j].isMine) {
            pos = {
                i: getRandomInt(0, gBoard.length),
                j: getRandomInt(0, gBoard.length)
            }
        }
        gBoard[pos.i][pos.j].isMine = true
    }
}

function timerUpdate() {
    gGame.secsPassed++
    gTime.second++
    if (gTime.second >= 60) {
        gTime.second = 0
        gTime.minutes++
    }
}

function getTime() {
    return gTime
}

function updateGameLevel(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
}

function expandShown(pos) {
    var countCellNegs = minesAroundCount(gBoard, pos.i, pos.j)
    var currCell = gBoard[pos.i][pos.j]
    if (currCell.isSafe) updateSafeClick(pos)
    if (currCell.isMine && !currCell.isShown) updateLifeCount(pos)
    updateCellShown(pos)
    if (!gIsHint) {
        if (countCellNegs || currCell.isMine) return
    }
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === pos.i && j === pos.j) continue
            var currPos = { i, j }
            if (!gIsHint) {
                if (!gBoard[i][j].isMine) {
                    updateCellShown(currPos)
                    gEmptyCells.push(currPos)
                }
            } else toggleCellShown(currPos, true)
        }
    }
    if (gIsHint) {
        setTimeout(undoShown, 1000, pos)
    } else {
        if (gEmptyCells.length) loopExpandShown()
    }
    renderActionCard(6)

}

function loopExpandShown() {
    var emptyCells = [...gEmptyCells]
    for (var i = 0; i < emptyCells.length; i++) {
        if (!isDuplicate(emptyCells[i])) {
            gLastEmptyCells.push(emptyCells[i])
            expandShown(emptyCells[i])
        }
    }
    gEmptyCells = []
}
function isDuplicate(pos) {
    if (!pos) return false
    for (var i = 0; i < gLastEmptyCells.length; i++) {
        var currCell = gLastEmptyCells[i]
        if (pos.i === currCell.i && pos.j === currCell.j) return true
    }
    return false
}


function undoShown(pos) {
    updateIsHint(false)
    gGame.hintsCount--
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var currPos = { i, j }
            toggleCellShown(currPos, false)
        }
    }
    renderHints()
    renderBoard(gBoard)
}

function toggleCellShown(pos, value) {
    gBoard[pos.i][pos.j].isShown = value
}

function updateEmoji(value) {
    gGame.emoji = value
    renderEmoji()
}

function addNewPlayer(firstName, lastName) {
    var player = _createPlayer(firstName, lastName)
    gLeaderBoards.push(player)
    _saveLeaderBoardsToStorage()
}

function _createPlayer(firstName, lastName) {
  var userScore =  getScore()
    if (!userScore) userScore = getRandomInt(2, 2000)
    var player = {
        id: _makeId(),
        firstName,
        lastName,
        gameTime: gGame.secsPassed,
        score: userScore
    }
    return player
}

function getScore() {
    var scoreByLevel = gLevel.size / gGame.secsPassed
    var mineBonus = gLevel.mines - gGame.minesMarkedCount
    var finalScore = gGame.emptyCellShownCount * scoreByLevel * mineBonus 
    return parseInt(finalScore)
}
function _saveLeaderBoardsToStorage() {
    saveToStorage(STORAGE_KEY, gLeaderBoards)
}

function sortPlayersByScore(players) {
    players.sort(function (player1, player2) {
        return player2.score - player1.score
    })
    return players
}

function updateSafeClick(pos) {
    gBoard[pos.i][pos.j].isSafe = false
    gGame.countSafeClick--
    renderSafeClickCount()
}

function safeClick() {
    var emptyCells = getEmptyCells()
    var randomPos = emptyCells[getRandomInt(0, emptyCells.length)]
    gBoard[randomPos.i][randomPos.j].isSafe = true
}

function getEmptyCells() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var pos = { i, j }
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown && !currCell.isSafe) {
                emptyCells[i] = pos;
            }
        }
    }
    return emptyCells
}