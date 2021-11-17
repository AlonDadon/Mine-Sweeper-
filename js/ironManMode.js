'use strict'
const LIFE_IMG = '💖'
var gIsIronMan
var gIronMan = {
    Img: '🐱‍🏍',
    pos: {
        i: 5,
        j: 5,
    }
}

function onIsIronMan(ev) {
    if (ev.currentTarget.checked) {
        init()
        gIsIronMan = true
        var elHint = document.querySelector('.hints-count')
        elHint.style.backgroundColor = "#525252"
        onToggleModalByClass('.balloon-container', false)
        var elBtn = document.querySelector('.btn4')
        onChoseLevel(10, 28, elBtn)
        renderActionCard(7)
        onToggleByOpacity('.btn4', true)
    }
    else {
        init()
        gIsIronMan = false
        onToggleModalByClass('.balloon-container', true)
        onToggleByOpacity('.btn4', false)
    }
}

function moveIronMan() {
    gBoard[gIronMan.pos.i][gIronMan.pos.j].isIronMan = false
    var emptyCells = getEmptyCells()
    var randomPos = emptyCells[getRandomInt(0, emptyCells.length)]
    gBoard[randomPos.i][randomPos.j].isIronMan = true
    gIronMan.pos.i = randomPos.i
    gIronMan.pos.j = randomPos.j
}