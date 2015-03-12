var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    bg, group;

var chain, chainView,
    numNodesPerChain = 20,
    chainNodesRadius = 20;

// var debugCanvas = $('<canvas>').appendTo($('body'))[0];
// console.log(debugCanvas);
// debugCanvas.style.position = 'absolute';
// debugCanvas.style.top = '0';
// debugCanvas.style.left = '0';
// debugCanvas.width = 600;
// debugCanvas.height = 300;
// var debugCtx = debugCanvas.getContext('2d');
// debugCtx.clearRect(0,0,600,300);
// debugCtx.fillStyle="white";
// debugCtx.fillRect(0,0,600,300);

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

  bg = new paper.Path.Rectangle({
    fillColor : 'white',
    width  : paper.view.bounds.width,
    height : paper.view.bounds.height
  });
  group.addChild(bg);

  // var pointText = new paper.PointText({
  //   point: paper.view.center.add(new paper.Point(-170, 170)),
  //   content: 'U',
  //   fillColor: 'red',
  //   // fontFamily: 'Courier New',
  //   fontWeight: 'bold',
  //   fontSize: 550
  // });
  // group.addChild(pointText);

  chain = addChain(new paper.Point(50,400), new paper.Point(700,400));
  chainView = new paper.Path({
    strokeWidth : chainNodesRadius*1.5,
    strokeColor : 'white',
    strokeJoin : 'round'
  });
  group.addChild(chainView);

  // init our chainview path
  for(var k=0;k<chain.bridge.bodies.length;k++){
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
      var b = Matter.Bodies.circle(x, y, chainNodesRadius, { groupId: gpId, friction:0, restitution:1, frictionAir:1 });
      b.initPos = {x:x, y:y};
      return b;
  });
  
  Matter.Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.8 });

  var lastBody = bridge.bodies[bridge.bodies.length-1];
  
  Matter.World.add(physics.engine.world, [
      bridge
  ]);

  return {bridge:bridge};
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

  bg.visible = true;
  chainView.strokeColor = 'black';

  var raster = group.rasterize(20);
  
  var imageData = raster.getImageData(raster.size);
  var ocrText = OCRAD(imageData);
  
  // debugCtx.putImageData(imageData, 0, 0);

  bg.visible = false;
  raster.visible = false;
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

  var chainBodies = chain.bridge.bodies;
  var f;
  for (i = 0; i < chainBodies.length; i++) {
    // console.log(chainBodies[i].initPos);
    f = {
      x : (chainBodies[i].initPos.x - chainBodies[i].position.x) * 0.000003,
      y : (chainBodies[i].initPos.y - chainBodies[i].position.y) * 0.000003
    };
    // chainBodies[i].velocity.x = (chainBodies[i].initPos.x - chainBodies[i].position.x) * 0.05;
    // chainBodies[i].velocity.y = (chainBodies[i].initPos.y - chainBodies[i].position.y) * 0.05;
    Matter.Body.applyForce( chainBodies[i], chainBodies[i].position, f);
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
    fixture   : physics.addHandLineRect(line, leftHand, rightHand, lineThickness*1.2),
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