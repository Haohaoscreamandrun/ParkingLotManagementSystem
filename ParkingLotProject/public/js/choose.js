import { uri } from "./common/server.js";
import { formValidation, signInValidation, tokenValidation } from "./common/login.js";
import { render_scrollBar_lots, scrollClick, clickSearch,searchCarByLicense, renderCarDetails, renderCarousal, preloadImages } from "./modules/choose_module.js";
import { get_parking_lots_by_coordinate } from "./modules/index_module.js";
import { get_parking_lot_by_id } from "./modules/admin_module.js";

async function chooseFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  tokenValidation()
  
  // render scrollbar
  let lot_id = parseInt(window.location.href.split("/")[4])
  let lot = await get_parking_lot_by_id(lot_id)
  let lots = await get_parking_lots_by_coordinate(undefined, lot[0].latitude, lot[0].longitude)
  let scrollBar = document.querySelector('#scrollBarLots')
  scrollBar.innerHTML = ''
  render_scrollBar_lots(lots)

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
    renderCarousal(null, true)
    // get original cars result
    original_storage_cars = await clickSearch(event)
    // preload images
    preloadImgList = preloadImages(original_storage_cars)
    //render carousel
    renderCarousal(original_storage_cars, false, preloadImgList)
    // render the first car detail
    renderCarDetails(0, lot, original_storage_cars)
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
    renderCarDetails(index, lot,temp_storage_cars)
  })

  // listen to plate input and search
  let searchInput = document.querySelector('#searchCars')
  searchInput.addEventListener('input', event =>{
    temp_storage_cars = searchCarByLicense(event, original_storage_cars)
    preloadImgList = preloadImages(temp_storage_cars)
    renderCarousal(temp_storage_cars, false, preloadImgList)
    renderCarDetails(0, lot, temp_storage_cars)
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