const setGame = document.querySelector('.set-game'),
    gameSlides = [...document.querySelectorAll('.slide')],
    playersQty = [...document.querySelectorAll('.choose-players-number')],
    playerForm = document.querySelector('.players-identity'),
    avatars = [...document.querySelectorAll('.avatar-container .item-list .item')],
    myAvatar = document.querySelector('.my-avatar'),
    colors = [...document.querySelectorAll('.color-container .item-list .item')],
    myColor = [...document.querySelectorAll('.my-color')],
    rollBtn = document.querySelector('.roll-btn'),
    diceContainer = [...document.querySelectorAll('.dice-container')],
    playerContainer = [...document.querySelectorAll('.player-container')],
    playerScore = [...document.querySelectorAll('.player-score')],
    playerTotal = [...document.querySelectorAll('.player-total')],
    dices = [...document.querySelectorAll('.dice')],
    messageModal = document.querySelector('.message-modal'),
    messageText = document.querySelector('.message'),
    score = document.querySelector('.score'),
    rollMax = 8,
    playerColor = ['hsl(120deg, 100%, 80%)', 'hsl(270deg, 100%, 80%)'],
    goal = 2000,
    rollinDiceSound = new Audio('https://maxime-malfilatre.com/sandbox/sound/rollinDice.wav'),
    music = new Audio('https://maxime-malfilatre.com/sandbox/sound/music-dicegame.wav')

let currentSlide = 0,
    playerQty = 0,
    playerTurn = 0,
    roundOver = false,
    gameOver = false,
    delay = 0,
    canRoll = true,
    dicesLocked = 0,
    rollOfTheDices = 0,
    setOfDices = [],
    results = [],
    players = [],
    customRate = 0 // ratio sound duration, dice delay

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
    this.total = goal
    this.gameWon = 0
}

const changeSlide = () => {
    gameSlides[currentSlide].style.opacity = 0
    currentSlide++
    gameSlides[currentSlide].style.opacity = 1
    gameSlides[currentSlide].style.display = "grid"
}

playersQty.forEach(btn => btn.addEventListener('click', () => {
    playerQty = parseInt(btn.dataset.qty)
    changeSlide()
}))


// choose the color

myColor.forEach(color => color.addEventListener('click', () => {
    document.querySelector('.color-container').style.transform = "scale(1)"
})
)

colors.forEach(color => {
    color.addEventListener('click', ({ target }) => colorChosen(target))
})

const colorChosen = (colorClicked) => {
    console.log('click', playerTurn)

    playerColor[playerTurn] = colorClicked.dataset.color

    colors.forEach(col => col.classList.remove('selected'))

    colorClicked.classList.add('selected')

    document.documentElement.style.setProperty('--player' + (playerTurn + 1) + '-color', colorClicked.dataset.color)

    playerTurn === 0 && document.documentElement.style.setProperty('--current-player-color', colorClicked.dataset.color)

    document.querySelector('.color-container').style.transform = "scale(0)"
}

// choose the avatar

myAvatar.addEventListener('click', () => {
    document.querySelector('.avatar-container').style.transform = "scale(1)"
})

avatars.forEach(avatar => {
    avatar.addEventListener('click', ({ target }) => avatarChosen(target))
})

const avatarChosen = (avatarClicked) => {
    console.log('click', playerTurn, avatarClicked)
    avatars.forEach(col => col.classList.remove('selected'))

    avatarClicked.classList.add('selected')

    document.querySelector('.my-avatar').innerHTML = `<i class="fas ${avatarClicked.dataset.avatar}"></i>`
    document.querySelector(`.player-${playerTurn + 1} .player-avatar`).innerHTML = `<i class="fas ${avatarClicked.dataset.avatar}"></i>`

    document.querySelector('.avatar-container').style.transform = "scale(0)"
}

// validation of the player settings

playerForm.addEventListener('submit', e => {
    e.preventDefault()

    players.push(new Player(playerScore[playerTurn], document.querySelector('.players-identity input').value))

    if (playerTurn === 0 && playerQty === 2) {
        // reset of the values
        document.querySelector('.player-settings').innerText = 'Player 2'
        document.querySelector('.name-field').value = 'Bar'
        document.querySelector('.my-color').style.background = 'var(--player2-color)'
        colors.forEach(col => col.classList.remove('selected'))
        playerTurn++
    }
    else {
        playerQty === 1 && (
            players.push(new Player(playerScore[1], "Max")),
            document.querySelector(`.player-2 .player-avatar`).innerHTML = `<i class="fas fa-desktop"></i>`
        )

        changeSlide()

        playerTurn = 0

        launchGame()
    }
})


//Let's play this awesome dices game :)

function launchGame() {

    music.loop = true
    music.play()

    cleanBoard()

    console.log('game launched')

    dices.forEach(dice => setOfDices.push(new MyDice(dice)))

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const cpuTurn = () => {
        let valueToLock = 0

        setTimeout(() => {
            if (rollOfTheDices > 0) {
                for (let diceValue = 1; diceValue <= 6; diceValue++) {

                    //I check if there is a double >= 4
                    const double = (setOfDices.filter(dice => dice.value === diceValue).length === 2)
                    double && diceValue >= 4 && (valueToLock = diceValue)

                    //I check if there is a triple
                    const triple = setOfDices.every(dice => dice.value === diceValue)
                    triple && (valueToLock = diceValue)
                }

                //If there is a good double or a triple, i keep the dices. If not, I keep the 5 and/or 6 dice(s)
                setOfDices.forEach((dice, idx) => {
                    if (valueToLock > 0) {
                        dice.value === valueToLock ? (setOfDices[idx].locked = true, setOfDices[idx].id.classList.add('locked')) : (setOfDices[idx].locked = false, setOfDices[idx].id.classList.remove('locked'))
                        dice.value === valueToLock ? lockingDice(true, idx) : lockingDice(false, idx)
                    }
                    else {
                        dice.value > 4 ? lockingDice(true, idx) : lockingDice(false, idx)
                    }
                })
            }

            roll()

        }, 250)
    }



    const newPlayerTurn = (player, txt) => {

        console.log('newTurn ' + txt)

        if (txt) {
            roundOver = true

            txt === 3 ? message('Draw game') : message(`${players[txt - 1].name} has won with ${players[txt - 1].score} pts !`)

            players.forEach((player, index) => {
                player.score = 0
                playerContainer[index].querySelector('.player-score').textContent = player.score
            })
        }

        // if there is 1 player and it is the 2nd player turn then launch the cpu turn
        player === 1 && playerQty === 1 && cpuTurn()

        playerTurn = player
        document.documentElement.style.setProperty('--current-player-color', playerColor[player])
    }

    // roll the dices and get the result
    const roll = () => {

        canRoll = false

        rollOfTheDices++

        dicesLocked === 3 && (rollOfTheDices = 3)

        delay = 0

        let myScore = 0

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


        // sound of the dice rollin
        customRate = (rollinDiceSound.duration * 1000) / delay
        rollinDiceSound.playbackRate = customRate
        rollinDiceSound.volume = .5
        rollinDiceSound.play()


        setTimeout(() => {
            score.textContent = myScore + ' pts'
            rollOfTheDices < 3 ? (
                canRoll = true,
                playerQty === 1 && playerTurn === 1 && cpuTurn())
                : endOfTurn(myScore)
        }, delay)
    }

    rollBtn.addEventListener('click', () => {
        canRoll && (playerQty === 2 || playerTurn === 0) && roll()
    })

    diceContainer.forEach((container, idx) => container.addEventListener('click', () => {
        if (rollOfTheDices > 0 && canRoll) {
            setOfDices[idx].locked ? lockingDice(false, idx) : lockingDice(true, idx)
            rollBtn.textContent = dicesLocked === 3 ? "TAKE" : "ROLL"
        }
    }))

    const lockingDice = (action, dice) => {
        setOfDices[dice].locked = action ? true : false
        action ? setOfDices[dice].id.classList.add('locked') : setOfDices[dice].id.classList.remove('locked')
        dicesLocked += action ? 1 : -1
    }

    // display the message at the end of turn / round / game
    const message = (message) => {
        messageModal.style.transform = 'translateY(0)'
        messageText.textContent = message
    }

    messageModal.addEventListener('submit', (e) => {
        e.preventDefault()

        canRoll = true

        messageModal.style.transform = 'translateY(100vh)'

        if (gameOver) {
            cleanBoard()
            gameOver = !gameOver
        }
        else if (!roundOver) {
            // if it is the end of the first player turn then launch the second player turn / if it is the end of the second player turn, chek the winner
            playerTurn === 0 ? newPlayerTurn(1) : players[0].score !== players[1].score ? players[0].score > players[1].score ? turnWinner(0) : turnWinner(1) : newPlayerTurn(0, 3)
        }
        // if (playerTurn === 0 && !roundOver) {
        //     newPlayerTurn(1)
        //     playerQty === 1 && cpuTurn()
        // }
        // else if (!roundOver) {
        //     players[0].score !== players[1].score ? players[0].score > players[1].score ? turnWinner(0) : turnWinner(1) : newPlayerTurn(0, 3)
        // }
        else { roundOver = !roundOver }
    })

    //clean board
    function cleanBoard() {

        players.forEach((player, index) => {
            player.total = goal
            player.score = 0
            playerContainer[index].querySelector('.player-name').textContent = player.name + '(' + player.gameWon + ')'
            playerContainer[index].querySelector('.player-score').textContent = player.score
            console.log('toto')
            playerContainer[index].querySelector('.player-total').innerHTML = `<div class="prev-score">${player.total}<span class="tiny-score"></span></div>`
        })
        setOfDices.forEach((dice) => {
            dice.angleX = 0
            dice.angleY = 0
            dice.id.style.transform = "rotateX(" + dice.angleX + "deg) rotateY(" + dice.angleY + "deg)"
        })
    }

    //end of the turn
    function endOfTurn (myScore)  {

        console.log('turn ended', playerTurn)

        setTimeout(() => {
            const myTxt = myScore < 80 ? 'Don\'t cry' : myScore < 110 ? 'OK' : myScore < 130 ? 'Well done' : myScore < 150 ? 'Great' : myScore === 250 ? 'Awesome' : 'Fantastic'
            message(`${myTxt} ${players[playerTurn].name},\r\n you had ${myScore} pts !`)

            rollOfTheDices = 0
            dicesLocked = 0
            rollBtn.textContent = "ROLL"
            score.textContent = '0 pt'
            results = []

            setOfDices.forEach(dice => {
                dice.locked = false
                dice.id.classList.remove('locked')
            })

            players[playerTurn].score = myScore
            playerScore[playerTurn].textContent = myScore

        }, 500)

    }


    //winner of the turn

    function turnWinner (winner) {
        players[winner].total -= players[winner].score

        const prevScore = playerTotal[winner].querySelector('.prev-score')

        prevScore.querySelector('.tiny-score').textContent = `(${players[winner].score})`
        
        prevScore.className='crossed'

        console.log(playerTotal[winner])

        playerTotal[winner].innerHTML += `<div class="prev-score">${players[winner].total}<span class="tiny-score"></span></div>`

        // playerTotal[winner].innerHTML += ` (${players[winner].score})<span class="crossed"> </span><span>${players[winner].total}<span>`

        players[winner].total <= 0 ? endOfGame(winner) : newPlayerTurn(0, winner + 1)
    }

    //end of game

    function endOfGame(winner) {
        players[winner].gameWon += 1
        message(`${players[winner].name} won the game`)
        console.log('joueur ' + players[winner].name + ' a gagné !!!')
        gameOver = true
    }

}


// sound : https://maxime-malfilatre.com/sandbox/sound/rollinDice.wav