var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    chain = null,
    constraints = null,
    numNodesPerChain = 6,
    chainNodesRadius = 20;

var sideBall = true;
var radius = 30;


/* 
  called once at initialisation
*/
function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'Balls',
    author1 : 'Mylène Dreyer',
    author2 : 'Bérénice de Casteja'
  });
  app.usersOffset.y = 200;

  setupPhysics();
  addWall(paper.view.bounds.height*0.75);
  addWall(-paper.view.bounds.height*0.25);
}


function setupPhysics() {

  physics = new HL.Physics();
  physics.addFloor();
  physics.addLeftWall();
  physics.addRightWall();
  physics.addUpWall();
  

}



// HL.Physics.prototype.addCircle = function(view, radius, opt) {
//   opt = opt || { restitution: 0.7, friction : 0.0 };
//   var circle = Matter.Bodies.circle(view.position.x, view.position.y, radius, opt, 10);
//   circle.view = view;
//   Matter.World.add(this.engine.world, circle);
//   this.bodies.push({
//     body: circle,
//     view: view
//   });
//   return circle;
// };

function createNewBridge(leftPos, rightPos) {

  var gpId = Matter.Body.nextGroupId();
  var bridge = Matter.Composites.stack(leftPos.x, leftPos.y, numNodesPerChain, 1, 0, 0, function(x, y, column, row) {
      return Matter.Bodies.circle(x, y, chainNodesRadius, { groupId: gpId, friction:0, restitution:1 });
  });
  
  Matter.Composites.chain(bridge, 0.5, 0, -0.5, 0, { stiffness: 0.8 });

  var lastBody = bridge.bodies[bridge.bodies.length-1];
  var cLeft  = Matter.Constraint.create({ stiffness:1, pointA: leftPos,  bodyB: bridge.bodies[0], pointB: { x: 0, y: 0 } });
  var cRight = Matter.Constraint.create({ stiffness:1, pointA: lastBody.position, bodyB: lastBody, pointB: { x: 0, y: 0 } });
  
  Matter.World.add(physics.engine.world, [
      bridge,
      cLeft,
      cRight
  ]);

  return {bridge:bridge, constraintLeft:cLeft, constraintRight:cRight};
}



function addWall(poswall) {

  var wRect = 100;
  //var hRect = 30;

  var hRect = paper.view.bounds.height/1.5;
  var pos = new paper.Point(paper.view.bounds.width/2, poswall);
  var rview = new paper.Path.Rectangle({
    position : pos,
    fillColor : 'white',
    width : wRect,
    height : hRect
  });
  physics.addRectangle(rview, wRect+radius, hRect, {restitution:0.9, friction:0, isStatic: true})


}

function addBall() {

  
  var posx;

  if (sideBall == true){
    posx = paper.view.bounds.width * 0.25;
    sideBall = false;
    //console.log("gauche");

  }else if (sideBall == false){
    posx = paper.view.bounds.width * 0.75;
    sideBall = true;

    //console.log("droite");

  }

  var pos = new paper.Point(posx, paper.view.bounds.height-(radius/2)-50);
  //var pos = new paper.Point(paper.view.bounds.width/2, paper.view.bounds.height/2);

  var bview = new paper.Path.Circle({
    position : pos,
    //fillColor : 'royalblue',
    //fillColor : '#3FA2DB',
    fillColor : '#'+Math.floor(Math.random()*16777215).toString(16),
    radius : radius + 15
  });
  bview.fillColor.alpha = Math.random() + 0.2;
    balls.push({
    view    : bview,
    fixture : physics.addCircle(bview, radius, {restitution:0.9, friction:0, density:0.001})
  });

}


function removeBall(ball) {

  ball.view.remove();
  physics.remove(ball.fixture);
  balls.splice(balls.indexOf(ball),1);
}



function addSquare() {

  var wSquare = 100;
  var hSquare = 100
  var pos = new paper.Point(Math.random()*paper.view.bounds.width, paper.view.bounds.height-50);
  //var pos = new paper.Point(paper.view.bounds.width/2, paper.view.bounds.height/2);

  var sview = new paper.Path.Rectangle({
    position : pos,
    fillColor : 'royalblue',
    //fillColor : '#'+Math.floor(Math.random()*16777215).toString(16),
    width : wSquare,
    height: hSquare
  });
  sview.fillColor.alpha = Math.random();
  balls.push({
    view    : sview,
    fixture : physics.addRectangle(sview, wSquare, hSquare, {restitution:0.9, friction:0})
  });

}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

var i, bridge;

  for(i=0; i<users.length; i++) {

    bridge = users[i].bridge;

    bridge.constraintLeft.pointA.x  = users[i].leftHand.position.x;
    bridge.constraintLeft.pointA.y  = users[i].leftHand.position.y;
    bridge.constraintRight.pointA.x = users[i].rightHand.position.x;
    bridge.constraintRight.pointA.y = users[i].rightHand.position.y;

    var segs = users[i].line.segments;
    var nodes = bridge.bridge.bodies;
    segs[0].point = users[i].leftHand.position;
    var j;
    for(j=0; j<nodes.length; j++){
      segs[j+1].point = nodes[j].position;
    }
    segs[j+1].point = users[i].rightHand.position;
    users[i].line.smooth();
  }




  physics.update();

  if((timeSinceLastBall += dt) > 1000 && balls.length < 10) {
    addBall();
    
    timeSinceLastBall = 0;

  }
}


/* 
  called everytime a new user enters -
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  
  var lineThickness = chainNodesRadius;
  var line = new paper.Path({
    strokeColor : HL.colors.light,
    strokeWidth : lineThickness*2,
    strokeJoin : 'round'
  });
  line.add([0,0]);
  for (var i = 0; i < numNodesPerChain; i++) {
    line.add([0,0]);
  }
  line.add([0,0]);
  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    line : line,
    bridge : createNewBridge(leftHand.position, rightHand.position)
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
      physics.remove(users[i].bridge.bridge);
      physics.remove(users[i].bridge.constraintLeft);
      physics.remove(users[i].bridge.constraintRight);
      users.splice(i, 1);
      break;
    }
  }
}