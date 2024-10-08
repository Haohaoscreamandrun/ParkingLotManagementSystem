import {
  formValidation,
  signInValidation,
  tokenValidation,
} from "../common/login.js";
import { renderParkingLotsList, renderLotCard } from "../view/indexView.js";
import { getLocation, searchLotsByAddress } from "../scripts/indexScript.js";
import { initMap } from "../common/googleMap.js";

async function indexFlow() {
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

  // display location warning
  let locationWarning = new bootstrap.Modal("#staticBackdrop", {
    keyboard: false,
  });
  locationWarning.show();

  // load parking lot list nad google map after agree on location utilization
  let agreeLocation = document.getElementById("agreeLocation");
  agreeLocation.addEventListener("click", async () => {
    // render parking lots and init google map
    let parkingLotList = document.querySelector("#parkingLotList");
    let parkingLots = await getLocation();
    await initMap(parkingLots);
    await renderParkingLotsList(parkingLots);

    // listen to click on list-item
    parkingLotList.addEventListener("click", async (event) => {
      await renderLotCard(event, placeholderNode, parkingLots);
    });

    // listen to search input
    let searchInput = document.querySelector("#searchInput");
    searchInput.addEventListener("input", async (event) => {
      await searchLotsByAddress(event, parkingLots);
    });

    // trigger click for first parking lot
    let fisrtParkingLot = parkingLotList.firstChild;
    fisrtParkingLot.click();
  });

  // store the placeholder
  const placeholderNode = document
    .querySelector("#lotDetailCard")
    .cloneNode(true);
}

indexFlow();
