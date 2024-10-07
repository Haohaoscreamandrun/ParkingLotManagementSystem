import { uri } from "../common/server.js";
import {
  renderVacancy,
  renderCars,
  renderBtnLoading,
  renderAlert,
  renderChosenLot,
} from "../view/adminView.js";
import { deleteCar } from "./cameraScript.js";

async function getParkingLots(adminID) {
  try {
    let responseObj = await fetch(`${uri}/api/admin?admin=${adminID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = await responseObj.json();
    if (responseObj.ok) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    alert("Error fetch to backend:", error);
  }
}

async function getParkingLotById(lotID) {
  try {
    let responseObj = await fetch(`${uri}/api/parkinglot?lotID=${lotID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = await responseObj.json();
    if (responseObj.ok) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.log("Error fetch to backend:", error);
  }
}

let tempStorageCars;

async function fetchCarsRender(lotID) {
  // fetch
  try {
    let responseObj = await fetch(`${uri}/api/cars/${lotID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let response = await responseObj.json();

    if (responseObj.ok && response.data === null) {
      // no cars in this lot
      tempStorageCars = [];
      // update vacancy
      renderVacancy(null, true);
      // update car list
      renderCars(tempStorageCars, true);
    } else if (responseObj.ok && response.data.length > 0) {
      // store it in temp storage
      tempStorageCars = await response.data;
      // update vacancy
      renderVacancy(tempStorageCars);
      // render first ten cars
      renderCars(tempStorageCars);
    } else {
      console.log("enter new Error loop");
      throw new Error(response.message);
    }
  } catch (error) {
    alert("Error fetch to backend:", error);
    console.log(error);
  }
}
// function of search lot
function searchLotByInput(event, originalList) {
  let query = event.target.value.trim();
  let queryResult = originalList.filter((lot) => {
    return lot.lot_name.toLowerCase().includes(query.toLowerCase());
  });
  renderChosenLot(queryResult);
  let lotDropDownBtn = document.getElementById("lotDropDownBtn");
  let dropDown = new bootstrap.Dropdown(lotDropDownBtn);
  dropDown.show();
  // toggle drop down will move focus
  event.target.focus();
}

// function of search car
function searchCarsByInput(event, carList = tempStorageCars) {
  let query = event.target.value;
  let queryResult = carList.filter((car) => {
    return car.license.toLowerCase().includes(query.toLowerCase());
  });
  let carsListGroup = document.querySelector("#carsListGroup");
  carsListGroup.innerHTML = "";
  renderCars(queryResult);
}

function formatDateForInput(date) {
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  let day = String(date.getDate()).padStart(2, "0");
  let hours = String(date.getHours()).padStart(2, "0");
  let minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function updateCarByID(event) {
  event.preventDefault();
  // disabled delete btn
  let deleteButton = document.querySelector(".btn.btn-danger.mb-3");
  deleteButton.setAttribute("disabled", "true");

  renderBtnLoading(event);
  let carID = parseInt(event.target.id.split("CarID")[1]);
  let chosenLotID = parseInt(
    document.getElementById("chosenLot").placeholder.split("ID: ")[1]
  );
  let updateLicense = document.getElementById("licenseplate").value;
  let isPaid = document.getElementById("paidCheck").checked;
  let token = localStorage.getItem("token");
  let requestBody = {
    carID: carID,
    lotID: chosenLotID,
    updateLicense: updateLicense,
    isPaid: isPaid,
  };
  try {
    let responseObj = await fetch(`${uri}/api/cars`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    let response = await responseObj.json();
    if (responseObj.ok) {
      renderBtnLoading(event, true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      alert(response.message);
    }
  } catch (error) {
    alert("Error fetch to backend:", error);
    console.log(error);
  }
}

async function deleteCarByLicense(event) {
  event.preventDefault();

  let paidCheck = document.getElementById("paidCheck");
  if (!paidCheck.checked) {
    renderAlert();
    return;
  }
  renderBtnLoading(event);
  let carLicense = event.target.id.split("License")[1];
  let chosenLotID = parseInt(
    document.getElementById("chosenLot").placeholder.split("ID: ")[1]
  );

  let deleteCarResponse = await deleteCar(chosenLotID, carLicense);
  if (deleteCarResponse === true) {
    renderBtnLoading(event, true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    alert(deleteCarResponse);
  }
}

export {
  getParkingLots,
  searchLotByInput,
  getParkingLotById,
  fetchCarsRender,
  searchCarsByInput,
  formatDateForInput,
  updateCarByID,
  deleteCarByLicense,
  tempStorageCars,
};
