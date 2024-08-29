import {tokenValidation, formValidation, signInValidation} from "../common/login.js"
import { tappayDefaultStyle, onUpdate, onSubmit, getLinePayPrime } from "../common/tappay.js"
import { getCarByID, getParkingLotByID, postThirdPrime } from "../scripts/paymentScript.js"
import { renderCarDetails, fixHiding } from "../view/paymentView.js"

async function paymentFlow(){
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

  // render car info
  let carID = window.location.href.split('/')[4]
  let carList = await getCarByID(carID)
  let lotID = carList[0].parking_lot_id
  let lotList = await getParkingLotByID(lotID)
  await renderCarDetails(carList, lotList)

  // tooltip js
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  const alertList = document.querySelectorAll('.alert')
  const alerts = [...alertList].map(element => new bootstrap.Alert(element))

  // toggle d-none
  let creditTab = document.getElementById('creditTab')
  let thirdPayTab = document.getElementById('thirdPayTab')
  creditTab.addEventListener('show.bs.tab', () => fixHiding('hide'))
  thirdPayTab.addEventListener('show.bs.tab', () => fixHiding('show'))

  // tapPay SDK
  TPDirect.setupSDK(151734, 'app_9veB5VWRTfHKqTuloC4j32wfD9ERzCDGzl8JfEs6mChxraKzPdx8chncoUVK', 'sandbox')

  // tapPay credit card
  TPDirect.card.setup(tappayDefaultStyle)
  TPDirect.card.onUpdate(onUpdate)
  let tapPayCreditCardForm = document.getElementById('tapPayCreditCardForm')
  tapPayCreditCardForm.addEventListener('submit', event =>{
    onSubmit(event, lotID)
  })

  //tapPay LinePay
  let linePayBtn = document.getElementById('linePay')
  linePayBtn.addEventListener('click', async ()=>{
    let primeObj = await getLinePayPrime()
    await postThirdPrime(primeObj.prime, lotID, 'linePay')
  })
}
paymentFlow()