'use strict'
var gEffectInterval
var gId = 1
var gBalloons
var gLeft

function playBalloonEffect() {
    gLeft = 20
    gBalloons = createBalloons(7)
    renderBalloons()
    renderBalloonsProperties(gBalloons)
    gEffectInterval = setInterval(moveBalloon, 200)
}

function createBalloons(size) {
    var balloons = []
    for (var i = 0; i < size; i++) {
        var balloon = createBalloon()
        gLeft += 50
        balloons.push(balloon)
    }
    return balloons
}

function createBalloon() {
    return {
        id: gId++,
        distance: 20,
        speed: getRandomInt(20, 25),
        color: getRandomColor(),
        left: gLeft,
    }
}

function moveBalloon() {
    var balloons = document.querySelectorAll('.balloon')
    for (var i = 0; i < balloons.length; i++) {
        balloons[i].style.bottom = gBalloons[i].distance + 'px'
        gBalloons[i].distance += gBalloons[i].speed
        if (gBalloons[i].distance >= 1250) {
            clearInterval(gEffectInterval)
        }
    }
}

function renderBalloonsProperties(balloons) {
    for (var i = 0; i < balloons.length; i++) {
        var balloonColor = balloons[i]
        var elBalloon = document.querySelector(`.balloon${i + 1}`)
        elBalloon.style.backgroundColor = balloonColor.color
        elBalloon.style.left = balloonColor.left + 'px'
    }
}

function renderBalloons() {
    var strHTML = ''
    for (var i = 0; i < gBalloons.length; i++) {
        strHTML += `<div onclick="OnClickBallon(this)" class="balloon balloon${i + 1}"></div>`
    }
    var elRoad = document.querySelector('.balloon-container');
    elRoad.innerHTML = strHTML;
}

function OnClickBallon(elBallon) {
    elBallon.classList.add('hide')
}
