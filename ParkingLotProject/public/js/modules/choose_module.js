import { uri } from "../common/server.js";

export function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(get_parking_lots_by_coordinate, showError);
  } else {
    alert("Geolocation is not supported by this browser.")
  }
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.")
        break;
    case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.")
        break;
    case error.TIMEOUT:
        alert("The request to get user location timed out.")
        break;
    case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.")
        break;
  }
}

async function get_parking_lots_by_coordinate(position){
  let lat = position.coords.latitude
  let lon = position.coords.longitude
   try{
    let responseObj = await fetch(`${uri}/api/parkinglot?latitude=${lat}&longitude=${lon}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    })
    let response = await responseObj.json()
    if (responseObj.ok && response.data.length > 0){
      render_scrollBar_lots(response.data)
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.log('Error fetch to backend:', error)
  }
}

function render_scrollBar_lots(data){
  let scrollBarLots = document.querySelector('#scrollBarLots')
  data.forEach(lot => {
    let newDiv = document.createElement('div')
    newDiv.classList.add('scrollBarLotsList')
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

let temp_storage_cars
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
      let carouselExampleIndicators = document.querySelector('#carouselExampleIndicators')
      if (responseObj.ok && response.data === null){
        // no cars in this lot
        carouselExampleIndicators.innerHTML = `
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"
            aria-current="true" aria-label="Slide 1"></button>
        </div>
        <div class="carousel-inner rounded-3">
          <div class="carousel-item active">
            <img src="../public/images/car-graphic.jpg" alt="..." class="d-block w-100">
            <div class="carousel-caption d-none d-md-block">
              <h5 class="text-dark">This Lot is empty!</h5>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
        `
      } else if (responseObj.ok && response.data.length > 0){

        // store it in temp storage
        temp_storage_cars = response.data
        // Get references to carousel indicators and inner container
        let indicatorsContainer = document.querySelector('#carouselExampleIndicators .carousel-indicators');
        let innerContainer = document.querySelector('#carouselExampleIndicators .carousel-inner');
        response.data.forEach((item, index) => {
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
          img.src = `https://s3.ap-southeast-2.amazonaws.com/wehelp-parkinglot.project/${item.license}.png`;
          img.alt = item.license;
          img.classList.add('d-block', 'w-100');

          let captionDiv = document.createElement('div');
          captionDiv.classList.add('carousel-caption', 'd-none', 'd-md-block');
          
          let captionText = document.createElement('h5');
          captionText.textContent = item.license;
          
          captionDiv.appendChild(captionText);
          carouselItem.appendChild(img);
          carouselItem.appendChild(captionDiv);
          innerContainer.appendChild(carouselItem);

        })

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