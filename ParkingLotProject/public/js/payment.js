import {tokenValidation, formValidation, signInValidation} from "./common/login.js"
import { tappayDefaultStyle, onUpdate, onSubmit } from "./common/tappay.js"
import { getCarByID, getParkingLotByID, renderCarDetails } from "./modules/payment_module.js"
//
async function paymentFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  await formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  await tokenValidation()

  // render car info
  let carID = window.location.href.split('/')[4]
  let carList = await getCarByID(carID)
  let lotID = carList[0].parking_lot_id
  let lotList = await getParkingLotByID(lotID)
  await renderCarDetails(carList, lotList)

  // tooltip js
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

  // tap_pay SDK
  TPDirect.setupSDK(151734, 'app_9veB5VWRTfHKqTuloC4j32wfD9ERzCDGzl8JfEs6mChxraKzPdx8chncoUVK', 'sandbox')
  TPDirect.card.setup(tappayDefaultStyle)
  TPDirect.card.onUpdate(onUpdate)
  let tapPayCreditCardForm = document.getElementById('tapPayCreditCardForm')
  tapPayCreditCardForm.addEventListener('submit', onSubmit)
}
paymentFlow()