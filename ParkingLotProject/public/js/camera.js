import { tokenValidation } from "./common/login.js";
import { cameraWarning } from "./modules/admin_module.js";

async function cameraFlow(){
  // token validation
  await tokenValidation()
  let denyCameraBtn = document.getElementById('denyCamera')
  let agreeCameraBtn = document.getElementById('agreeCamera')
  
  denyCameraBtn.addEventListener('click', cameraWarning)
  agreeCameraBtn.addEventListener('click', cameraWarning)
}
cameraFlow()