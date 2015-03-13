var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    bg, group;

var chain, chainView,
    numNodesPerChain = 20,
    chainNodesRadius = 15;

var words = ['AKPA', 'LOVE', 'TEST'],
    currWord = 0,
    currLetter = 0,
    guideLetter = null,
    letterRasters = [];

var isActive = true;


/* 
  called once at initialisation
*/
function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'WORK OUT',
    author1 : 'Lina Berjaner',
    author2 : 'Pablo Perez'
  });

  setupPhysics();

  group = new paper.Group();
  group.transformContent = false;

  bg = new paper.Path.Rectangle({
    fillColor : 'white',
    width  : paper.view.bounds.width,
    height : paper.view.bounds.height
  });
  group.addChild(bg);

  chain = addChain(new paper.Point(50,400), new paper.Point(900,400));
  chainView = new paper.Path({
    strokeWidth : chainNodesRadius*2,
    strokeColor : 'white',
    strokeJoin : 'round'
  });
  group.addChild(chainView);

  // init our chainview path
  for(var k=0;k<chain.bridge.bodies.length;k++){
    chainView.add([0,0]);
  }

  $(window).click(function(){
    validateLetter();
  });

  setCurrLetter();

  ocrLoop();
}


function setupPhysics() {

  physics = new HL.Physics();
  physics.engine.world.gravity.y = 0.0;
  physics.addFloor();
}


function addChain(leftPos, rightPos) {

  var gpId = Matter.Body.nextGroupId();
  var bridge = Matter.Composites.stack(leftPos.x, leftPos.y, numNodesPerChain, 1, 15, 0, function(x, y, column, row) {
      var b = Matter.Bodies.circle(x, y, chainNodesRadius, { groupId: gpId, friction:0, restitution:1, frictionAir:1 });
      b.initPos = new paper.Point(x, y);
      return b;
  });
  
  Matter.Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.8 });

  var lastBody = bridge.bodies[bridge.bodies.length-1];
  
  Matter.World.add(physics.engine.world, [
      bridge
  ]);

  return {bridge:bridge};
}


function setCurrLetter(){
  if(guideLetter) {
    guideLetter.remove();
  }
  guideLetter = new paper.PointText({
    content: words[currWord][currLetter],
    fillColor: 'white',
    fontFamily: 'tstar_twregular',
    fontWeight: 'bold',
    fontSize: 500
  });
  guideLetter.fillColor.alpha = 0.1;
  guideLetter.transformContent = false;
  guideLetter.pivot = new paper.Point(guideLetter.bounds.width*0.5, -guideLetter.bounds.height*0.3);
  guideLetter.position = paper.view.center;
  guideLetter.sendToBack();
}


var rasterToRemove;

function ocrLoop(){
  
  // if(group.bounds.height === 0 || group.bounds.width === 0) {
  //   return;
  // }

  bg.visible = true;
  chainView.strokeColor = 'black';
  for (var i = 0; i < users.length; i++) {
    users[i].line.strokeColor = 'black';
  }

  var raster = group.rasterize(20);
  var imageData = raster.getImageData(raster.size);
  var ocrText;
  if(isActive){ ocrText = OCRAD(imageData);}
  if(ocrText) console.log(ocrText);
  document.getElementById('projectTitle').innerHTML = ocrText;

  raster.visible = false;

  bg.visible = false;
  chainView.strokeColor = 'white';
  for (var j = 0; j < users.length; j++) {
    users[j].line.strokeColor = 'white';
  }

  if (ocrText && (ocrText.indexOf(words[currWord][currLetter]) > -1 || ocrText.indexOf(words[currWord][currLetter].toLowerCase()) > -1)) {
    validateLetter();
  }

  raster.scaling = 1;
  if (rasterToRemove) rasterToRemove.remove();

  rasterToRemove = raster;

  setTimeout(ocrLoop, 500);
}


function hide() {
  chainView.visible = false;
  guideLetter.visible = false;
  for (var i = 0; i < users.length; i++) { users[i].line.visible = false; }
  isActive = false;
}

function show() {
  chainView.visible = true;
  guideLetter.visible = true;
  for (var i = 0; i < users.length; i++) { users[i].line.visible = true; }
  isActive = true;
}

function validateLetter() {

  createLetterThumb();

  currLetter++;
  if(currLetter >= words[currWord].length) {
    
    hide();

    setTimeout(function(){
      for (var i = 0; i < letterRasters.length; i++) {
        var raster = letterRasters[i];
        TweenMax.to(raster.position, 1, {
          y:paper.view.center.y,
          delay:i*0.1,
          ease:Sine.easeInOut,
          onComplete:function(e){
            TweenMax.to(this.target._owner.position, 1, {
              y: paper.view.bounds.height+100,
              delay: 1 + i*0.1,
              ease: Sine.easeInOut
            });
          }
        });
      }
      letterRasters.splice(0, letterRasters.length);
    }, 2000);

    setTimeout(function(){
      show();
      wordComplete();
    }, 6000);
  } else {
    setCurrLetter();
  }
}

function wordComplete() {

  do {
    newWord = Math.floor(Math.random()*words.length);
  } while (newWord == currWord);
  currWord = newWord;
  currLetter = 0;
  setCurrLetter();
}

function createLetterThumb() {

  var raster = group.rasterize();
  var imageData = raster.getImageData(raster.size);

  letterRasters.push(raster);
  raster.transformContent = false;

  var letterScale = 0.2;
  var dx = raster.bounds.width * 0.5 * letterScale;
  var dy = raster.bounds.height * 0.5 * letterScale;
  var margin = 20;

  dx += (raster.bounds.width * letterScale + margin) * currLetter;

  TweenMax.to(raster.position, 1, {
    x:dx+margin,
    y:dy+margin,
    ease:Sine.easeInOut,
    onUpdate:function(){
      raster.scaling = 1 - this.ratio*(1-letterScale);
    }
  });
}

/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/

function update(dt) {

  var i, lpos, rpos, segs;

  for(i=0; i<users.length; i++) {

    lpos = users[i].leftHand.position;
    rpos = users[i].rightHand.position;
    segs = users[i].line.segments;

    segs[0].point.x = lpos.x;
    segs[0].point.y = lpos.y;
    segs[1].point.x = rpos.x;
    segs[1].point.y = rpos.y;
  }

  var chainBodies = chain.bridge.bodies;
  var f;
  for (i = 0; i < chainBodies.length; i++) {
    
    f = chainBodies[i].initPos.subtract(chainBodies[i].position);
    f = f.normalize().multiply(0.0005);
    
    Matter.Body.applyForce(chainBodies[i], chainBodies[i].position, f);
    chainView.segments[i].point.x = chainBodies[i].position.x;
    chainView.segments[i].point.y = chainBodies[i].position.y;
  }
  chainView.smooth();

  physics.update();
}


/* 
  called everytime a new user enters -
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  var lineThickness = 30;
  var line = new paper.Path.Line({
    strokeColor : 'white',
    strokeWidth : lineThickness,
    strokeCap : 'round'
  });
  line.visible = isActive;
  group.addChild(line);
  var user = {
    bodyId    : id,
    fixture   : physics.addHandLineRect(line, leftHand, rightHand, lineThickness*0.8),
    leftHand  : leftHand,
    rightHand : rightHand,
    line : line
  };
  users.push(user);
}


/* 
  called everytime a user leaves -
  this is usually where you remove the user's line
*/
function onUserOut(id) {

  for(var i=0; i<users.length; i++) {

    if (users[i].bodyId == id) {
      users[i].line.remove();
      physics.remove(users[i].fixture);
      users.splice(i, 1);
      break;
    }
  }
}