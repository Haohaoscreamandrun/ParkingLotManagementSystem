import { formValidation, signInValidation, tokenValidation } from "./common/login.js";
import { getLocation, render_parking_lots_list, render_lot_card,search_lots_by_address } from "./modules/index_module.js";

async function indexFlow(){
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

  // render parking lots
  let parkingLotList = document.querySelector('#parkingLotList')
  let parkingLots = await getLocation()
  await render_parking_lots_list(parkingLots)
  
  // store the placeholder
  const placeholderNode = document.querySelector('#lotDetailCard').cloneNode(true)

  // listen to click on list-item
  parkingLotList.addEventListener('click', async (event)=> {
    await render_lot_card(event, placeholderNode, parkingLots)
  })

  // listen to search input
  let searchInput = document.querySelector('#searchInput')
  searchInput.addEventListener('input', async event => {
    await search_lots_by_address(event, parkingLots)
  })

  // trigger click for first parking lot
  let fisrtParkingLot = parkingLotList.firstChild
  fisrtParkingLot.click()

}

indexFlow()