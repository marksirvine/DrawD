var app = angular.module('Draw',[]);

//Replace flagList array with request to server later
var flagList = [];
var flagNumber = 0;

// Variables for canvas manipulation
var canvas;
var ctx;
var paint = false; //boolean storing weather mouse is pressed
var brushSize = 6; // drawing width
var xPosArray = new Array();
var yPosArray = new Array();
var dragArray = new Array();
var colourArray = new Array();
var sizeArray = new Array();

var colourGreen = "#659b41";
var colourBlack = "#000000";
var colourBlue = "#2196F3";
var colourRed = "#df4b26";
var colourWhite = "#FFF"
var curColour = colourBlack;

window.onload = function(){
  getOrigionalData();
  var document = window.document;

  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  ctx.lineWidth = brushSize;

  //handling mouse click and move events
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mousedown', handleDown);
  canvas.addEventListener('mouseup', handleUp);
  canvas.addEventListener('mouseleave',handleLeave);
  window.addEventListener('resize', resizeCanvas, false);

}

function resizeCanvas() {
            var currentFlag = document.getElementById("displayedFlag");
            canvas.width = currentFlag.width;
            canvas.height = currentFlag.height;
            redraw();
    }

//Change text displayed
function changeText() {
  if (document.getElementById("buttonChange").value == "Click to change"){
    document.getElementById("textChange").innerHTML = "Changed text";
    document.getElementById("buttonChange").value = "Click to change back";
  }
  else {
    document.getElementById("textChange").innerHTML = "Text to change";
    document.getElementById("buttonChange").value = "Click to change";
  }

}

//Cycle through flags to be displayed
function displayNextFlag(){
  var currentFlag = document.getElementById("displayedFlag");
  if (flagNumber == flagList.length-1){
    flagNumber = 0;
  }
  else {
    flagNumber +=1;
  }
  // replace flag list with getting flag src from Database

  // var q = new XMLHttpRequest();
  // q.onreadystatechange = receive;
  // q.open("HEAD", "nextImage", true);
  // q.send();
  // function receive() {
  // if (this.readyState != XMLHttpRequest.DONE) return;
  // var s = this.responseText;
  // console.log(s);
  // console.log(this);
  // }
  currentFlag.src =   flagList[flagNumber].location;
  currentFlag.onload = function(e) {
      if(currentFlag.width != 0){
      canvas.width = currentFlag.width;
      canvas.height = currentFlag.height;
    }
    else {
      canvas.width = 600;
      canvas.height = 400;
    }
    }
  }


// Canvas code

function changeColour (colour){
  curColour = colour;
}

function changeSize (size){
  brushSize = size;
}

function clearCanvas(){
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
  xPosArray = [];
  yPosArray = [];
  colourArray = [];
  dragArray = [];
}

function handleMove(e)
{
  if(paint==true){

    //use getBoundingClientRect() instead of offsetTop to absolute position on the page as offsetTop is relative to the parent
    var mouseX = e.clientX - this.getBoundingClientRect().left;
    var mouseY = e.clientY - this.getBoundingClientRect().top;

    addClick(mouseX,mouseY,true);
    redraw();
  }
}

function handleDown(e)
{
  var mouseX = e.clientX - this.getBoundingClientRect().left;
  var mouseY = e.clientY - this.getBoundingClientRect().top;

  paint = true;
  addClick(mouseX,mouseY);
  redraw();
}

function handleUp()
{
  paint = false;
}

function handleLeave()
{
  paint = false;
}

function addClick(x,y,isDragging)
{
  xPosArray.push(x);
  yPosArray.push(y);
  dragArray.push(isDragging);
  colourArray.push(curColour);
  sizeArray.push(brushSize);
}

function redraw()
{

  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

  ctx.lineJoin = "round";


  for (var i=0; i<xPosArray.length; i++){
    ctx.beginPath();
    if(dragArray[i] && i){
      ctx.moveTo(xPosArray[i-1], yPosArray[i-1]);
    } else {
      ctx.moveTo(xPosArray[i]-1, yPosArray[i]);
    }
    ctx.lineTo(xPosArray[i],yPosArray[i]);
    ctx.closePath();
    ctx.strokeStyle = colourArray[i];
    ctx.lineWidth = sizeArray[i];
    ctx.stroke();
  }
}

function savePublish(){

  var d=canvas.toDataURL("image/png");

  // var w=window.open('about:blank','image from canvas');
  // w.document.write("<img src='"+d+"' alt='from canvas'/>");

  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("PUT", "newImage.png", true);

  // SEND ACROSS THE FLAG NUMBER ASWELL
  // Lots of string manipulation
  var flagNumberImage = "";
  var newFlagNumber = flagNumber +1;
  // var numberLength = flagNumber.toString().length;
  // console.log(numberLength);
  // for (var i = 0; i++; i< (5 - 0)){
  //     flagNumberImage =  "0" + flagNumberImage ;
  //     console.log("adding a zero");
  // }
  // flagNumberImage = flagNumberImage + "origStart";
  flagNumberImage = flagNumberImage + newFlagNumber.toString();
  flagNumberImage = flagNumberImage + "origEnd"
  flagNumberImage = flagNumberImage + d
  q.send(flagNumberImage);
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;
  clearCanvas();
  }



}
// GET ID OF LATEST ENTRY
// GET JSON OF ID
// GET the images
function getNewestFeedData(){
  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("GET", "newFeedData.json", true);
  q.send();
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;
    // getFeedData("2");
  }
}

function getOrigionalData(){
  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("GET", "origionalData.json", true);
  q.send();
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;
    flagList = JSON.parse(this.response);
    document.getElementById("displayedFlag").src = flagList[0].location;
    canvas.width = document.getElementById("displayedFlag").width;
    canvas.height = document.getElementById("displayedFlag").height;
  }

}

function getFeedData(id){
  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("POST", "idFeedData.json", true);
  q.send(id);
  // FIX THISSS   ITS NOT SENDING THAT SHIT
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;

  }

}

function getComments(id){
  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("POST", "idCommentsData.json", true);
  q.send(id);
  // FIX THISSS   ITS NOT SENDING THAT SHIT
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;

  }

}

function incrementScore(id){
  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("POST", "idIncrementScore.json", true);
  q.send(id);
  // FIX THISSS   ITS NOT SENDING THAT SHIT
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;

  }

}

function saveComment(id, comment){
  var q = new XMLHttpRequest();
  q.onreadystatechange = receive;
  q.open("POST", "idSaveComment.json", true);

  var idComment = id.toString() + "idEnd" + comment;
  q.send(idComment);
  // FIX THISSS   ITS NOT SENDING THAT SHIT
  function receive() {
  if (this.readyState != XMLHttpRequest.DONE) return;

  }

}
