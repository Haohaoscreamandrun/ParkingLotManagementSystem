import { uri } from "../common/server.js";

let scrollAmount = 0;
function scrollClick(direction){
  let scrollWindow = document.querySelector('#scrollBarLots')
  let scrollStep = 20;
  let slideTimer = setInterval(()=>{
    scrollWindow.scrollLeft += direction * scrollStep
    scrollAmount += direction * scrollStep;
    let isReachRightEnd = scrollWindow.scrollLeft === scrollWindow.scrollWidth-scrollWindow.offsetWidth
    let isReachLeftEnd = scrollWindow.scrollLeft === 0
    if (Math.abs(scrollAmount) === 200){
      scrollAmount = 0
      clearInterval(slideTimer)
    }else if(isReachRightEnd || isReachLeftEnd){
      scrollAmount = 0
      clearInterval(slideTimer)
    }
  },15)
}

async function clickSearch(event){
  if (event.target.classList[0] === 'scrollBarLotsList'){

    let lotID = event.target.id
    try{
      let responseObj = await fetch(`${uri}/api/cars/${lotID}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      let response = await responseObj.json()
      
      if (responseObj.ok){
        return response.data
      } else {
        console.log("enter new Error loop")
        throw new Error(response.message)
      }
    } catch (error) {
      alert('Error fetch to backend:', error)
      console.log(error)
    }
  }
}

// pre-load img
async function preloadImages(dataArray){
  let preloadImgList = [];
  dataArray.forEach(data => {
    let license = data.license
    let url = `https://d3ryi88x00jzt7.cloudfront.net/${license}.png`
    let img = new Image();
    img.src = url
    preloadImgList.push(img)
  })
  return preloadImgList
}

async function searchCarByLicense(event, carsArray){
  let query = event.target.value
  let queryResult = carsArray.filter(car => { 
    return car.license.toLowerCase().includes(query.toLowerCase())
  })
  if (queryResult.length > 5){
    queryResult = queryResult.slice(0, 5)
  }
  return queryResult
}

function pastTimetoFee(enterTime, greenLight, parkingLotRate){
  // Calculate passed time
  let passedTime
  if(new Date(enterTime) - new Date(greenLight) === 0){
    // unpaid
    passedTime = new Date() - new Date(enterTime)
  }else if(new Date(enterTime) - new Date(greenLight) < 0 && new Date(greenLight) - new Date() < 0){
    // overtime
    passedTime = new Date() - new Date(greenLight)
  } else if (new Date(enterTime) - new Date(greenLight) < 0 && new Date(greenLight) - new Date() > 0){
    // paid
    passedTime = 0
  }
  
  let totalSeconds = Math.floor(passedTime / 1000)
  let minutes = Math.floor(totalSeconds / 60)
  let hours = Math.floor(minutes / 60)
  minutes = Math.floor(minutes % 60)
  
  // under one hour => one hour fee
  // over one hour => less than 30 mins => 1.5 hour fee
  // over one hour => more than 30 mins => 2 hours fee
  let subTotal = 0
  if(totalSeconds === 0){
    subTotal = 0
  }else if (hours < 1){
    subTotal = parkingLotRate
  }else if(hours >=1 && minutes < 30){
    subTotal = parkingLotRate * (hours + 0.5)
  }else if(hours >=1 && minutes >= 30){
    subTotal = parkingLotRate * (hours + 1)
  }
  // console.log(passedTime, hours, minutes, subTotal)
  return [hours, minutes, subTotal]
}

export {scrollClick, clickSearch, preloadImages, searchCarByLicense, pastTimetoFee}