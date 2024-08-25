import { uri } from "../common/server.js";
import { formValidation, signInValidation, tokenValidation } from "../common/login.js";
import { renderScrollBarLots, renderCarDetails, renderCarousal } from "../view/chooseView.js";
import { scrollClick, clickSearch, searchCarByLicense, preloadImages } from "../scripts/chooseScript.js";
import { getParkingLotsByCoordinate } from "../scripts/indexScript.js";
import { getParkingLotById } from "../scripts/adminScript.js";

async function chooseFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  await formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', async event => { 
    await signInValidation(event)
  })
  // token validation
  await tokenValidation()
  
  // render scrollbar
  let lot_id = parseInt(window.location.href.split("/")[4])
  let lot = await getParkingLotById(lot_id)
  let lots = await getParkingLotsByCoordinate(undefined, lot[0].latitude, lot[0].longitude)
  let scrollBar = document.querySelector('#scrollBarLots')
  scrollBar.innerHTML = ''
  await renderScrollBarLots(lots)

  // scroll bar illustrate
  let scrollUpBtn = document.querySelector('#scrollUpBtn')
  let scrollDownBtn = document.querySelector('#scrollDownBtn')
  scrollUpBtn.addEventListener("click",() => scrollClick(-1))
  scrollDownBtn.addEventListener("click",() => scrollClick(+1))

  // variables
  let original_storage_cars, temp_storage_cars, preloadImgList
  
  // click search
  let scrollWindow = document.querySelector('#scrollBarLots')
  scrollWindow.addEventListener('click', async (event) => {
    // render carousal to spinner
    await renderCarousal(null, true)
    // get original cars result
    original_storage_cars = await clickSearch(event)
    // preload images
    preloadImgList = await preloadImages(original_storage_cars)
    //render carousel
    await renderCarousal(original_storage_cars, false, preloadImgList)
    // render the first car detail
    await renderCarDetails(0, lot, original_storage_cars)
    // pass the original cars list to temp
    temp_storage_cars = original_storage_cars
  })

  // trigger click for user
  let targetParkingLot = document.getElementById(`${lot_id}`)
  targetParkingLot.focus()
  targetParkingLot.click()

  // listen to carousel change and render details
  let carouselContainer = document.getElementById('carouselExampleIndicators')
  carouselContainer.addEventListener('slide.bs.carousel', async (event) => {
    let index = event.to
    await renderCarDetails(index, lot,temp_storage_cars)
  })

  // listen to plate input and search
  let searchInput = document.querySelector('#searchCars')
  searchInput.addEventListener('input', async event =>{
    temp_storage_cars = await searchCarByLicense(event, original_storage_cars)
    preloadImgList = await preloadImages(temp_storage_cars)
    await renderCarousal(temp_storage_cars, false, preloadImgList)
    await renderCarDetails(0, lot, temp_storage_cars)
  })

  // listen to payment button
  let paymentBtn = document.querySelector('.btn-primary')
  paymentBtn.addEventListener('click', event => {
    event.preventDefault()
    let carID = event.target.id
    window.location.href = `${uri}/payment/${carID}`
  })
}
chooseFlow()