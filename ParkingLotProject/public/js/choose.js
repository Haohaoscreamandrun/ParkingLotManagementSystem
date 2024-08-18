import { formValidation, signInValidation, tokenValidation } from "./common/login.js";
import { getLocation, render_scrollBar_lots, scrollClick, clickSearch } from "./modules/choose_module.js";

async function chooseFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  let adminID = await tokenValidation()
  
  // render scrollbar
  let parkingLots = await getLocation()
  render_scrollBar_lots(parkingLots)
  // scroll bar illustrate
  let scrollUpBtn = document.querySelector('#scrollUpBtn')
  let scrollDownBtn = document.querySelector('#scrollDownBtn')
  scrollUpBtn.addEventListener("click",() => scrollClick(-1))
  scrollDownBtn.addEventListener("click",() => scrollClick(+1))

  // click search
  let scrollWindow = document.querySelector('#scrollBar')
  scrollWindow.addEventListener('click', clickSearch)
}
chooseFlow()