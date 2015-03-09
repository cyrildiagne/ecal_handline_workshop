var app   = null,
    lines = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0;

/* 
  called once at initialisation
*/
function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'Balls',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });

  setupPhysics();
}


function setupPhysics() {

  physics = new HL.Physics();
  physics.addFloor();
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

  for(i=0; i<lines.length; i++) {

    lpos = lines[i].leftHand.position;
    rpos = lines[i].rightHand.position;
    segs = lines[i].path.segments;

    segs[0].point.x = lpos.x;
    segs[0].point.y = lpos.y;
    segs[1].point.x = rpos.x;
    segs[1].point.y = rpos.y;
  }

  physics.update();

  if((timeSinceLastBall += dt) > 500) {
    addBall();
    if(balls.length > 5) {
      removeBall(balls[0]);
    }
    timeSinceLastBall = 0;
  }
}


/* 
  called everytime a new user enters -
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  var lineThickness = 30;
  var path = new paper.Path.Line({
    strokeColor : HL.colors.light,
    strokeWidth : lineThickness
  });
  var line = {
    bodyId    : id,
    fixture   : physics.addHandLineRect(path, leftHand, rightHand, lineThickness),
    leftHand  : leftHand,
    rightHand : rightHand,
    path : path
  };
  lines.push(line);
}


/* 
  called everytime a user leaves -
  this is usually where you remove the user's line
*/
function onUserOut(id) {

  for(var i=0; i<lines.length; i++) {

    if (lines[i].bodyId == id) {
      lines[i].path.remove();
      physics.remove(lines[i].fixture);
      lines.splice(i, 1);
      break;
    }
  }
}