import {
  formValidation,
  signInValidation,
  tokenValidation,
} from "../common/login.js";
import { cameraWarning } from "../common/camera.js";

async function cameraFlow() {
  // Login logic
  // login offcanvas validation bootstrap
  formValidation();
  // login form function
  let signInForm = document.querySelector("#signInForm");
  signInForm.addEventListener("submit", async (event) => {
    signInValidation(event);
  });
  // token validation
  let adminID = await tokenValidation();

  let denyCameraBtn = document.getElementById("denyCamera");
  let agreeCameraBtn = document.getElementById("agreeCamera");

  denyCameraBtn.addEventListener("click", cameraWarning);
  agreeCameraBtn.addEventListener("click", cameraWarning);
}
cameraFlow();
