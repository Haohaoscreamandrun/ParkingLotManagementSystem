function openEnterBar(){
  let enterGate = document.querySelector('#enterGate')
  let closedSrc = enterGate.src
  let openSrc = '../public/images/gate-open.jpg'
  enterGate.src = openSrc
  setTimeout(()=>{
    enterGate.src = closedSrc
  }, 5000)
}

function drawCameraMessage(message) {
  let video = document.querySelector('#localVideo')  
  let canvas = document.getElementById('videoCanvas');
  let context = canvas.getContext('2d');

  if (canvas.hidden){
    video.hidden = true
    canvas.hidden= false
  }

  // Clear the canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set up font style and color
  context.font = '40px Arial';
  context.fillStyle = 'red';
  context.textAlign = 'center';

  // Draw the text in the center of the canvas
  context.fillText(message, canvas.width / 2, canvas.height / 2);
}


export {openEnterBar, drawCameraMessage}