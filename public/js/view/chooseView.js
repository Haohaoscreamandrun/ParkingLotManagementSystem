import { pastTimetoFee } from "../scripts/chooseScript.js";
import { formatDateForInput } from "../scripts/adminScript.js";

async function renderScrollBarLots(data) {
  let scrollBarLots = document.querySelector("#scrollBarLots");
  data.forEach((lot) => {
    let newDiv = document.createElement("button");
    newDiv.type = "button";
    newDiv.classList.add("scrollBarLotsList", "btn");
    newDiv.id = lot.id;
    newDiv.innerText = lot.name;
    scrollBarLots.appendChild(newDiv);
  });
}

async function renderCarousal(
  dataArray = null,
  waiting = false,
  preloadImgList = null
) {
  // Get references to carousel indicators and inner container
  let indicatorsContainer = document.querySelector(
    "#carouselExampleIndicators .carousel-indicators"
  );
  let innerContainer = document.querySelector(
    "#carouselExampleIndicators .carousel-inner"
  );
  if (waiting === true) {
    innerContainer.innerHTML = `
      <div class="carousel-item d-flex flex-column justify-content-center align-items-center active">
        <div class="spinner-grow text-light" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      `;
  } else if (dataArray === null) {
    // render default picture when no cars
    innerContainer.innerHTML = `
       <div class="carousel-item active">
         <img src="../public/images/car-graphic.jpg" alt="..." class="d-block w-100">
         <div class="carousel-caption d-none d-md-block">
           <h5 class="text-dark">This Lot is empty!</h5>
         </div>
       </div>
      `;
  } else {
    // render carousal if there's car
    dataArray = dataArray.slice(0, 5);
    preloadImgList = preloadImgList.slice(0, 5);

    // clear container data
    indicatorsContainer.innerHTML = "";
    innerContainer.innerHTML = "";
    dataArray.forEach((item, index) => {
      // Create carousel indicator
      let indicator = document.createElement("button");
      indicator.type = "button";
      indicator.dataset.bsTarget = "#carouselExampleIndicators";
      indicator.dataset.bsSlideTo = index;
      if (index === 0) {
        indicator.classList.add("active");
        indicator.setAttribute("aria-current", "true");
      }
      indicator.setAttribute("aria-label", `Slide ${index + 1}`);
      indicatorsContainer.appendChild(indicator);

      // Create carousel item
      let carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");
      if (index === 0) {
        carouselItem.classList.add("active");
      }
      let img = document.createElement("img");
      img.src = preloadImgList[index].src;
      img.alt = item.license;
      img.classList.add("d-block", "w-100");

      let captionDiv = document.createElement("div");
      captionDiv.classList.add("carousel-caption", "d-none", "d-md-block");

      // captionDiv.appendChild(captionText);
      carouselItem.appendChild(img);
      carouselItem.appendChild(captionDiv);
      innerContainer.appendChild(carouselItem);
    });
  }
}

async function renderCarDetails(index, lotObj, carsArray) {
  let licensePlate = document.getElementById("licenseplate");
  let enterTime = document.getElementById("timestamp");
  let parkingFee = document.querySelector("#parkingfee");
  let paymentBtn = document.querySelector(".btn-primary");
  let currentCar = carsArray[index];

  if (carsArray.length === 0) {
    licensePlate.value = "Find no car with thy string.";
    enterTime.value = "";
    parkingFee.value = "";
    paymentBtn.disabled = true;
  } else {
    licensePlate.value = currentCar.license;
    enterTime.value = formatDateForInput(new Date(currentCar.enter_time));

    // Calculate passed time
    let [hours, minutes, subTotal] = pastTimetoFee(
      currentCar.enter_time,
      currentCar.green_light,
      lotObj[0].parking_fee
    );
    parkingFee.value = subTotal;

    // render payment button
    paymentBtn.disabled = false;
    paymentBtn.id = currentCar.car_id;
  }
}

export { renderScrollBarLots, renderCarousal, renderCarDetails };
