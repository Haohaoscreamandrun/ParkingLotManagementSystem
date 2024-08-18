import { formValidation, signInValidation, tokenValidation } from "./common/login.js";
import { getLocation } from "./modules/choose_module.js";
import { render_parking_lots_list, render_lot_card,search_lots_by_address } from "./modules/index_module.js";

async function indexFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  tokenValidation()

  // render parking lots
  let parkingLotList = document.querySelector('#parkingLotList')
  let parkingLots = await getLocation()
  render_parking_lots_list(parkingLots)
  
  // store the placeholder
  const placeholderNode = document.querySelector('#lotDetailCard').cloneNode(true)

  // listen to click on list-item
  parkingLotList.addEventListener('click', (event)=> {
    render_lot_card(event, placeholderNode, parkingLots)
  })

  // listen to search input
  let searchInput = document.querySelector('#searchInput')
  searchInput.addEventListener('input', event => search_lots_by_address(event, parkingLots))

  // // render map
  // addMarkers(parkingLots)
}

indexFlow()