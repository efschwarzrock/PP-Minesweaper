var w = 30;
var h = 16;
//var w = 8;
//var h = 9;

var cellDim = 30;
var totalBombs = 99;
var bombsLeft = totalBombs;
var field = new Array(h);
var numClicks = 0;
var rightClickProgress = false;
var middleClickProgress = false;
var lost = false;
var numColors;
var won = false;
var wasReset = true;

setInterval(setTime, 100);
var timer = 0;

function setTime() {
  if(!wasReset && !won){
    ++timer;
  }
}

class Cell{

  constructor(mine, revieled, x, y) {
    this.mine = mine;
    this.revieled = revieled;
    this.flaged = false;
    this.num = 0;
    this.numFlags = 0;
    this.x = x;
    this.y = y;
    
  }

  draw(){
      //color of square
      if(this.revieled){
        if(this.mine){
          fill(color(255, 0, 0))
        }else{
          fill(color(255, 255, 255))
          if(won){
            fill(color(0, 255, 0))
          }
        }
      }else{
        fill(color(200, 200, 200))
      }
      rect(this.x*cellDim,this.y*cellDim,cellDim,cellDim);
      //check if we need to add a number
      if(this.num != 0){
        fill(numColors[this.num-1]);
        text(this.num, (this.x + 0.35)*cellDim, (this.y + 0.75)*cellDim);
      }else if(this.flaged){
      //check to add flag
        fill(color(255,0,0));
        triangle((this.x + 0.2)*cellDim, (this.y + 0.2)*cellDim, (this.x + 0.2)*cellDim, (this.y + 0.8)*cellDim, (this.x + 0.8)*cellDim, (this.y + 0.5)*cellDim)
      }
  }

  getNum(){
    var numMines = 0;
    if(this.y < h-1 && this.x < w-1 && field[this.y+1][this.x+1].mine){
      numMines++;
    }
    if(this.y < h-1  && field[this.y+1][this.x].mine){
      numMines++;
    }
    if(this.y < h-1 && this.x > 0 && field[this.y+1][this.x-1].mine){
      numMines++;
    }
    if(this.x < w-1 && field[this.y][this.x+1].mine){
      numMines++;
    }
    if(this.x > 0 && field[this.y][this.x-1].mine){
      numMines++;
    }
    if(this.y > 0 && this.x < w-1 && field[this.y-1][this.x+1].mine){
      numMines++;
    }
    if(this.y > 0  && field[this.y-1][this.x].mine){
      numMines++;
    }
    if(this.y > 0 && this.x > 0 && field[this.y-1][this.x-1].mine){
      numMines++;
    }
    this.num = numMines;
    return numMines;
  }

  getNumFlags(){
    var numFlag = 0;
    if(this.y < h-1 && this.x < w-1 && field[this.y+1][this.x+1].flaged){
      numFlag++;
    }
    if(this.y < h-1  && field[this.y+1][this.x].flaged){
      numFlag++;
    }
    if(this.y < h-1 && this.x > 0 && field[this.y+1][this.x-1].flaged){
      numFlag++;
    }
    if(this.x < w-1 && field[this.y][this.x+1].flaged){
      numFlag++;
    }
    if(this.x > 0 && field[this.y][this.x-1].flaged){
      numFlag++;
    }
    if(this.y > 0 && this.x < w-1 && field[this.y-1][this.x+1].flaged){
      numFlag++;
    }
    if(this.y > 0  && field[this.y-1][this.x].flaged){
      numFlag++;
    }
    if(this.y > 0 && this.x > 0 && field[this.y-1][this.x-1].flaged){
      numFlag++;
    }
    this.numFlags = numFlag;
    return numFlag;
  }

}


function setup() {
  numColors = [color(0,0,255), color(100,200, 100), color(255,0,0), color(0,0,150), color(100,0,0), color(0,100,200), color(0,0,0), color(200,200,200)]

  createCanvas(cellDim*(w+4), cellDim*(h+5));
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  for(let i = 0; i < h; i++){
    field[i] = new Array(w);
    for(let j = 0; j < w; j++){
      field[i][j] = new Cell(false, false, j, i);
    }
  }
}

function draw() {
  if (mouseIsPressed === false){
    //its a right click
    if(rightClickProgress){
      rightClickProgress = false;
      handelRightClick();
    }
    //it's a middle click
    if(middleClickProgress){
     middleClickProgress = false;
     handelMiddleClick();
     return;
    }
  }
  //draw background
  fill(color(255,255,255));
  rect(-5, -5, cellDim*(w+10), cellDim*(h+10));
  //draw field
  textSize(20);
  strokeWeight(2);
  textStyle(BOLD);
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      field[i][j].draw();
    }
  }

  textSize(20);
  //draw reset button
  fill(color(200, 200, 200));
  rect((w/2)*cellDim-50, (h+1.5)*cellDim, 100, 30);
  fill(color(200,0,0))
  text("Reset", (w/2)*cellDim-27, (h+2.2)*cellDim);
  //draw numBombs left
  text("Bombs Left: " + bombsLeft, 0, (h+1)*cellDim);
  //draw time
  text("Time: " + Math.floor(timer/10), w*cellDim-100, (h+1)*cellDim);
  
  if(won){
    //draw Win congratultions
    text("You Won!", (w/2)*cellDim-45, (h+3.2)*cellDim);
  }

}

function mousePressed() {
  if (mouseButton === RIGHT) {
    rightClickProgress = true;
  }
  if(mouseButton === CENTER){
    middleClickProgress = true;
    rightClickProgress = false;
  }
}



function mouseClicked(event) {
  var rowClicked = Math.floor(mouseY/cellDim);
  var colClicked = Math.floor(mouseX/cellDim);
  handelMouseActivation(rowClicked, colClicked);
}

function keyPressed(event) {
  if(event.key == 's'){
    var rowClicked = Math.floor(mouseY/cellDim);
    var colClicked = Math.floor(mouseX/cellDim);
    handelMouseActivation(rowClicked, colClicked);
  }
}

function handelMouseActivation(rowClicked, colClicked){
  if(rowClicked >= 0 && rowClicked < h && colClicked >= 0 && colClicked < w){
    if(wasReset){
      var winnable = false;
      wasReset = false;
      
      while(!winnable){
        resetField();
        makeGame(colClicked, rowClicked);
        var winnable = testIfWinable(field, colClicked, rowClicked);
        console.log(winnable)
      }
    }
    numClicks++;
    handelReviel(colClicked, rowClicked);
  }else if(mouseY > (h+1.5)*cellDim && mouseY < (h+1.5)*cellDim + 30 && mouseX > (w/2)*cellDim-50 && mouseX < (w/2)*cellDim+50){
    numClicks = 0;
    resetField();
    timer = 0;
    bombsLeft = 99;
    won = false;
    wasReset = true;
  }
}

//resets the field
function resetField(){
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      field[i][j].mine = false;
      field[i][j].revieled = false;
      field[i][j].flaged = false;
      field[i][j].num = 0;
      field[i][j].numFlags = 0;
    }
  }
}

//assignes the bombs to places
function makeGame(cX, cY){
/*
field[0][5].mine = true;
field[1][4].mine = true;
field[2][4].mine = true;
field[4][4].mine = true;
field[4][5].mine = true;
field[5][1].mine = true;
field[5][2].mine = true;
field[5][3].mine = true;
field[5][4].mine = true;
field[5][0].mine = true;

*/
  for(let i = 0; i < totalBombs; i++){
    var x = Math.floor(Math.random()*w);
    var y = Math.floor(Math.random()*h);
    if(field[y][x].mine || (Math.abs(x-cX) < 2 && Math.abs(y-cY) < 2)){
      i--;
    }else{
      field[y][x].mine = true;
    }
  }

}

//handels the logic of clicking on a cell(finding the number of mine neighbors, if its a mine ect
function handelReviel(cX, cY){
  if(cX < 0 || cX >= w || cY < 0 || cY >= h){
    return;
  }
  var cell = field[cY][cX];
  if(cell.revieled || cell.flaged){
    return;
  }
  cell.revieled = true;
  if(!cell.mine){
    var cellNum = cell.getNum();
    if(cellNum == 0){
      handelReviel(cX+1, cY+1);
      handelReviel(cX+1, cY-1);
      handelReviel(cX+1, cY);
      handelReviel(cX, cY+1);
      handelReviel(cX, cY-1);
      handelReviel(cX-1, cY+1);
      handelReviel(cX-1, cY-1);
      handelReviel(cX-1, cY);
    }
  }
  if(gameWon()){
    won = true;
    numClicks = 0;
  }
}

function handelRightClick() {
  var y = Math.floor(mouseY/cellDim);
  var x = Math.floor(mouseX/cellDim);
  flagCell(x, y);

}

function flagCell(x, y){
  if(x < 0 || x >= w || y < 0 || y >= h){
    return;
  }
  if(!field[y][x].revieled){
    field[y][x].flaged = !field[y][x].flaged;
    if(field[y][x].flaged){
      bombsLeft--;
    }else{
      bombsLeft++;
    }
  }
}

function handelMiddleClick(){
  var y = Math.floor(mouseY/cellDim);
  var x = Math.floor(mouseX/cellDim);
  revielAdjCells(x, y);
}

function revielAdjCells(x, y){
  var cell = field[y][x];
  if(cell.revieled && cell.getNumFlags() == cell.num){
    handelReviel(x+1, y+1);
      handelReviel(x+1, y-1);
      handelReviel(x+1, y);
      handelReviel(x, y+1);
      handelReviel(x, y-1);
      handelReviel(x-1, y+1);
      handelReviel(x-1, y-1);
      handelReviel(x-1, y);
  }
}

function gameWon(){

  var numPosibleBombs = 0;
  for(let i = 0; i < field.length; i++){
    for(let j = 0; j < field[i].length; j++){
      if(!field[i][j].revieled || field[i][j].mine){
        numPosibleBombs++;
      }
    }
  }
  return numPosibleBombs == totalBombs;

}
