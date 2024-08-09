import { formValidation, signInValidation, tokenValidation } from "./common/login.js";

function indexFlow(){
  // Login logic
  // login offcanvas validation bootstrap
  formValidation()
  // login form function
  let signInForm = document.querySelector('#signInForm')
  signInForm.addEventListener('submit', event => {signInValidation(event)})
  // token validation
  tokenValidation()
}

indexFlow()