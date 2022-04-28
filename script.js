const qsall = document.querySelectorAll.bind(document), //shortcut for document.querySelectorAll
    qs = document.querySelector.bind(document), //shortcut for document.querySelector,
    setGame = qs('.set-game'),
    gameSlides = [...qsall('.slide')],
    playersQty = [...qsall('.choose-players-number')],
    playerForm = qs('.players-identity'),
    avatars = [...qsall('.avatar-container .item-list .item')],
    myAvatar = qs('.my-avatar'),
    colors = [...qsall('.color-container .item-list .item')],
    myColor = [...qsall('.my-color')],
    rollBtn = qs('.roll-btn'),
    diceContainer = [...qsall('.dice-container')],
    playerContainer = [...qsall('.player-container')],
    playerScore = [...qsall('.player-score')],
    playerTotal = [...qsall('.player-total')],
    dice = [...qsall('.dice')],
    messageModal = qs('.message-modal'),
    messageText = qs('.message'),
    presenter = qs('.presenter'),
    score = qs('.score'),
    rollMax = 8,
    playerColor = ['hsl(120deg, 100%, 80%)', 'hsl(270deg, 100%, 80%)'],
    goal = 1000,
    rollindiceSound = new Audio('https://maxime-malfilatre.com/sandbox/sound/rollinDice.wav'),
    music = new Audio('https://maxime-malfilatre.com/sandbox/sound/music-dicegame.wav'),
    musicSlider = document.getElementById('music'),
    soundSlider = document.getElementById('sound'),
    musicSymbol = qs('.music-symbol'),
    soundSymbol = qs('.sound-symbol'),
    optionCheckbox = document.getElementById('option-checkbox'),
    resetBtn = qs('.reset')

let currentSlide = 0,
    playerQty = 0,
    playerTurn = 0,
    roundOver = false,
    gameOver = false,
    delay = 0,
    canRoll = true,
    cpuCanPlay = true,
    diceLocked = 0,
    rollOfThedice = 0,
    setOfdice = [],
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
    qs('.color-container').style.transform = "scale(1)"
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

    qs('.color-container').style.transform = "scale(0)"
}

// choose the avatar

myAvatar.addEventListener('click', () => {
    qs('.avatar-container').style.transform = "scale(1)"
})

avatars.forEach(avatar => {
    avatar.addEventListener('click', ({ target }) => avatarChosen(target))
})

const avatarChosen = (avatarClicked) => {
    console.log('click', playerTurn, avatarClicked)
    avatars.forEach(col => col.classList.remove('selected'))

    avatarClicked.classList.add('selected')

    qs('.my-avatar').innerHTML = `<i class="fas ${avatarClicked.dataset.avatar}"></i>`
    qs(`.player-${playerTurn + 1} .player-avatar`).innerHTML = `<i class="fas ${avatarClicked.dataset.avatar}"></i>`

    qs('.avatar-container').style.transform = "scale(0)"
}

// validation of the player settings

playerForm.addEventListener('submit', e => {
    e.preventDefault()

    players.push(new Player(playerScore[playerTurn], qs('.players-identity input').value))

    if (playerTurn === 0 && playerQty === 2) {
        // reset of the values
        qs('.player-settings').innerText = 'Player 2'
        qs('.name-field').value = 'Bar'
        qs('.my-color').style.background = 'var(--player2-color)'
        colors.forEach(col => col.classList.remove('selected'))
        playerTurn++
    }
    else {
        playerQty === 1 && (
            players.push(new Player(playerScore[1], "Max")),
            qs(`.player-2 .player-avatar`).innerHTML = `<i class="fas fa-desktop"></i>`
        )

        changeSlide()

        playerTurn = 0

        launchGame()
    }
})

// sound and music

rollindiceSound.volume = .5
music.volume = .5

const mute = (target) => {
    target === 'sound' ?
        (
            soundSlider.value = 0,
            rollindiceSound.volume = 0
        )
        : (
            musicSlider.value = 0,
            music.volume = 0
        )

}

soundSlider.addEventListener('input', e => {
    if (e.target.value === 0) {
        mute('sound')
    }
    else {
        rollindiceSound.volume = (e.target.value / 100)
    }
})

soundSymbol.addEventListener('click', () => {
    mute('sound')
})

musicSlider.addEventListener('input', e => {
    if (e.target.value === 0) {
        mute('music')
    }
    else {
        music.volume = (e.target.value / 100)
    }

}
)

musicSymbol.addEventListener('click', () => {
    mute('music')
})


//Let's play this awesome dice game :)

function launchGame() {

    music.loop = true
    music.play()

    cleanBoard()

    console.log('game launched')

    dice.forEach(dice => setOfdice.push(new MyDice(dice)))

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const cpuTurn = () => {

        let valueToLock = 0

        cpuCanPlay && setTimeout(() => {
            if (rollOfThedice > 0) {
                for (let diceValue = 1; diceValue <= 6; diceValue++) {

                    //I check if there is a double >= 4
                    const double = (setOfdice.filter(dice => dice.value === diceValue).length === 2)
                    double && diceValue >= 4 && (valueToLock = diceValue)

                    //I check if there is a triple
                    const triple = setOfdice.every(dice => dice.value === diceValue)
                    triple && (valueToLock = diceValue)
                }

                //If there is a good double or a triple, i keep the dice. If not, I keep the 5 and/or 6 dice(s)
                setOfdice.forEach((dice, idx) => {
                    if (valueToLock > 0) {
                        dice.value === valueToLock ? (setOfdice[idx].locked = true, setOfdice[idx].id.classList.add('locked')) : (setOfdice[idx].locked = false, setOfdice[idx].id.classList.remove('locked'))
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

            message(txt === 3 ? 'Draw game' : `${players[txt - 1].name} has won with ${players[txt - 1].score} pts !`, '<i class="far fa-grin"></i>')

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

    // roll the dice and get the result
    const roll = () => {

        canRoll = false

        rollOfThedice++

        diceLocked === 3 && (rollOfThedice = 3)

        delay = 0

        let myScore = 0

        setOfdice.forEach((dice, idx) => {

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


        // sound of the dice rolling
        customRate = delay > 0 ? (rollindiceSound.duration * 1000) / delay : 0
        rollindiceSound.playbackRate = customRate
        rollindiceSound.play()


        setTimeout(() => {
            score.textContent = myScore + ' pts'
            rollOfThedice < 3 ? (
                canRoll = true,
                playerQty === 1 && playerTurn === 1 && cpuTurn())
                : endOfTurn(myScore)
        }, delay)
    }

    rollBtn.addEventListener('click', () => {
        canRoll && (playerQty === 2 || playerTurn === 0) && roll()
    })

    diceContainer.forEach((container, idx) => container.addEventListener('click', () => {
        if (rollOfThedice > 0 && canRoll) {
            setOfdice[idx].locked ? lockingDice(false, idx) : lockingDice(true, idx)
            rollBtn.textContent = diceLocked === 3 ? "TAKE" : "ROLL"
        }
    }))

    const lockingDice = (action, dice) => {
        setOfdice[dice].locked = action ? true : false
        action ? setOfdice[dice].id.classList.add('locked') : setOfdice[dice].id.classList.remove('locked')
        diceLocked += action ? 1 : -1
    }

    // display the message at the end of turn / round / game
    const message = (myMessage, myPresenter) => {
        messageModal.style.transform = 'translateX(0)'
        messageModal.style.opacity = '1'
        messageText.textContent = myMessage
        presenter.innerHTML = myPresenter
    }

    messageModal.addEventListener('submit', (e) => {
        e.preventDefault()

        canRoll = true

        messageModal.style.transform = 'translateX(100vw)'
        messageModal.style.opacity = '0'

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
        setOfdice.forEach(dice => {
            dice.angleX = 0
            dice.angleY = 0
            dice.id.style.transform = "rotateX(" + dice.angleX + "deg) rotateY(" + dice.angleY + "deg)"
        })
    }

    //end of the turn
    function endOfTurn(myScore) {

        console.log('turn ended', playerTurn)

        setTimeout(() => {
            const myTxt = myScore < 80 ? 'Don\'t cry' : myScore < 110 ? 'OK' : myScore < 130 ? 'Well done' : myScore < 150 ? 'Great' : myScore === 250 ? 'Awesome' : 'Fantastic'

            const myPresenter = myScore < 80 ? '<i class="far fa-grin-beam-sweat"></i>' : myScore < 110 ? '<i class="far fa-smile"></i>' : myScore < 130 ? '<i class="far fa-smile-beam"></i>' : myScore < 150 ? '<i class="far fa-grin-squint"></i>' : myScore === 250 ? '<i class="far fa-grin-hearts"></i>' : '<i class="far fa-grin-stars"></i>'

            message(`${myTxt} ${players[playerTurn].name},\r\n you get ${myScore} pts !`, myPresenter)

            rollOfThedice = 0
            diceLocked = 0
            rollBtn.textContent = "ROLL"
            score.textContent = '0 pt'
            results = []

            setOfdice.forEach(dice => {
                dice.locked = false
                dice.id.classList.remove('locked')
            })

            players[playerTurn].score = myScore
            playerScore[playerTurn].textContent = myScore

        }, 500)

    }


    //winner of the turn

    function turnWinner(winner) {
        players[winner].total -= players[winner].score

        const prevScore = playerTotal[winner].querySelector('.prev-score')

        prevScore.querySelector('.tiny-score').textContent = `(${players[winner].score})`

        prevScore.className = 'crossed'

        console.log(playerTotal[winner])

        playerTotal[winner].innerHTML += `<div class="prev-score">${players[winner].total}<span class="tiny-score"></span></div>`

        // playerTotal[winner].innerHTML += ` (${players[winner].score})<span class="crossed"> </span><span>${players[winner].total}<span>`

        players[winner].total <= 0 ? endOfGame(winner) : newPlayerTurn(0, winner + 1)
    }

    //end of game

    function endOfGame(winner) {
        players[winner].gameWon += 1
        message(`${players[winner].name} won the game`, '<i class="far fa-grin"></i>')
        console.log('joueur ' + players[winner].name + ' a gagné !!!')
        gameOver = true
    }

    // if the option menu is open, pause the cpu turn
    optionCheckbox.addEventListener('change', (e) => {
        playerQty === 1 && playerTurn === 1 && currentSlide === 2 && (e.target.checked ? cpuCanPlay = false : (cpuCanPlay = true, roll()))
    })

}

//reset the game
resetBtn.addEventListener('click', () => {

    optionCheckbox.checked = false

    music.pause()
    music.currentTime = 0

    gameSlides[1].style.display = 'none'
    gameSlides[2].style.display = 'none'
    gameSlides[2].style.opacity = 0

    gameSlides[0].style.opacity = 1
    gameSlides[0].style.display = "flex"

    currentSlide = 0
})


// sound : https://maxime-malfilatre.com/sandbox/sound/rollinDice.wav