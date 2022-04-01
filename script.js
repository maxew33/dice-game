const playersQty = [...document.querySelectorAll('.choose-players-number')],
    btn = document.querySelector('.roll-btn'),
    diceContainer = [...document.querySelectorAll('.dice-container')],
    playerContainer =  [...document.querySelectorAll('.player-container')],
    playerScore = [...document.querySelectorAll('.player-score')],
    playerTotal = [...document.querySelectorAll('.player-total')],
    dices = [...document.querySelectorAll('.dice')],
    score = document.querySelector('.score'),
    rollMax = 8

let playerQty = 0,
    playerTurn = 0,
    delay = 0,
    canRoll = true,
    dicesLocked = 0,
    turn = 0,
    setOfDices = [],
    results = [],
    players = []

function MyDice(id) {
    this.id = id
    this.value = 1
    this.delay = 0
    this.locked = false
    this.angleX = 0
    this.angleY = 0
}

function Player(id, name) {
    this.id = id
    this.name = name
    this.score = 0
    this.total = 500
}

playersQty.forEach(btn => btn.addEventListener('click', () => {
    console.log('click', btn.dataset.qty)
    playerQty = parseInt(btn.dataset.qty)
    playersName(1)
}))

const playersName = (id) => {
    document.querySelector('.players-qty').style.display = "none"
    document.querySelector('.player-'+id+'-name').style.display = "block"

    document.querySelector('.player-'+id+'-name button').addEventListener('click', ()=>{
        players.push(new Player(playerScore[id-1], document.querySelector('.player-'+id+'-name input').value))

        console.log(new Player(playerScore[id-1], document.querySelector('.player-'+id+'-name input').value))
    
        document.querySelector('.player-'+id+'-name').style.display = "none"

        if(id === 1 && playerQty === 2){
            playersName(2)
        }
        else{
            playerQty === 1 && players.push(new Player(playerScore[1], "Max"))

            initGame()
        }
    })
}

//initialize the game

function initGame() {

    document.querySelector('.set-game').style.display = "none"

    console.log(players)

    players.forEach((player, index) => {
        console.log(player, index+1, document.querySelector('[data-player="1"]'))
        playerContainer[index].querySelector('.player-name').textContent = player.name
    })

    console.log('game init')
    dices.forEach(dice => setOfDices.push(new MyDice(dice)))
    console.log(setOfDices)
    launchGame()
}

//new Game

function launchGame() {

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }
    
    const replay = (myScore) => {
        canRoll = true
        turn = 0
        dicesLocked = 0 
        btn.textContent = "ROLL"
        score.textContent = '0 pt'
        console.log(results)
        results = []
        console.log(results)
    
        console.log('--------------------------')
        setOfDices.forEach(dice => {
            dice.locked = false
            dice.id.classList.remove('locked')
            console.log(setOfDices)
        })
        alert('Bravo joueur' + playerTurn + ', vous avez eu ' + myScore + 'pts')
    
        players[playerTurn].score = myScore
        playerScore[playerTurn].textContent = myScore
    
        if (playerTurn === 0) {
            playerTurn = 1
            document.documentElement.style.setProperty('--locked-color', 'hsl(270deg, 100%, 80%, .5)')
        }
        else {
            let w
            players[0].score > players[1].score ? w = 0 : w = 1
            players[w].total -= players[w].score
            playerTotal[w].textContent = players[w].total
            players[w].total <= 0 && endOfGame(w)
            playerTurn = 0
            document.documentElement.style.setProperty('--locked-color', 'hsl(90deg, 100%, 80%, .5)')
        }
    }
    
    const roll = () => {
    
        canRoll = false
    
        turn++

        dicesLocked === 3 && (turn = 3)
    
        delay = 0
    
        let myScore = 0
    
        console.log('let\'s roll')
    
        setOfDices.forEach((dice, idx) => {
    
            if (dice.locked) {
                return
            }
    
            let result = 0
    
            const xTurn = 4 + getRandomInt(rollMax),
                yTurn = 4 + getRandomInt(rollMax)
    
            dice.delay = Math.max(xTurn, yTurn) * 250
    
            dice.delay > delay && (delay = dice.delay)
    
            dice.angleX += 90 * xTurn
            dice.angleY += 90 * yTurn
            // balancing the results
            if (dice.angleX % 180) {
                getRandomInt(3) > 1 && (dice.angleX += 90)
            }
            dice.id.style.transform = "rotateX(" + dice.angleX + "deg) rotateY(" + dice.angleY + "deg)"
            dice.id.style.transitionDuration = dice.delay + 'ms'
    
            let x = dice.angleX % 360,
                y = dice.angleY % 360
    
            if (x === 0 || x === 180) {
                switch ((x + y) % 360) {
                    case 0: result = 1
                        break
                    case 90: result = 5
                        break
                    case 180: result = 6
                        break
                    case 270: result = 2
                        break
                    default:
                        console.error(123456);
                }
            }
            else if (x === 90) {
                result = 4
            }
            else if (x === 270) {
                result = 3
            }
    
            dice.value = result
            results[idx] = result    
        })
    
        results.every(res => res === results[0]) ? myScore = 250 : myScore = results.reduce((prev, curr) => prev + curr, 0) * 10
    
        score.textContent = myScore + 'pts'
    
        setTimeout(() => turn < 3 ? canRoll = true : replay(myScore), delay)
    }
    
    btn.addEventListener('click', () => canRoll && roll())
    
    diceContainer.forEach((container, idx) => container.addEventListener('click', () => {
        if (turn > 0) {
            setOfDices[idx].locked = !setOfDices[idx].locked
            setOfDices[idx].id.classList.toggle('locked')
            setOfDices[idx].locked ? dicesLocked += 1 : dicesLocked -= 1
            btn.textContent = dicesLocked === 3 ? "TAKE" : "ROLL"
        }
    }))
    
}

//end of game

function endOfGame(winner) {
    console.log('joueur ' + players[winner].name + ' a gagné !!!')
}

// initGame()