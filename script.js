const setGame = document.querySelector('.set-game'),
    playersQty = [...document.querySelectorAll('.choose-players-number')],
    playerForm = [...document.querySelectorAll('.slide-content')],
    avatars = [...document.querySelectorAll('.avatar-container .item-list .item')],
    myAvatar = [...document.querySelectorAll('.my-avatar')],
    colors = [...document.querySelectorAll('.color-container .item-list .item')],
    myColor = [...document.querySelectorAll('.my-color')],
    rollBtn = document.querySelector('.roll-btn'),
    diceContainer = [...document.querySelectorAll('.dice-container')],
    playerContainer = [...document.querySelectorAll('.player-container')],
    playerScore = [...document.querySelectorAll('.player-score')],
    playerTotal = [...document.querySelectorAll('.player-total')],
    dices = [...document.querySelectorAll('.dice')],
    messageModal = document.querySelector('.message-modal'),
    messageDisplayed = document.querySelector('.message'),
    score = document.querySelector('.score'),
    rollMax = 8,
    playerColor = ['hsl(120deg, 100%, 80%, .5)', 'hsl(270deg, 100%, 80%, .5)'],
    goal = 500

let playerQty = 0,
    playerTurn = 0,
    delay = 0,
    canRoll = true,
    dicesLocked = 0,
    rollOfTheDices = 0,
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
    this.total = goal
}

playersQty.forEach(btn => btn.addEventListener('click', () => {
    playerQty = parseInt(btn.dataset.qty)
    setGame.style.transform = 'translateX(-100vw)'
}))

myColor.forEach(color => color.addEventListener('click', () => {
    document.querySelector('.color-container').style.transform = "scale(1)"
})
)

myAvatar.forEach(avatar => avatar.addEventListener('click', () => {
    document.querySelector('.avatar-container').style.transform = "scale(1)"
})
)

playerForm.shift

playerForm.forEach(form => form.addEventListener('submit', e => {
    e.preventDefault()

    players.push(new Player(playerScore[playerTurn], document.querySelector('.player-' + (playerTurn + 1) + '-name input').value))

    if (playerTurn === 0 && playerQty === 2) {
        playerTurn++
        setGame.style.transform = 'translateX(-200vw)'
    }
    else {
        playerQty === 1 && (
            players.push(new Player(playerScore[1], "Max")),
            changeAvatar('fa-desktop', [document.querySelector('.player-2 .player-avatar')])
        )

        setGame.style.transform = 'translate(' + (playerTurn + 1) * -100 + 'vw, 100vh)'

        playerTurn = 0

        launchGame()
    }
}))


// choose the avatar
avatars.forEach(avatar => {
    avatar.addEventListener('click', ({ target }) => avatarChosen(target))
})

const avatarChosen = (avatarClicked) => {
    console.log('click', playerTurn, avatarClicked)
    const places = [document.querySelector('.player-' + (playerTurn + 1) + '-name .my-avatar'), document.querySelector('.player-' + (playerTurn + 1) + ' .player-avatar')]
    avatars.forEach(col => col.classList.remove('selected'))

    avatarClicked.classList.add('selected')
    changeAvatar(avatarClicked.dataset.avatar, places)

    document.querySelector('.avatar-container').style.transform = "scale(0)"
}

const changeAvatar = (avatar, places) => {
    const myNewAvatar = `<i class="fas ${avatar}"></i>`
    places.forEach(place => {
        place.innerHTML = myNewAvatar
        console.log(place)
    })
}

// choose the color
colors.forEach(color => {
    color.addEventListener('click', ({ target }) => colorChosen(target))
})

function colorChosen(colorClicked) {
    console.log('click', playerTurn)

    playerColor[playerTurn] = colorClicked.dataset.color + ', .5)'

    colors.forEach(col => col.classList.remove('selected'))

    colorClicked.classList.add('selected')

    document.documentElement.style.setProperty('--player' + (playerTurn + 1) + '-color', colorClicked.dataset.color + ')')
    playerTurn === 0 && document.documentElement.style.setProperty('--locked-color', colorClicked.dataset.color + ', .5)')

    document.querySelector('.color-container').style.transform = "scale(0)"
}

//new Game


function launchGame() {

    cleanBoard()

    dices.forEach(dice => setOfDices.push(new MyDice(dice)))

    const getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    const endOfTurn = (myScore) => {
        canRoll = true
        rollOfTheDices = 0
        dicesLocked = 0
        rollBtn.textContent = "ROLL"
        score.textContent = '0 pt'
        results = []

        setOfDices.forEach(dice => {
            dice.locked = false
            dice.id.classList.remove('locked')
        })

        setTimeout(() => {
            messageModal.style.transform = 'translateY(0)'
            messageDisplayed.textContent = 'Bravo ' + players[playerTurn].name + ', vous avez eu ' + myScore + 'pts'

            players[playerTurn].score = myScore
            playerScore[playerTurn].textContent = myScore

            
        }, 1000)



        // FAIRE APPARAITRE UN MODAL !!!!
        // alert('Bravo joueur' + playerTurn + ', vous avez eu ' + myScore + 'pts')
        // players[playerTurn].score = myScore
        // playerScore[playerTurn].textContent = myScore
        // if (playerTurn === 0) {
        //     newPlayerTurn(1, 4)
        //     playerQty === 1 && cpuTurn()
        // }
        // else {
        //     players[0].score !== players[1].score ? players[0].score > players[1].score ? turnWinner(0) : turnWinner(1) : newPlayerTurn(0, 2)
        // }
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

    const turnWinner = (winner) => {
        players[winner].total -= players[winner].score
        playerTotal[winner].innerHTML += `<br/>` + players[winner].total
        players[winner].total <= 0 && endOfGame(winner)
        newPlayerTurn(0, winner)
    }

    const newPlayerTurn = (player, message) => {
        switch (message) {
            case 0: console.log('joueur 1 gagne')
                break
            case 1: console.log('joueur 2 gagne')
                break
            case 2: console.log('égalité')
                break
            default: console.log('joueur 2 joue')
        }
        playerTurn = player
        document.documentElement.style.setProperty('--locked-color', playerColor[player])
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

        score.textContent = myScore + 'pts'

        setTimeout(() => rollOfTheDices < 3 ? (canRoll = true, playerQty === 1 && playerTurn === 1 && cpuTurn()) : endOfTurn(myScore), delay)
    }

    messageModal.addEventListener('submit', (e) => {
        e.preventDefault()
        messageModal.style.transform = 'translateY(100vh)'
        console.log(playerTurn)
    
        if (playerTurn === 0) {
            newPlayerTurn(1, 4)
            playerQty === 1 && cpuTurn()
        }
        else {
            players[0].score !== players[1].score ? players[0].score > players[1].score ? turnWinner(0) : turnWinner(1) : newPlayerTurn(0, 2)
        }
    })

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
}

//clean board
function cleanBoard() {

    players.forEach((player, index) => {
        player.total = goal
        player.score = 0
        playerContainer[index].querySelector('.player-name').textContent = player.name
        playerContainer[index].querySelector('.player-score').textContent = player.score
        playerContainer[index].querySelector('.player-total').textContent = player.total
    })
    setOfDices.forEach((dice) => {
        dice.angleX = 0
        dice.angleY = 0
        dice.id.style.transform = "rotateX(" + dice.angleX + "deg) rotateY(" + dice.angleY + "deg)"
    })
}

//end of game

function endOfGame(winner) {
    console.log('joueur ' + players[winner].name + ' a gagné !!!')
    cleanBoard()
}