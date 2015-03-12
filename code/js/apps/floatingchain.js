var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    bg, group;

var chain, chainView,
    numNodesPerChain = 15,
    chainNodesRadius = 25;

/* 
  called once at initialisation
*/
function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'LOVE',
    author1 : 'Lina Berjaner',
    author2 : 'Pablo Perez'
  });

  setupPhysics();

  group = new paper.Group();
  group.transformContent = false;

  chain = addChain(new paper.Point(50,400), new paper.Point(500,400));
  chainView = new paper.Path({
    strokeWidth : chainNodesRadius,
    strokeColor : 'white',
    strokeJoin : 'round'
  });
  group.addChild(chainView);

  // init our chainview path
  for(var k=0;k<chain.bodies.length;k++){
    chainView.add([0,0]);
  }

  ocrLoop();
}

function setupPhysics() {

  physics = new HL.Physics();
  physics.engine.world.gravity.y = 0.0;
  physics.addFloor();
}


function addChain(leftPos, rightPos) {

  var gpId = Matter.Body.nextGroupId();
  var bridge = Matter.Composites.stack(leftPos.x, leftPos.y, numNodesPerChain, 1, 0, 0, function(x, y, column, row) {
      return Matter.Bodies.circle(x, y, chainNodesRadius, { groupId: gpId, friction:0, restitution:1, frictionAir:1 });
  });
  
  Matter.Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.8 });

  var lastBody = bridge.bodies[bridge.bodies.length-1];
  
  Matter.World.add(physics.engine.world, [
      bridge,
  ]);

  return bridge;
}


function addBall() {

  var radius = 20;
  var pos = new paper.Point((Math.random()-0.5)*paper.view.bounds.width/2, (Math.random()-0.5)*paper.view.bounds.height/2);
  pos = pos.add(paper.view.center);
  var bview = new paper.Path.Circle({
    position : pos,
    fillColor : 'white',
    radius : radius+10
  });

  balls.push({
    view    : bview,
    fixture : physics.addCircle(bview, radius, {restitution:0, friction:0, frictionAir:1 })
  });
}

function removeBall(ball) {

  ball.view.remove();
  physics.remove(ball.fixture);
  balls.splice(balls.indexOf(ball),1);
}

function ocrLoop(){
  var ocrText = ocr();
  document.getElementById('projectTitle').innerHTML = ocrText;
  setTimeout(ocrLoop, 1500);
}


var rasterToRemove;

function ocr(){
  
  if(group.bounds.height === 0 || group.bounds.width === 0) {
    return;
  }

  chainView.strokeColor = 'black';

  var raster = group.rasterize(20);
  
  var imageData = raster.getImageData(raster.size);
  var ocrText = OCRAD(imageData);
  
  chainView.strokeColor = 'white';

  raster.scaling = 1;
  if (rasterToRemove) rasterToRemove.remove();

  rasterToRemove = raster;
  return ocrText;
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

  var chainBodies = chain.bodies;
  for (i = 0; i < chainBodies.length; i++) {
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

  var lineThickness = 20;
  var line = new paper.Path.Line({
    strokeColor : 'blue',
    strokeWidth : lineThickness
  });
  var user = {
    bodyId    : id,
    fixture   : physics.addHandLineRect(line, leftHand, rightHand, lineThickness*2),
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