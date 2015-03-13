var app   = null,
    users = [],
    items = [],
    ball = null,
    velocity = null;

    var currentLevelIndex = 1;
    var totalLevelNumber = 8;
/*
  called once at initialisation
*/





function setup() {
  playSound();
  console.log("Setup");
  console.log("Current level index is " + currentLevelIndex);
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'Ball Bounce',
    author1 : 'Pierre Georges',
    author2 : 'Mirko Stanchieri'
  });
  app.usersOffset.y = 200;

  setupBall();

  $(window)
  
  importSVG('assets/ballbounce/levels/level' + currentLevelIndex + '.svg');
}

function playSound(){
var audio = new Audio('assets/ballbounce/sounds/ambiance.mp3');
 audio.loop = true;
 audio.play();
}

function playSoundHit(){
var audio = new Audio('assets/ballbounce/sounds/clave.wav');
 audio.play();
}
function playSoundHit2(){
var audio = new Audio('assets/ballbounce/sounds/clave2.aiff');
 audio.play();
}

function playSoundLoose(){
var audio = new Audio('assets/ballbounce/sounds/gamefail.wav');
 audio.play();
}

function playSoundWin(){
var audio = new Audio('assets/ballbounce/sounds/bonus.wav');
 audio.play();
}

function importSVG(file) {
  console.log("importing svg file " + file)
/*
  var newLayer = new paper.Layer();

  paper.project.importSVG(file);
  items = newLayer._children;
*/
  
  paper.project.importSVG(file, function(item){


    level = new paper.Symbol(item);
    //var levelItem = level.place(paper.view.bounds.width/2,paper.view.bounds.height/2);
    //var levelItem = level.place(1280/2, 720/2);
    var levelItem = level.place();
    levelItem.tranformChildren = false;
    levelItem.pivot = new paper.Point(0,0);
    //levelItem.translate(new paper.Point(levelItem.bounds.width/2, levelItem.bounds.height / 2));
    levelItem.translate(new paper.Point(1024/2, 768/2));
    levelItem.sendToBack();
    //levelItem.position = paper.view.center;
    //levelItem.position = new paper.Point(0,0);

    levelItem.name = "lvl";
    parse(level.definition);


  });

}

function parse(item) {


  if (item.children) {
    for (var i = 0; i < item.children.length; i++) {
      parse( item.children[i] );
    }
  }
  else {
    item.name = "lvl";
    var fc = item.strokeColor;
    if(!fc) return;
    window.fc = fc;

    
//----> BORD <----\\

    if (fc.toCSS() == 'rgb(0,0,255)') {
      item.visible = false;

      //item.rotation = 45; 
     
      items.push(item);
  }

//----> BORD win  <----\\


    if (fc.toCSS() == 'rgb(0,255,0)') {
      item.visible = false;

      //item.rotation = 45; 
     
      items.push(item);

 //----> OBSACLES rouge <----\\

    } else if (fc.toCSS() == 'rgb(255,0,0)')  {
      item.visible = false;
      items.push(item);


//----> OBSACLES VERTICAUX BOUGENT <----\



//----> OBJECTIF <----\\

    } else if (fc.toCSS() == 'rgb(0,0,0)')  {
      item.visible = false;
      items.push(item);

//----> BONUS <----\\

    } else if (fc.toCSS() == 'rgb(0,0,0)')  {
      item.visible = false;
      items.push(item);
    }
  }
}


function nextLevel(){
  currentLevelIndex = (currentLevelIndex + 1) % totalLevelNumber;
  importSVG("assets/ballbounce/levels/level" + currentLevelIndex + ".svg");
  setupBall();
}


function setupBall() {
  ball = new paper.Path.Circle({
    radius : 10,
    position : [15, paper.view.center.y],
    fillColor : 'white',
    name: "lvl"
  });

  // velocity = new paper.Point(5 + Math.random()*10, (Math.random()-0.5)*10);
  resetBall();
}

function resetBall() {  
  ball.position = new paper.Point([0, paper.view.center.y]);
  velocity = new paper.Point(3, 0);
}

function resetLevel() {
  for (var i = 0; i < items.length; i++) {
    items[i].remove();
  }
  items.splice(0, items.length);

  // Remove stuff marked with lvl name as parts of the level
  var arrToRemove = [];
  for (var i = 0; i < app.view.children.length; i++) 
  {
    var item = app.view.children[i];
    if (item.name == "lvl")
    {
      arrToRemove.push(item);
    }
  }

  for (var i = 0; i < arrToRemove.length; i++)
  {
    var item = arrToRemove[i];
    item.remove();
  }
}

function destroyLevel()
{
  resetLevel();
  //app.view.clear();
  console.log("items length is ")
  console.log(items.length)
}

/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  var lpos, rpos, segs;

  for(var i=0; i<users.length; i++) {
    var user = users[i];
    // update the position of each line with the new hands positions
    
    var leftHandPos  = users[i].leftHand.position;
    var rightHandPos = users[i].rightHand.position;
    var lineSegments = users[i].line.segments;

    lineSegments[0].point.x = leftHandPos.x;
    lineSegments[0].point.y = leftHandPos.y;
    lineSegments[1].point.x = rightHandPos.x;
    lineSegments[1].point.y = rightHandPos.y;

    if(user.canPlaceLine && users[i].leftHand.state == 'closed' && users[i].rightHand.state == 'closed'){

      addLine(users[i].leftHand, users[i].rightHand);
      user.canPlaceLine = false;
    }

    if (!user.canPlaceLine && users[i].leftHand.state == 'open' && users[i].rightHand.state == 'open')
    {
      user.canPlaceLine = true;
    }
    

  }

  updateBall();
  
  for (var i = items.length - 1; i >= 0; i--) {
    app.drawDebugLine(items[i].segments[0].point, items[i].segments[1].point, 'cyan');
  };
}

function addLine(leftHand, rightHand){

  var line = new paper.Path.Line({
    strokeColor : 'white',
    strokeWidth : 5

  });

  var lineSegments = line.segments;
    
    var leftHandPos  = leftHand.position;
    var rightHandPos = rightHand.position;

    lineSegments[0].point.x = leftHandPos.x;
    lineSegments[0].point.y = leftHandPos.y;
    lineSegments[1].point.x = rightHandPos.x;
    lineSegments[1].point.y = rightHandPos.y;

    items.push(line); 
  
}


function updateBall() {

  ball.position = ball.position.add(velocity);


  var item, bCollide;

  for (var i = 0; i < items.length; i++) {
    
    item = items[i];

    bCollide = checkCollide(ball.position, item.segments[0].point, item.segments[1].point);
    if(bCollide) {
      bounce(ball.position, item.segments[0].point, item.segments[1].point);
      if(item.strokeColor.toCSS() == 'rgb(0,0,255)') {
        console.log("hourra");
        playSoundHit();

      } else if(item.strokeColor.toCSS() == 'rgb(58,82,135)') {
        console.log("obstacle hited");
        

      } else if(item.strokeColor.toCSS() == 'rgb(255,255,255)') {
        console.log("hourra_2");
        playSoundHit2();
        items.splice(i,1);
        i--;
        item.remove();

      } else if(item.strokeColor.toCSS() == 'rgb(255,0,0)') {
        resetBall();
        playSoundLoose();
        console.log("c'est pas rouge");
        
      } else if(item.strokeColor.toCSS() == 'rgb(0,255,0)') {
        playSoundWin();
        destroyLevel();
        nextLevel();
        console.log("WIN");
        
      }
    }
  }

  loopWalls();
}


function loopWalls() {

  if(ball.position.x > paper.view.bounds.width) {
    ball.position.x = 0;
  } else if(ball.position.x < 0) {
    ball.position.x = paper.view.bounds.width;
  }
  if(ball.position.y > paper.view.bounds.height) {
    ball.position.y = 0;
  } else if(ball.position.y < 0) {
    ball.position.y = paper.view.bounds.height;
  }
}


/* 
  called everytime a new user enters
  this is usually where you create a new line
  - leftHand and rightHand are objects structured as :
  {
    position : paper.Point,
    velocity : paper.Point
    joint : ks.Joint
    state : "unknown", "nottracked", "open" or "closed"
  }
*/
function onUserIn(id, leftHand, rightHand) {

  // create a line with paperjs
  var line = new paper.Path.Line({
    strokeColor : 'cyan',
    strokeWidth : 5
  });

  // create an object defining our user's properties
  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    line      : line,
    canPlaceLine : true
  };

  // and add it to our users table
  users.push(user);
}


/* 
  called everytime a user leaves
  this is usually where you remove the user's line
*/
function onUserOut(id) {

  for(var i=0; i<users.length; i++) {

    if (users[i].bodyId == id) {
      users[i].line.remove();
      users.splice(i, 1);
      break;
    }
  }
}


// ball / wall bouncing code
// paperjs adaptation & simplification of http://balldroppings.com/js/

function diffSign(v1, v2) {
  if ((v1 >= 0 && v2 < 0) || (v2 >= 0 && v1 < 0)) { return true; }
  else { return false; }
}

function checkAngle(point, line, lineVec) {
  var vec = line.subtract(point);
  var vecline = new paper.Point(-lineVec.y, lineVec.x);
  vec.normalize();
  vecline.normalize();
  return vec.dot(vecline);
}

function checkCollide(ball, lA, lB) {
  var vec  = lB.subtract(lA);
  var a1 = checkAngle(ball, lA, vec);
  var a2 = checkAngle(ball, lB, vec);
  var dA1  = checkAngle(ball.add(velocity), lA, vec);
  var dA2  = checkAngle(ball.add(velocity), lB, vec);
  if (diffSign(a1, dA1) && diffSign(a2, dA2)) {
      var d1 = ball.subtract(lA);
      var d2 = ball.subtract(lB);
      var wallLength = vec.length;
      if ((d1.length < wallLength) && (d2.length < wallLength)) {
          return true;
      } else { return false; }
  } else {return false;}
}

function bounce(ball, lA, lB) {
  var v = velocity;
  var n = lB.subtract(lA);
  n = new paper.Point(n.y, -n.x);
  n = n.normalize();
  var dotVec = v.dot(n) * 2;
  n = n.multiply(dotVec);
  var mvn = v.subtract(n);
  velocity.x = mvn.x;
  velocity.y = mvn.y;
}