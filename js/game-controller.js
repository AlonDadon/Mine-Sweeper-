'use strict'

const MINE_IMG = '🧨'
const FLAG_IMG = '🌳'
var gFirstClick
var gRenderTimer
var gLastElBtn = document.querySelector('.btn3')
var gIsSafeClick
function init() {
    onToggleModalByClass('.action-card', false)
    gFirstClick = true
    gIsSafeClick = false
    newGame()
    var board = getBoard()
    renderBoard(board)
    renderLife()
    renderEmoji()
    renderHints()
    renderLeaderBoards()
    renderTimer()
    renderActionCard(0)
    renderSafeClickCount()
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var cellClass = ' is-shown'
            var tdDataId = `data-i=${i} data-j=${j}`
            var cellTxt = ''
            if (!currCell.isShown) cellClass = ' is-not-shown'
            if (currCell.isMine) cellClass += ' is-mine'
            if (currCell.isSafe) cellClass = ' is-safe'
            if (currCell.isMine && currCell.isShown) cellTxt = MINE_IMG
            if (currCell.minesAroundCount && currCell.isShown) {
                cellTxt = currCell.minesAroundCount
            }
            if (!currCell.isShown && currCell.isMarked) cellTxt = FLAG_IMG
            if (currCell.isIronMan && currCell.isShown) cellTxt = gIronMan.Img

            cellClass += ' ' + getClassName({ i: i, j: j })
            strHTML += `\t<td ${tdDataId} class="cell ${cellClass}"
              onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(this,event)"
              >${cellTxt}\n`
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board-container')
    elBoard.innerHTML = strHTML
}

function onCellClicked(elCell) {
    var game = getGGame()
    if (!game.isOn) return
    var pos = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    if (gIsSafeClick) {
        renderActionCard(1)
        gIsSafeClick = false
    }
    if (gFirstClick) {
        _firstClick(pos, true)
    } else expandShown(pos)

    if (getIsHint()) {
        var cursor = document.querySelector('body')
        cursor.style.cursor = 'grab'
    }
    if (gIsIronMan) moveIronMan()
    var board = getBoard()
    renderBoard(board)
}

function _firstClick(pos, isLeftClick) {
    gFirstClick = false
    addRandomMines(pos.i, pos.j)
    setMinesNegsCount()
    startTime()
    gRenderTimer = setInterval(renderTimer, 1000)
    if (isLeftClick) expandShown(pos)
}

function onCellMarked(elCell, ev) {
    ev.preventDefault()
    var game = getGGame()
    if (!game.isOn) return
    var board = getBoard()
    var pos = {
        i: +elCell.dataset.i,
        j: +elCell.dataset.j
    }
    if (gFirstClick) {
        _firstClick(pos)
    }
    if (board[pos.i][pos.j].isShown) return
    if (board[pos.i][pos.j].isMarked) {
        updateCellMarked(pos, false)
        renderCell(pos, '')
    } else {
        updateCellMarked(pos, true)
        renderCell(pos, FLAG_IMG)
    }
}

function onChoseLevel(size, mines, elBtn) {
    if (gIsIronMan) {
        size = 12
        mines = 28
        elBtn = document.querySelector('.btn4')
    }
    gLastElBtn.classList.remove('chose')
    gLastElBtn = elBtn
    gLastElBtn.classList.add('chose')
    updateGameLevel(size, mines)
    init()
}

function renderLife() {
    var life = getGGame()
    var lifeStr = '💖'
    var elLife = document.querySelector('.life-count')
    elLife.innerText = lifeStr.repeat(life.lifeCount)
    renderActionCard(3)
}

function renderEmoji() {
    var gameEmoji = getGGame()
    var elEmoji = document.querySelector('.emoji-action')
    elEmoji.innerText = gameEmoji.emoji
}

function renderTimer() {
    var time = getTime()
    var strSecond = ':0' + time.second
    var strMinute = '00'
    if (time.second > 9) {
        strSecond = ':' + time.second
    }
    if (time.minutes >= 1) {
        strMinute = '0' + time.minutes
    }
    if (time.minutes > 9) {
        strMinute = '' + time.minutes
    }
    var timer = strMinute + strSecond
    var elTimer = document.querySelector('.timer-count')
    elTimer.innerText = timer
}

function onHints() {
    if (gIsIronMan) return

    var game = getGGame()
    if (!game.isOn) return

    var cursor = document.querySelector('body')
    cursor.style.cursor = 'grabbing'
    var hint = getGGame()
    if (hint.hintsCount === 0) return
    updateIsHint(true)
    var elHint = document.querySelector('.hints-count')
    elHint.style.backgroundColor = "red"
    renderActionCard(2)
}

function renderHints() {
    var cursor = document.querySelector('body')
    var hint = getGGame()
    var hintStr = '🕯️'
    var elHint = document.querySelector('.hints-count')
    elHint.innerText = hintStr.repeat(hint.hintsCount)
    elHint.style.backgroundColor = "white"
    cursor.style.cursor = 'auto'
}


function onAddPlayer() {
    var firstName = document.querySelector('#f-name').value
    var lastName = document.querySelector('#l-name').value
    if (!firstName || !lastName) return
    addNewPlayer(firstName, lastName)
    onToggleModalByClass('.game-over-panel', true)
}

function onToggleModalByHtml(className, isHidden) {
    document.querySelector(className).hidden = isHidden
}
function onToggleModalByClass(className, isHidden) {
    var elToggle = document.querySelector(className)
    if (isHidden) elToggle.classList.add('hidden')
    else elToggle.classList.remove('hidden')
}
function onToggleByOpacity(className, isHidden) {
    var elToggle = document.querySelector(className)
    if (isHidden) {
        elToggle.classList.remove('hide')
        elToggle.classList.add('show')
    } else {
        elToggle.classList.add('hide')
        elToggle.classList.remove('show')
    }
}

function renderLeaderBoards() {
    var strHTML = '<thead><tr><th class="table-header" colspan="2">Leaderboards</th>'
    strHTML += `<th class="table-header"><button onclick="onToggleModalByHtml('.leader-boards-container',true)">x</button></th></tr>`
    strHTML += '<tr><th>Division Rank</th><th>Full name</th><th>score</th></tr></thead><tbody>'
    var board = getLeaderBoards()
    for (var i = 0; i < board.length && i < 5; i++) {
        var currCell = board[i]
        strHTML += '\n</tr>'
        strHTML += `<td class="text-align" >${i + 1}</td>`
        strHTML += `<td>${currCell.firstName}  ${currCell.lastName}</td>`
        strHTML += `<td>${currCell.score}</td> \n</tr>`
    }
    strHTML += '</tbody>'
    var elTable = document.querySelector('.leader-boards-container')
    elTable.innerHTML = strHTML
}

function onSafeClick() {
    var game = getGGame()
    if (!game.isOn) return
    var countSafeClick = getGGame()
    if (countSafeClick.countSafeClick === 0) return
    if (gIsSafeClick) return
    gIsSafeClick = true
    safeClick()
    var board = getBoard()
    renderBoard(board)

}

function updateGameOverModal(isVictory) {
    onToggleModalByClass('.action-card', true)
    var victoryStr = `Well done Champion, you managed to beat the wolf.
    But it's not over! Continue to the next challenge and break the record`
    var elImg = document.querySelector('.is-victory-img')
    if (!isVictory) {
        victoryStr = `You have managed to take another step on the road to success
        ... the best way to expand is to learn from your losses !! Try again`
        elImg.src = 'images/6.jpg'
    } else elImg.src = 'images/super-genius.jpg'
    var elStr = document.querySelector('.is-victory')
    elStr.innerText = victoryStr
}

function renderActionCard(idx) {
    var actions = [
        { txt: 'Are you ready to start playing?', imgNum: 1 },
        { txt: 'I\'m waiting for you', imgNum: 2 },
        { txt: 'You are on the right path', imgNum: 3 },
        { txt: 'Hops ... you better be careful from now on', imgNum: 4 },
        { txt: 'I have a few more surprises for you', imgNum: 8 },
        { txt: 'You will never defeat me', imgNum: 5 },
        { txt: 'I\'m close to you', imgNum: 9 },
    ]
    var elTxt = document.querySelector('.action-txt')
    var elImg = document.querySelector('.action-img')
    elImg.src = `images/${actions[idx].imgNum}.jpg`
    elTxt.innerText = actions[idx].txt

}

function renderMines() {
    var mines = document.querySelectorAll('.is-mine')
    for (var i = 0; i < mines.length; i++) {
        var pos = {
            i: +mines[i].dataset.i,
            j: +mines[i].dataset.j
        }
        updateCellShown(pos)
    }
}

function renderSafeClickCount() {
    var game = getGGame()
    var elSafeClickCount = document.querySelector('.btn-safe-click span')
    elSafeClickCount.innerText = game.countSafeClick
}