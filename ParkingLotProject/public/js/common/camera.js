
export function startCamera(){
  // get rid of play button
  let imageStartBtn = document.querySelector('#startBtn button')
  imageStartBtn.remove()
  // Access the camera
  navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: {ideal: 'environment'}// Request the back camera, but fallback to the front camera if necessary
    }
  })
  .then(stream => {
    // Get the video element
    let video = document.getElementById('localVideo');
    // Set the srcObject of the video element to the stream
    video.srcObject = stream;
    return true
  })
  .catch(error => {
    alert(`Error accessing media devices: ${error}`)
    return false
  })
}

export function drawNoCameraMessage() {
    let canvas = document.getElementById('videoCanvas');
    let context = canvas.getContext('2d');

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Set up font style and color
    context.font = '40px Arial';
    context.fillStyle = 'red';
    context.textAlign = 'center';

    // Draw the text in the center of the canvas
    context.fillText('No Camera', canvas.width / 2, canvas.height / 2);
}