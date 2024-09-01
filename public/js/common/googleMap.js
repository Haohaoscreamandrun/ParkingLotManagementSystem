// /**
//  * @license
//  * Copyright 2019 Google LLC. All Rights Reserved.
//  * SPDX-License-Identifier: Apache-2.0
//  */

import { renderLotCard } from "../view/indexView.js";

let map;
// store the placeholder
const placeholderNode = document.querySelector('#lotDetailCard').cloneNode(true)

const { Map, InfoWindow } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
// init map function
export async function initMap(parkingLots) {
  // get current location
  let geoPosition = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
  let position = {
    lat: geoPosition.coords.latitude,
    lng: geoPosition.coords.longitude
  }
  // center map
  map = new Map(document.getElementById("map"), {
    center: position,
    zoom: 15,
    mapId: "PARKING_LOT"
  });
  
  // create icon map pin
  let icon = document.createElement('img')
  icon.src = './public/images/person-location-svgrepo-com.svg'
  icon.style.width = '32px'
  icon.style.height = '32px'
  
  let locationMarker = new AdvancedMarkerElement({
    map,
    position: position,
    content: icon,
    title: "User location"
  })

  // create marks
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
        renderLotCard(domEvent, placeholderNode, lotsArray, lot.id)

      });
    });
  }
  addMarkers(parkingLots)
}

// initMap();
