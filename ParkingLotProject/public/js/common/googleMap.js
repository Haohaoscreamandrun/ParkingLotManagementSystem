// /**
//  * @license
//  * Copyright 2019 Google LLC. All Rights Reserved.
//  * SPDX-License-Identifier: Apache-2.0
//  */
// let map, infoWindow;

// function initMap() {
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: { lat: 25.037, lng: 121.564 },
//     zoom: 15,
//   });
//   infoWindow = new google.maps.InfoWindow();

//   // location button
//   const locationButton = document.createElement("button");
//   locationButton.textContent = "切換至目前位址";
//   locationButton.classList.add("custom-map-control-button");
//   map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
//   locationButton.addEventListener("click", () => {
//     // Try HTML5 geolocation.
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const pos = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//           };

//           infoWindow.setPosition(pos);
//           infoWindow.setContent("Location found.");
//           infoWindow.open(map);
//           map.setCenter(pos);
//         },
//         () => {
//           handleLocationError(true, infoWindow, map.getCenter());
//         },
//       );
//     } else {
//       // Browser doesn't support Geolocation
//       handleLocationError(false, infoWindow, map.getCenter());
//     }
//   });

//   // Add marks
// }


import { getLocation } from "../modules/choose_module.js";
import { render_lot_card } from "../modules/index_module.js";

let map;
// store the placeholder
const placeholderNode = document.querySelector('#lotDetailCard').cloneNode(true)

// get current location
let geoPosition = await new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(resolve, reject)
})
let position = {
  lat: geoPosition.coords.latitude,
  lng: geoPosition.coords.longitude
}

const { Map, InfoWindow } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
// init map function
async function initMap() {
  
  // center map
  map = new Map(document.getElementById("map"), {
    center: position,
    zoom: 15,
    mapId: "PARKING_LOT"
  });
  
  // create marks
  let parkingLots = await getLocation()
  function addMarkers(lotsArray){
    lotsArray.forEach((lot, index) => {
      // Create a pin element.
      let pin = new PinElement({
          // scale: 1.5,
          background: "#FB773C",
          borderColor: "#EB3678",
          glyphColor: "#4F1787",
      });
      // Create a marker and apply the element.
      let marker = new AdvancedMarkerElement({
        map,
        position: {lat: lot.latitude, lng: lot.longitude},
        title: lot.name,
        content: pin.element,
        gmpClickable: true,
      })
      // create infoWindow
      let infoWindow = new InfoWindow();
      
      // Add a click listener for each marker, and set up the info window.
      marker.addListener("click", ({ domEvent, latLng }) => {
        const { target } = domEvent;
        infoWindow.setContent(`
          <h5>${lot.name}</h5>
          <p>${lot.address}</p>
          `)
        infoWindow.close()
        infoWindow.open({
          anchor: marker,
          map
        })
        render_lot_card(domEvent, placeholderNode, lotsArray, lot.id)

      });
    });
  }
  addMarkers(parkingLots)
}

initMap();
