import {tokenValidation, formValidation, signInValidation} from "./common/login.js"
import { tappayDefaultStyle, onUpdate, onSubmit } from "./common/tappay.js"
//
async function paymentFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  tokenValidation()

  // tap_pay SDK
  TPDirect.setupSDK(151734, 'app_9veB5VWRTfHKqTuloC4j32wfD9ERzCDGzl8JfEs6mChxraKzPdx8chncoUVK', 'sandbox')
  TPDirect.card.setup(tappayDefaultStyle)
  TPDirect.card.onUpdate(onUpdate)
}
paymentFlow()