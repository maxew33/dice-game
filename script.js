const btn = document.querySelector('.roll-btn'),
diceContainer = [...document.querySelectorAll('.dice-container')],
    dices = Array.from(document.querySelectorAll('.dice')),
    rollMax = 8

let angleX = 0,
    angleY = 0,
    result = [],
    resultArray = [],
    delay = 0,
    canRoll = true,
    setOfDices = []

function MyDice(id, value, delay, locked, angleX, angleY) {
    this.id = id
    this.value = value
    this.delay = delay
    this.locked = locked
    this.angleX = angleX
    this.angleY = angleY
}

dices.forEach(dice => setOfDices.push(new MyDice(dice, 1, 0, false, 0, 0)))

console.log(setOfDices)

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const roll = () => {

    canRoll = false

    delay = 0

    console.log('let\'s roll')

    // dices.forEach((dice, idx) => {
    //     const xTurn = 4 + getRandomInt(rollMax),
    //         yTurn = 4 + getRandomInt(rollMax)

    //     delay = Math.max(xTurn, yTurn) * 250

    //     angleX += 90 * xTurn
    //     angleY += 90 * yTurn
    //     // balancing the results
    //     if (angleX % 180) {
    //         getRandomInt(3) > 1 && (angleX += 90)
    //     }
    //     dice.style.transform = "rotateX(" + angleX + "deg) rotateY(" + angleY + "deg)"
    //     dice.style.transitionDuration = delay + 'ms'

    //     let x = angleX % 360,
    //         y = angleY % 360

    //     if (x === 0 || x === 180) {
    //         switch ((x + y) % 360) {
    //             case 0: result = 1
    //                 break
    //             case 90: result = 5
    //                 break
    //             case 180: result = 6
    //                 break
    //             case 270: result = 2
    //                 break
    //             default:
    //                 console.error(123456);
    //         }
    //     }
    //     else if (x === 90) {
    //         result = 4
    //     }
    //     else if (x === 270) {
    //         result = 3
    //     }

    //     // console.log(idx, result)

    //     // console.log(setOfDices)

    // })

    setOfDices.forEach(dice => {

        if(dice.locked){
            return
        }

        const xTurn = 4 + getRandomInt(rollMax),
            yTurn = 4 + getRandomInt(rollMax)

        dice.delay = Math.max(xTurn, yTurn) * 250

        dice.delay > delay && (delay = dice.delay)

        dice.angleX += 90 * xTurn
        dice.angleY += 90 * yTurn
        // balancing the results
        if (dice.angleX % 180) {
            getRandomInt(3) > 1 && (angleX += 90)
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

        // console.log(idx, result)

        // console.log(setOfDices)

    })

    console.log(setOfDices.forEach((dice, idx) => console.log(idx + 1, dice.value)))
    console.log('delay =', delay)

    setTimeout(() => canRoll = true, delay)

    console.log('result:', result)
    return (result)

}

btn.addEventListener('click', () => canRoll && roll())
diceContainer.forEach((container, idx) => container.addEventListener('click', () => {
    setOfDices[idx].locked=!setOfDices[idx].locked
    setOfDices[idx].id.classList.toggle('locked')
}))