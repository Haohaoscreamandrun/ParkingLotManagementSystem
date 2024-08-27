import { formValidation, signInValidation, tokenValidation } from "../common/login.js";
import { renderParkingLotsList, renderLotCard } from "../view/indexView.js";
import { getLocation, searchLotsByAddress } from "../scripts/indexScript.js";

async function indexFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', async event => { 
    signInValidation(event)
  })
  // token validation
  let adminID = await tokenValidation()

  // render parking lots
  let parkingLotList = document.querySelector('#parkingLotList')
  let parkingLots = await getLocation()
  await renderParkingLotsList(parkingLots)
  
  // store the placeholder
  const placeholderNode = document.querySelector('#lotDetailCard').cloneNode(true)

  // listen to click on list-item
  parkingLotList.addEventListener('click', async (event)=> {
    await renderLotCard(event, placeholderNode, parkingLots)
  })

  // listen to search input
  let searchInput = document.querySelector('#searchInput')
  searchInput.addEventListener('input', async event => {
    await searchLotsByAddress(event, parkingLots)
  })

  // trigger click for first parking lot
  let fisrtParkingLot = parkingLotList.firstChild
  fisrtParkingLot.click()

}

indexFlow()