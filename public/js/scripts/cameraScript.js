import { uri } from "../common/server.js";
import { postS3 } from "../common/s3.js";
import { openEnterBar, drawCameraMessage } from "../view/cameraView.js";

async function getS3UploadURL(license) {
  try {
    let responseObj = await fetch(`${uri}/api/camera?license=${license}`, {
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

async function postNewCar(lotID, license) {
  try {
    let requestBodyObj = {
      lotID: lotID,
      license: license,
    };
    let responseObj = await fetch(`${uri}/api/cars`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBodyObj),
    });
    let response = await responseObj.json();
    if (responseObj.ok) {
      return response.ok;
    } else if (response.error) {
      return response.message;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    alert("Error fetch to backend:", error);
  }
}

async function deleteCar(lotID, license) {
  try {
    let requestBody = {
      carLicense: license,
      lotID: parseInt(lotID),
    };
    let responseObj = await fetch(`${uri}/api/cars`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    let response = await responseObj.json();

    if (responseObj.ok) {
      return response.ok;
    } else if (response.error) {
      return response.message;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    alert("Error fetch to backend:", error);
  }
}

async function handleLicenseUpdate(license) {
  console.log("Recognized License:", license);
  let enterRadio = document.getElementById("enterRadio");
  let exitRadio = document.getElementById("exitRadio");
  try {
    let lotID;
    // at admin
    if (window.location.href.includes("admin")) {
      lotID = document.getElementById("chosenLot").placeholder.split(": ")[1];
      // at camera
    } else if (window.location.href.includes("camera")) {
      lotID = parseInt(window.location.href.split("/")[4].match(/\d+/g)[0]);
    }

    if (enterRadio.checked) {
      let responsePost = await postNewCar(lotID, license);
      if (responsePost === true) {
        drawCameraMessage(`Welcome! ${license}`);
        openEnterBar("enterGate");
        let responseGet = await getS3UploadURL(license);
        let postS3Response = await postS3(responseGet, license);
      } else if (typeof responsePost === "string") {
        drawCameraMessage(responsePost);
      }
    } else if (exitRadio.checked) {
      let responseDelete = await deleteCar(lotID, license);
      if (responseDelete === true) {
        drawCameraMessage(`Bye! ${license}`);
        if (window.location.href.includes("admin")) {
          openEnterBar("exitGate");
        } else {
          openEnterBar("enterGate");
        }
      } else if (typeof responseDelete === "string") {
        drawCameraMessage(responseDelete);
      }
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

export { handleLicenseUpdate, deleteCar };
