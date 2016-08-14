/* jshint esversion: 6 */

var c;
var colorSkyDark;
var colorSkyLight;
var imageBG;

var constellationLines = [];
var starArray = [];
var starNum = 256;
var starHovering;
var maxStarSize = 5;

var pressPosition = [0, 0];
var releasePosition = [0, 0];
var firstPress = true;
var firstRelease = true;
var drawLine = false;
var noiseOffset = 0;

var controlsPanel;
var showControlsButton, hideControlsButton;
var undoButton, clearButton, resetButton;
var saveImgButton;

var hoverSounds = [];
var playSound = true;

var loading = true;
var loadedSounds = 0;
var loadingStars = [];
var loadingConstellation = [
  [0, 0],
  [-12, 1],
  [-10, 10],
  [-15, 28],
  [-28, 29],
  [-16, 40],
  [-9, 36],
  [1, 17],
  [12, 5],
  [35, -8],
  [40, -25],
  [11, -15]
];

function addSound(filename){
  loadSound(["assets/" + filename + ".mp3", "assets/" + filename + ".ogg"], soundLoaded);

  function soundLoaded(sound){
    console.log(filename);
    hoverSounds.push(sound);
    loadedSounds++;
    if(loadedSounds == 12){
      loading = false;
      makeControls();
      for(var i = 0; i < hoverSounds.length; i++){
        hoverSounds[i].setVolume(0.1);
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorSkyDark = color('#0f0a18');
  colorSkyLight = color('#302b40');

  resetSketch();

  for(var a = 0; a < 64; a++){
    loadingStars.push([random(-width/10, width/10), random(-height/10, height/10)]);
  }

  addSound("bell_a");
  addSound("bell_ab");
  addSound("bell_b");
  addSound("bell_bb");
  addSound("bell_c");
  addSound("bell_d");
  addSound("bell_db");
  addSound("bell_e");
  addSound("bell_eb");
  addSound("bell_f");
  addSound("bell_g");
  addSound("bell_gb");
}

function draw() {
  if(!loading){
    background(colorSkyDark);
    image(imageBG, 0, 0);

    update();

    for(var a = 0; a < starArray.length; a++){
      starArray[a].draw();
      }

    for(var b = 0; b < constellationLines.length; b++){
      stroke(255, 120 + noise(noiseOffset) * 30);
      strokeWeight(1);
      line(constellationLines[b][0], constellationLines[b][1],
           constellationLines[b][2], constellationLines[b][3]);
    }
  }else{
    background(245);
    fill(10);
    noStroke();
    textSize(30);
    textFont("sans-serif");
    textAlign(CENTER, CENTER);
    text("loading", width/2, height/2);
    translate(width/2, height/3);
    stroke(40, 200);
    var constScale = 3;
    for(var i = 0 ; i < loadedSounds; i++){
      if(i < loadingConstellation.length - 1){
        line(loadingConstellation[i][0] * constScale,
            loadingConstellation[i][1] * constScale,
            loadingConstellation[i + 1][0] * constScale,
            loadingConstellation[i + 1][1] * constScale);
      } else{
        line(loadingConstellation[0][0] * constScale,
            loadingConstellation[0][1] * constScale,
            loadingConstellation[i][0] * constScale,
            loadingConstellation[i][1] * constScale);
      }
    }
    noStroke();
    for(var k = 0; k < loadingStars.length; k++){
      var randSize = noise(millis() * 0.001, loadingStars[k][0], loadingStars[k][1]) + 1;
      ellipse(loadingStars[k][0] * constScale, loadingStars[k][1] * constScale, randSize, randSize);
    }
    for(var j = 0 ; j < loadingConstellation.length; j++){
      var rand = noise(millis() * 0.001, loadingConstellation[j][0], loadingConstellation[j][1]) * 2 + 1;
      ellipse(loadingConstellation[j][0] * constScale, loadingConstellation[j][1] * constScale,
        rand, rand);
    }
  }
}

function update(){
  var mouseHovers = false;
  for(var a = 0; a < starArray.length; a++){
    starArray[a].update();
    if(starArray[a].isMouseOver()){
      mouseHovers = true;
      if(playSound){
        hoverSounds[int(random(hoverSounds.length))].play();
        playSound = false;
      }
      starHovering = starArray[a];
      if(mouseIsPressed && firstPress){
        drawLine = true;
        pressPosition[0] = starArray[a].x;
        pressPosition[1] = starArray[a].y;
        firstPress = false;
      }
    }
  }

  if(mouseHovers){
    cursor(HAND);
  } else{
    cursor(ARROW);
    playSound = true;
  }

  if(mouseIsPressed && drawLine){
    stroke(255, 150);
    line(pressPosition[0], pressPosition[1], mouseX, mouseY);
    firstRelease = true;
  } else if(!mouseIsPressed){
    if(!firstPress && firstRelease && mouseHovers && 
       pressPosition[0] != starHovering.x && pressPosition[1] != starHovering.y){
      constellationLines.push(
        [pressPosition[0], pressPosition[1],
         starHovering.x, starHovering.y]
      );
      console.log(constellationLines.length);
      firstRelease = false;
    } else{
      pressPosition[0] = mouseX;
      pressPosition[1] = mouseY;
    }
    firstPress = true;
    drawLine = false;
  }
  noiseOffset += 0.02;
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  resetSketch();
}

function drawSky(){
  imageBG = createImage(width, height);
  imageBG.loadPixels();
  background(colorSkyDark);
  for(var i = 0; i < height; i++){
    var col = lerpColor(colorSkyDark, colorSkyLight, map(i, 0, height, 0, 1));
    for(var j = 0; j < width; j++){
      imageBG.set(j, i, col);
    }
  }
  imageBG.updatePixels();
}

class Star{
  constructor(_x, _y){
    this.x = _x;
    this.y = _y;
    this.size = random(1, maxStarSize);
    this.markerSize = 0;
    this.shineBase = random(80, 150);
    this.shine = this.shineBase;
  }

  update(){
    if(this.isMouseOver() && this.markerSize < maxStarSize * 2.5){
      this.markerSize += 0.5;
    } else if(this.isMouseOver() === false){
      this.markerSize = 0;
    }
    this.shine = this.shineBase + noise(this.x, this.y, noiseOffset) * 100;
  }

  isMouseOver(){
    var treshold = maxStarSize * 1.5;
    if(mouseX >= this.x - treshold && mouseX <= this.x + 
       treshold && mouseY >= this.y - treshold && mouseY <= this.y + treshold)
    {
      return true;
    } else{
      return false;
    }
  }

  draw(){
    noStroke();
    fill(255, this.shine);
    ellipse(this.x, this.y, this.size, this.size);
    if(this.isMouseOver()){
      stroke(255, 150);
      strokeWeight(2);
      fill(255, 50);
      ellipse(this.x, this.y, this.markerSize, this.markerSize);
    }
  }
}

function makeControls(){
  var controlsContainer = createDiv("");
  controlsContainer.style("position", "fixed");
  controlsContainer.style("left", "0em");
  controlsContainer.style("top", "0em");
  controlsContainer.style("margin", "0.5em");
  controlsContainer.style("font-family", "sans-serif");

  showControlsButton = createButton("SHOW CONTROLS");
  showControlsButton.style("display", "block");
  showControlsButton.style("margin", "0.5em auto");
  showControlsButton.mousePressed(showControls);
  controlsContainer.child(showControlsButton);

  hideControlsButton = createButton("HIDE CONTROLS");
  hideControlsButton.style("display", "block");
  hideControlsButton.style("margin", "0.5em auto");
  hideControlsButton.mousePressed(hideControls);
  controlsContainer.child(hideControlsButton);
  hideControlsButton.hide();

  controlsPanel = createDiv("");
  controlsPanel.style("padding", "1em");
  controlsPanel.style("background-color", "rgba(255, 255, 255, 0.5)");
  controlsContainer.child(controlsPanel);
  controlsPanel.hide();

  undoButton = createButton("UNDO");
  undoButton.style("display", "block");
  undoButton.style("margin", "0.5em auto");
  undoButton.mousePressed(undoConstellation);
  controlsPanel.child(undoButton);
 
  clearButton = createButton("CLEAR");
  clearButton.style("display", "block");
  clearButton.style("margin", "0.5em auto");
  clearButton.mousePressed(clearConstellation);
  controlsPanel.child(clearButton);
  
  resetButton = createButton("RESET");
  resetButton.style("display", "block");
  resetButton.style("margin", "0.5em auto");
  resetButton.mousePressed(resetSketch);
  controlsPanel.child(resetButton);
  
  saveImgButton = createButton("SAVE IMAGE");
  saveImgButton.style("display", "block");
  saveImgButton.style("margin", "1.5em auto 0.5em");
  saveImgButton.mousePressed(saveImage);
  controlsPanel.child(saveImgButton);
}

function hideControls(){
  controlsPanel.hide();
  showControlsButton.show();
  hideControlsButton.hide();
}

function showControls(){
  controlsPanel.show();
  showControlsButton.hide();
  hideControlsButton.show();
}

function undoConstellation(){
  if(constellationLines.length > 0){
    constellationLines.splice(-1, 1);
  }
}

function clearConstellation(){
  constellationLines = [];
}

function resetSketch(){
  drawSky();
  clearConstellation();
  starArray = [];
  for(var a = 0; a < starNum; a++){
    starArray.push(new Star(random(width), random(height)));
  }
}

function saveImage(){
  saveCanvas(c, "DIY_Contellation_" + hour() + "-" + minute() + "-" + second(), "png");
}
