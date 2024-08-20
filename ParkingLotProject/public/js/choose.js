import { formValidation, signInValidation, tokenValidation } from "./common/login.js";
import { render_scrollBar_lots, scrollClick, clickSearch } from "./modules/choose_module.js";
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

  // click search
  let scrollWindow = document.querySelector('#scrollBar')
  scrollWindow.addEventListener('click', clickSearch)

  // trigger click for user
  let targetParkingLot = document.getElementById(`${lot_id}`)
  targetParkingLot.focus()
  targetParkingLot.click()
}
chooseFlow()