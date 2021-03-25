"use strict"

const MINE = {
  img: '💣',
  // location: {
  //   i: 1, j: 1,
  //   i: 3, j: 3
  // }
}
const BOMB = '💣'
const LIFE = '🧡'
const FILL = '⬜';

var gBoard;

var gLevel = {
  SIZE: 4,
  MINES: 2,
  lifeCount: 3
};



var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0
};
var MARK = ['']

function initGame() {
  gBoard = buildBoard()
  buildBoard();
  renderBoard(gBoard, '.board-container');
  // renderUI();
  startTime = new Date();
  // creatMines(gBoard)
  var isOn = true;
}

var gCell = {
  minesAroundCount: 0,
  isShown: false,
  isMine: false,
  isMarked: false
};
function buildBoard() {

  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([]);
    for (var j = 0; j < gLevel.SIZE; j++) {
      // board[i][j] = gCell;
      board[i][j] = gCell;
    }
  }
  return board;
}

function renderBoard(board, selector) {
  var strHTML = '<table border="1"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      // gBoard[i][j];
      if (i === 1 && j === 1 || i === 2 && j === 2) {
        MARK = MINE.img
        gCell.isMine = true;
      }
      else {
        gCell.isMine = false;
        MARK = ['']
      }

      var className = `cell cell${i}-${j}`
      strHTML += `<td class="${className}" onclick="cellClicked(${i}, ${j},event)">${MARK}</td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function cellClicked(i, j) {
  console.log(i, j);
  setMinesNegsCount(i, j, gBoard)

  // console.log(MINE.location);
  // if (i === MINE.location.i && j === MINE.location.j) {
  //   renderCell(MINE.location, MINE.img)
  // }
  // if (i === MINE.location.i && j === MINE.location.j) {
  //   renderCell(MINE.location, MINE.img)
  // } else { }
  // checkGameOver()
}

function cellMarked(elCell) {

}


function setMinesNegsCount(cellI, cellJ, mat) {
  // var neighborsSum = 0;

  for (var i = cellI - 1; i <= cellI + 1; i++) {

    if (i < 0 || i >= mat.length) continue;

    for (var j = cellJ - 1; j <= cellJ + 1; j++) {

      if (j < 0 || j >= mat[i].length) continue;

      // if (i === cellI && j === cellJ) continue;
      console.log(mat[i][j]);
      if (gCell.isMine) {
        gCell.minesAroundCount++;
      }
    }
  }
  console.log(gCell.minesAroundCount);
}
function renderCell(location, value) {
  // Select the elCell and set the value
  // var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  // elCell.innerHTML = value;
  // elCell.innerHTML = value;
  var cellSelector = `.cell${location.i}-${location.j}`
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}
function checkGameOver() {
  if (gLevel.lifeCount <= 0) {
    alert('GameOver')
  }
}
// function renderUI() {
//   var strHTML = '<table border="1"><tbody>';
//     strHTML += '<tr>';
//     strHTML += `<td class="ui" onclick="cellClicked(initGame())">😀</td>`
//   strHTML += '</tr>'
//   strHTML += '</tbody></table>';
//   var elContainer = document.querySelector('.ui-container');
//   elContainer.innerHTML = strHTML;
// }