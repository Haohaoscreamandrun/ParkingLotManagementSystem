import { uri } from "../common/server.js";
import { formatDateForInput } from "./admin_module.js";


export async function render_scrollBar_lots(data){
  let scrollBarLots = document.querySelector('#scrollBarLots')
  data.forEach(lot => {
    let newDiv = document.createElement('button')
    newDiv.type = 'button'
    newDiv.classList.add('scrollBarLotsList', 'btn')
    newDiv.id = lot.id
    newDiv.innerText = lot.name
    scrollBarLots.appendChild(newDiv)
  })
}

let scrollAmount = 0;
export function scrollClick(direction){
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


export async function clickSearch(event){
  if (event.target.classList[0] === 'scrollBarLotsList'){

    let lot_id = event.target.id
    try{
      let responseObj = await fetch(`${uri}/api/cars?lot_id=${lot_id}`, {
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
export async function preloadImages(dataArray){
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

export async function renderCarousal(dataArray=null, waiting=false, preloadImgList=null){
  // Get references to carousel indicators and inner container
  let indicatorsContainer = document.querySelector('#carouselExampleIndicators .carousel-indicators');
  let innerContainer = document.querySelector('#carouselExampleIndicators .carousel-inner');
  if (waiting === true){
    innerContainer.innerHTML = `
      <div class="carousel-item d-flex flex-column justify-content-center align-items-center active">
        <div class="spinner-grow text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      `
  } else if (dataArray === null){

    // render default picture when no cars
    innerContainer.innerHTML = `
       <div class="carousel-item active">
         <img src="../public/images/car-graphic.jpg" alt="..." class="d-block w-100">
         <div class="carousel-caption d-none d-md-block">
           <h5 class="text-dark">This Lot is empty!</h5>
         </div>
       </div>
      `
  }else{
    // render carousal if there's car
    dataArray = dataArray.slice(0, 5)
    preloadImgList = preloadImgList.slice(0, 5)
    
    // clear container data
    indicatorsContainer.innerHTML =  ''
    innerContainer.innerHTML = ''
    dataArray.forEach((item, index) => {
      
      // Create carousel indicator
      let indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.dataset.bsTarget = '#carouselExampleIndicators';
      indicator.dataset.bsSlideTo = index;
      if (index === 0) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      }
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);
      indicatorsContainer.appendChild(indicator);

      // Create carousel item
      let carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');
      if (index === 0) {
        carouselItem.classList.add('active');
      }
      let img = document.createElement('img');
      img.src = preloadImgList[index].src
      img.alt = item.license;
      img.classList.add('d-block', 'w-100');

      let captionDiv = document.createElement('div');
      captionDiv.classList.add('carousel-caption', 'd-none', 'd-md-block');
      
      // captionDiv.appendChild(captionText);
      carouselItem.appendChild(img);
      carouselItem.appendChild(captionDiv);
      innerContainer.appendChild(carouselItem);

    })
  }
}

export async function searchCarByLicense(event, carsArray){
  let query = event.target.value
  let queryResult = carsArray.filter(car => { 
    return car.license.toLowerCase().includes(query.toLowerCase())
  })
  if (queryResult.length > 5){
    queryResult = queryResult.slice(0, 5)
  }
  return queryResult
}


export async function renderCarDetails(index, lotObj, carsArray){
  
  let licensePlate = document.getElementById('licenseplate')
  let enterTime = document.getElementById('timestamp')
  let parkingFee = document.querySelector('#parkingfee')
  let paymentBtn = document.querySelector('.btn-primary')
  let currentCar = carsArray[index]

  if (carsArray.length === 0){
    licensePlate.value = 'Find no car with thy string.'
    enterTime.value = ''
    parkingFee.value = ''
    paymentBtn.disabled = true
  } else {
    licensePlate.value = currentCar.license
    enterTime.value = formatDateForInput(new Date(currentCar.enter_time))
    
    // Calculate passed time
    let [hours, minutes, subTotal] = pastTimetoFee(currentCar.enter_time, lotObj[0].parking_fee)
    parkingFee.value = subTotal

    // render payment button
    paymentBtn.disabled = false
    paymentBtn.id = currentCar.car_id
  }
}

export function pastTimetoFee(enterTime, parkingLotRate){
  // Calculate passed time
  let passedTime = new Date() - new Date(enterTime)
  let totalSeconds = Math.floor(passedTime / 1000)
  let minutes = Math.floor(totalSeconds / 60)
  let hours = Math.floor(minutes / 60)
  minutes = Math.floor(minutes % 60)
  
  // under one hour => one hour fee
  // over one hour => less than 30 mins => 1.5 hour fee
  // over one hour => more than 30 mins => 2 hours fee
  let subTotal = 0
  if (hours < 1){
    subTotal = parkingLotRate
  }else if(hours >=1 && minutes < 30){
    subTotal = parkingLotRate * (hours + 0.5)
  }else if(hours >=1 && minutes >= 30){
    subTotal = parkingLotRate * (hours + 1)
  }
  return [hours, minutes, subTotal]
}