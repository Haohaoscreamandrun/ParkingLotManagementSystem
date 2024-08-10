'use strict'

// Login form front-end validation
export async function formValidation(){
  let formsNeedValidate = document.querySelectorAll(".needs-validation")
  Array.from(formsNeedValidate).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()){
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
}

// Show loading spinner
function showSpinner(){
  let loginButton = document.querySelector('#loginButton')
  loginButton.outerHTML = `
  <div class="spinner-border text-light" role="status" id="spinner">
    <span class="visually-hidden">Loading...</span>
  </div>`
}

// Hide spinner
function hideSpinner(success="no"){
  let spinner = document.querySelector('#spinner')
  if (success === 'yes'){
    spinner.outerHTML = `
    <button type="submit" class="btn btn-lg btn-success mb-1" id="loginButton">Success</button>`
  } else {
    spinner.outerHTML = `
    <button type="submit" class="btn btn-lg btn-outline-light mb-1" id="loginButton">Login</button>`
  }
}


// Login put submission
export async function signInValidation(event){
  // check if entered
  // console.log("Sign-in function is fired.")
  // prevent submit default
  event.preventDefault()
  // submit variables
  let account = document.querySelector('#adminAccount')
  let password = document.querySelector('#adminPassword')
  // front-end validation logic
  let patternPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/
  if (!patternPassword.test(password.value)){
    password.value = ""
    password.classList.remove('valid')
    password.classList.add('invalid')
    // return to stop 
    return
  } else {
    password.classList.remove('invalid')
    password.classList.add('valid')
  }
  // construct json body
  let requestBody = JSON.stringify({
    'account': account.value,
    'password': password.value
  })
  // fetch to back-end api
  try{
    showSpinner()
    let uri = `http://${window.location.hostname}:${window.location.port}`
    let responseObj = await fetch(uri+'/api/admin/auth', {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    })
    let response = await responseObj.json()
    console.log(response)

    // server side password validation result
    if(!responseObj.ok && response.message.split(":")[0] === 'password'){
      // pattern failed
      password.value = ""
      password.classList.remove('is-valid')
      password.classList.add('is-invalid')
      hideSpinner()
      return
    } else if (!responseObj.ok){
      // wrong credentials
      account.value = ""
      password.value = ""
      hideSpinner()
      alert(response.message)
      return
    } else {
      // Successful, store token to local storage
      hideSpinner('yes')
      for (let [key, value] of Object.entries(response)){
      localStorage.setItem(key, value)
      }
    }

    // redirect to admin page if success
    setTimeout(()=>{
      location.href = uri + '/admin'
    }, 1000)
    
  }catch(error){
    console.error(error)
  }

}

// admin token validation
export async function tokenValidation(){
  // get the token store in local storage
  let token = localStorage.getItem('token') || null
  // if no token exist, redirect from admin.html
  let uri = `http://${window.location.hostname}:${window.location.port}`
  let isNoToken = (token === null)
  let isAdminHTML = (location.href === uri+'/admin')
  if (isNoToken && isAdminHTML){
    location.href = uri
  }
  
  // Construct Header
  let headerContent = {}
  if (token === null){
    headerContent = {
      'Content-Type': 'application/json'
    }
  } else {
    
    headerContent = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
  
  let responseObj = await fetch(
    uri + "/api/admin/auth", 
    {
      method: "GET",
      headers: new Headers(headerContent)
    }
  )
  let response = await responseObj.json()
  if (!responseObj.ok && response === 'jwt decode error.'){
    // token decode error
    // clear local storage
    localStorage.removeItem('token')
    // redirect to index with alert
    location.href = uri
    alert('Invalid token, please login again.')
    return
  } else if (responseObj.ok && response.data !== null) {
    // token exist
    let adminBtn = document.querySelector('#adminLoginCanvasBtn')
    adminBtn.outerHTML = `
      <div class="d-flex align-items-center text-info">
        <div class="px-3">Hello, ${response.data.account}!</div>
        <button class="navbar-nav btn text-center" type="button" id="adminLogoutBtn">Log out</button>
      </div>
    `
    let logoutBtn = document.querySelector('#adminLogoutBtn')
    logoutBtn.addEventListener('click', event => {
      // delete token
      localStorage.removeItem('token');
      // redirect to index page
      location.href = uri
    })

    return response.data.id
  } else if (responseObj.ok && response.data === null){
    // token not exist
    return
  }
}