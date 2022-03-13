
class MapAndTiles{

constructor(map, tiles){
  this.map = map;
  this.tiles = tiles;
}

}

class Tile{

constructor(x, y){
  this.x = x;
  this.y = y;
}

}


class Game{

  constructor(field) {
    this.field = this.deepCopy(field);
  }

  deepCopy(field){
    var newField = new Array(h);
    for(let i = 0; i < h; i++){
      newField[i] = new Array(w);
      for(let j = 0; j < w; j++){
        var c = field[i][j];
        var newC = new Cell(c.mine, c.revieled, j, i);
        newC.num = c.num;
        newC.flaged = c.flaged;
        newField[i][j] = newC;
      }
    }
    return newField;

  }

  reviel(cX, cY){
    if(cX < 0 || cX >= w || cY < 0 || cY >= h){
      return;
    }
    var cell = this.field[cY][cX];
    if(cell.revieled || cell.flaged){
      return;
    }
    cell.revieled = true;
    if(cell.mine){
      console.log("errorororor");
    }
    if(!cell.mine){
      var cellNum = cell.getNum();
      if(cellNum == 0){
        this.reviel(cX+1, cY+1);
        this.reviel(cX+1, cY-1);
        this.reviel(cX+1, cY);
        this.reviel(cX, cY+1);
        this.reviel(cX, cY-1);
        this.reviel(cX-1, cY+1);
        this.reviel(cX-1, cY-1);
        this.reviel(cX-1, cY);
      }
    }
  }

flagCell(x, y){
  if(x < 0 || x >= w || y < 0 || y >= h){
    return;
  }
  if(!this.field[y][x].revieled){
    this.field[y][x].flaged = true;
  }
}

isWon(){
  var numCells = 0;
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      if(this.field[i][j].revieled){
        numCells++;
      }
    }
  }
  return numCells == w*h-totalBombs;
}

//num = num bombs around, -1 means flag, -2 unrevieled
getShownField(){
  var shownField = new Array(h);
  for(let i = 0; i < h; i++){
    shownField[i] = new Array(w);
    for(let j = 0; j < w; j++){
      var c = this.field[i][j];
      if(c.revieled){
        shownField[i][j] = c.num;
      }else if(c.flaged){
        shownField[i][j] = -1;
      }else{
        shownField[i][j] = -2;
      }
    }
  }
  return shownField;

}


}

class Simulation{

  constructor(field) {
    //array of ints, -4 not a bomb, -3 ignore, -2 unknown, -1 mine/flag, 0-8 nums
    this.field = this.deepCopy(field);
  }

  deepCopy(field){
    var newField = new Array(h);
    for(let i = 0; i < h; i++){
      newField[i] = new Array(w);
      for(let j = 0; j < w; j++){
        newField[i][j] = field[i][j];
      }
    }
    return newField;

  }

  reviel(cX, cY){
    if(cX < 0 || cX >= w || cY < 0 || cY >= h){
      return;
    }
    if(this.field[cY][cX] == -2){
    	this.field[cY][cX] = -4;
    }
  }

flagCell(x, y){
  if(x < 0 || x >= w || y < 0 || y >= h){
    return;
  }
  if(this.field[y][x] == -2){
    this.field[y][x] = -1;
  }
}

isDone(){
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      if(this.field[i][j] == -2){
        return false;
      }
    }
  }
  return true;
}

  tooManyBombs(){
    var nbs = 0
    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
        if(this.field[i][j] == -1){
          nbs++;
        }
      }
    }
    return nbs > totalBombs;
  }

}

var game;

function testIfWinable(field, colClicked, rowClicked){
  game = new Game(field);
  game.reviel(colClicked, rowClicked);
  var map = game.getShownField();
  while(!game.isWon()){
    var possible = makeNextMoves(map);
    if(possible){
      map = game.getShownField();
    }else{
      return false;
    }
  }
  return true;
}

function makeNextMoves(map){
  var possible = false;
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      var c = map[i][j];
      if(c >= 0){
        var fs = findNumNums(j, i, -1, map);
        var ufos = findNumNums(j, i, -2, map);
        if(fs + ufos == c && ufos != 0){
          flagBorder(j, i, map, game);
          possible = true;
        }
        if(fs == c && ufos != 0){
          revielBorder(j, i, map, game);
          possible = true;
        }
      }
    }
  }
  if(!possible){
    possible = guess(map);
  }
  return possible;
}


function guess(map){
  var MAT = cleanUpMap(map);
  var cleanMap = MAT.map;
  var tiles = MAT.tiles;
  for(let i = 0; i < tiles.length; i++){
    //check if it being a bomb leads to an imposible graph
    if(tileCanNotBeNum(i, tiles, cleanMap, -1)){
      game.reviel(tiles[i].x, tiles[i].y);
      return true;
    //check if it not being a bomb leads to an imposible graph
    }else if(tileCanNotBeNum(i, tiles, cleanMap, -4)){
      game.flagCell(tiles[i].x, tiles[i].y);
      return true;
    }
  }
  //check if there is exactly enough mines, and thus the cells we have no info on can't be mines
  totalBombs--;
  //reduce the number of bombs by 1
  //if there is no arangment of mines that leads to a valid graph, when we reduce by 1
  //the we have exactly the right amount of bombs
  for(let i = 0; i < tiles.length; i++){
    //check if it being a bomb leads to a posible graph
    //if there is a possible graph then we can't choose an unknown cell
    if(!tileCanNotBeNum(i, tiles, cleanMap, -1)){
      totalBombs++;
      return false;
    //check if it not being a bomb leads to an imposible graph
    }else if(!tileCanNotBeNum(i, tiles, cleanMap, -4)){
      totalBombs++;
      return false;
    }
  }
  totalBombs++;
  //if there are no unknowns it is still unsolveable
  return revielUnknowns(cleanMap);

}

function revielUnknowns(cleanMap){
  var hadUnknown = false;
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      var c = cleanMap[i][j];
      if(c == -3){
        hadUnknown = true;
        game.reviel(j, i);
      }
    }
  }
  return hadUnknown;
}

function cleanUpMap(map){
  var cm = new Array(h);
  var tiles = [];
  for(let i = 0; i < h; i++){
    cm[i] = new Array(w);
    for(let j = 0; j < w; j++){
      var c = map[i][j];
      if(c != -2){
        cm[i][j] = c;
      }else{
        var infos = findInfoBorders(j, i, map);
        if(infos == 0){
          cm[i][j] = -3;
        }else{
          cm[i][j] = -2;
          tiles.push(new Tile(j, i));
        }
      }
    }
  }
  return new MapAndTiles(cm, tiles);

}

function tileCanNotBeNum(i, tiles, cleanMap, num){
  var simulation = new Simulation(cleanMap);
  simulation.field[tiles[i].y][tiles[i].x] = num;
  var savedSims = [];
  //the index of the tiles guessed
  var guesses = [];
  while(!simulation.isDone()){
    //code = 1 it made a move, code = 0 it did not make a move, code = -1 the map isn't valid
    var code = simNextMoves(simulation);
    if(code == 0){
      savedSims.push(simulation);
      simulation = new Simulation(simulation.field);
      guesses.push(makeGuess(simulation, tiles));
    }else if(code == -1){
      if(savedSims.length != 0){
        guessed = false;
        simulation = savedSims.pop();
        var g = guesses.pop();
        simulation.reviel(tiles[g].x, tiles[g].y);
      }else{
        return true;
      }
    }
  }
  return false;
}

function simNextMoves(simulation){
  var madeMove = 0;
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      var c = simulation.field[i][j];
      if(c >= 0){
        var fs = findNumNums(j, i, -1, simulation.field);
        var ufos = findNumNums(j, i, -2, simulation.field);
        if(fs + ufos == c && ufos != 0){
          flagBorder(j, i, simulation.field, simulation);
          madeMove = 1;
        }
        if(fs == c && ufos != 0){
          revielBorder(j, i, simulation.field, simulation);
          madeMove = 1;
        }
        if(fs > c || fs + ufos < c){
          return -1;
        }

        
      }
    }
  }
  if(simulation.tooManyBombs()){
    return -1;
  }
  return madeMove;
}

function makeGuess(sim, ts){
  for(let i = 0; i < ts.length; i++){
    var t = ts[i];
    if(sim.field[t.y][t.x] == -2){
      sim.flagCell(t.x, t.y);
      return i;
    }
  }
}

function findNumNums(x, y, num, map){
  var numNums = 0;
  if(y < h-1 && x < w-1 && map[y+1][x+1] == num){
      numNums++;
    }
    if(y < h-1  && map[y+1][x] == num){
      numNums++;
    }
    if(y < h-1 && x > 0 && map[y+1][x-1] == num){
      numNums++;
    }
    if(x < w-1 && map[y][x+1] == num){
      numNums++;
    }
    if(x > 0 && map[y][x-1] == num){
      numNums++;
    }
    if(y > 0 && x < w-1 && map[y-1][x+1] == num){
      numNums++;
    }
    if(y > 0  && map[y-1][x] == num){
      numNums++;
    }
    if(y > 0 && x > 0 && map[y-1][x-1] == num){
      numNums++;
    }
    return numNums;

}

function findInfoBorders(x, y, map){
  var numInfo = 0;
  if(y < h-1 && x < w-1 && map[y+1][x+1] >= 0){
      numInfo++;
    }
    if(y < h-1  && map[y+1][x] >= 0){
      numInfo++;
    }
    if(y < h-1 && x > 0 && map[y+1][x-1] >= 0){
      numInfo++;
    }
    if(x < w-1 && map[y][x+1] >= 0){
      numInfo++;
    }
    if(x > 0 && map[y][x-1] >= 0){
      numInfo++;
    }
    if(y > 0 && x < w-1 && map[y-1][x+1] >= 0){
      numInfo++;
    }
    if(y > 0  && map[y-1][x] >= 0){
      numInfo++;
    }
    if(y > 0 && x > 0 && map[y-1][x-1] >= 0){
      numInfo++;
    }
    return numInfo;

}

function flagBorder(x, y, map, g){
  if(y < h-1 && x < w-1 && map[y+1][x+1] == -2){
      g.flagCell(x+1, y+1);
    }
    if(y < h-1  && map[y+1][x] == -2){
      g.flagCell(x, y+1);
    }
    if(y < h-1 && x > 0 && map[y+1][x-1] == -2){
      g.flagCell(x-1, y+1);
    }
    if(x < w-1 && map[y][x+1] == -2){
      g.flagCell(x+1, y);
    }
    if(x > 0 && map[y][x-1] == -2){
      g.flagCell(x-1, y);
    }
    if(y > 0 && x < w-1 && map[y-1][x+1] == -2){
      g.flagCell(x+1, y-1);
    }
    if(y > 0  && map[y-1][x] == -2){
      g.flagCell(x, y-1);
    }
    if(y > 0 && x > 0 && map[y-1][x-1] == -2){
      g.flagCell(x-1, y-1);
    }
}

function revielBorder(x, y, map, g){
  if(y < h-1 && x < w-1 && map[y+1][x+1] == -2){
      g.reviel(x+1, y+1);
    }
    if(y < h-1  && map[y+1][x] == -2){
      g.reviel(x, y+1);
    }
    if(y < h-1 && x > 0 && map[y+1][x-1] == -2){
      g.reviel(x-1, y+1);
    }
    if(x < w-1 && map[y][x+1] == -2){
      g.reviel(x+1, y);
    }
    if(x > 0 && map[y][x-1] == -2){
      g.reviel(x-1, y);
    }
    if(y > 0 && x < w-1 && map[y-1][x+1] == -2){
      g.reviel(x+1, y-1);
    }
    if(y > 0  && map[y-1][x] == -2){
      g.reviel(x, y-1);
    }
    if(y > 0 && x > 0 && map[y-1][x-1] == -2){
      g.reviel(x-1, y-1);
    }
}
