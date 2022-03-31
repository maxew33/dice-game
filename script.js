const btn = document.querySelector('.roll-btn'),
      diceContainer = document.querySelector('.dice-container'),
      dice = document.querySelector('.dice'),      
    rollMax = 8

let angleX = 0,
    angleY = 0,
    result = 1,
    resultArray = [],
    delay = 0,
    canRoll = true

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}
const roll = () =>{
  
  canRoll = false
  
  console.log('let\'s roll')
    
  const xTurn = 4 + getRandomInt(rollMax),
      yTurn = 4 + getRandomInt(rollMax)
  
  delay = Math.max(xTurn, yTurn)*250
  
  angleX += 90 * xTurn
  angleY += 90 * yTurn
  // balancing the results
    if(angleX%180){
    getRandomInt(3) > 1 && (angleX += 90)}
    
  dice.style.transform = "rotateX(" + angleX + "deg) rotateY(" + angleY + "deg)"
  dice.style.transitionDuration = delay + 'ms'
    
  let x = angleX%360,
      y = angleY%360
    
  if(x === 0 || x === 180){
    switch ((x+y)%360) {
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
  else if( x === 90){
    result = 4
  }
  else if( x === 270){
    result = 3
  }
  
  setTimeout(() => canRoll = true, delay)
  
  console.log('result:', result)
  return(result)

}


/* 
// check the probability
const roll = () =>{
  
  console.log('let\'s roll')
  
  for(let i = 0; i < 100000; i++){
  
  const xTurn = 4 + getRandomInt(rollMax),
      yTurn = 4 + getRandomInt(rollMax)
  
  angleX += 90 * xTurn
  angleY += 90 * yTurn
    
    if(angleX%180){
    getRandomInt(3) > 1 && (angleX += 90)}
    
  dice.style.transform = "rotateX(" + angleX + "deg) rotateY(" + angleY + "deg)"
  dice.style.transitionDuration = (Math.max(xTurn, yTurn)*250) + 'ms'
    
  let x = angleX%360,
      y = angleY%360
    
  if(x === 0 || x === 180){
    switch ((x+y)%360) {
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
  else if( x === 90){
    result = 4
  }
  else if( x === 270){
    result = 3
  }
  resultArray.push(result)
  }
  
  
    for(i = 1; i < 7; i++){
    console.log('-- ' + i + ' -- : ', resultArray.filter(n => n === i).length)
  }
}*/

btn.addEventListener('click', () => canRoll && roll())
diceContainer.addEventListener('click', () => canRoll && roll())