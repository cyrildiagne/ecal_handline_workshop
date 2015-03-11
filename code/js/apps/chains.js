var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    chain = null;

/* 
  called once at initialisation
*/
function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'Chains',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });

  setupPhysics();
  addChain();
}


function setupPhysics() {

  physics = new HL.Physics();
  physics.addFloor();
}

function addChain() {
  var group = Matter.Body.nextGroupId();
  
  chain = Matter.Composites.stack(500, 200, 5, 2, 10, 10, function(x, y, column, row) {
      return Matter.Bodies.circle(x, y, 20, { collisionFilter: { group: group } });
      // return Matter.Bodies.circle(x, y, 20);
  });
  
  Matter.Composites.chain(chain, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2 });
  Matter.Composite.add(chain, Matter.Constraint.create({
      bodyB: chain.bodies[0],
      pointB: { x: 20, y: 0 },
      pointA: { x: 500, y: 150 },
      stiffness: 0.5
  }));
  
  Matter.World.add(physics.engine.world, chain);
}


function addBall() {

  var radius = 40;
  var pos = new paper.Point(Math.random()*paper.view.bounds.width, 0);
  var bview = new paper.Path.Circle({
    position : pos,
    fillColor : 'royalblue',
    radius : radius
  });
  balls.push({
    view    : bview,
    fixture : physics.addCircle(bview, radius, {restitution:0.9, friction:0})
  });
}

function removeBall(ball) {

  ball.view.remove();
  physics.remove(ball.fixture);
  balls.splice(balls.indexOf(ball),1);
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

  physics.update();

  if((timeSinceLastBall += dt) > 500) {
    // addBall();
    if(balls.length > 5) {
      removeBall(balls[0]);
    }
    timeSinceLastBall = 0;
  }

  for (i = 0; i < chain.bodies.length; i++) {
    var p = chain.bodies[i].position;
    app.drawDebugCircle(p, 20, 'white');
  }
  // console.log(chain);
}


/* 
  called everytime a new user enters -
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  var lineThickness = 30;
  var line = new paper.Path.Line({
    strokeColor : HL.colors.light,
    strokeWidth : lineThickness
  });
  var user = {
    bodyId    : id,
    fixture   : physics.addHandLineRect(line, leftHand, rightHand, lineThickness),
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