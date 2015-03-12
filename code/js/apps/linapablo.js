var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    ballsGroup;

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

  ballsGroup = new paper.Group();
  var particules = 100;

  for (var i = 0; i < particules; i++) {
    addBall();
    if(balls.length > particules) {
      removeBall(balls[0]);
    }
    
  }

  ocrLoop();
}


function setupPhysics() {

  physics = new HL.Physics();
  physics.engine.world.gravity.y = 0.0;
  physics.addFloor();
}


function addBall() {

  var radius = 5;
  var pos = new paper.Point((Math.random()-0.5)*paper.view.bounds.width/2, (Math.random()-0.5)*paper.view.bounds.height/2);
  pos = pos.add(paper.view.center);
  var bview = new paper.Path.Circle({
    position : pos,
    fillColor : 'white',
    radius : radius+10
  });

  ballsGroup.addChild(bview);

  balls.push({
    view    : bview,
    fixture : physics.addCircle(bview, radius, {restitution:0, friction:1, frictionAir:1 })
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
  setTimeout(ocrLoop,1500);

}

var colors = ['red', 'green', 'blue', 'yellow', 'purple', 'gray', 'cyan'];
var index = 0;

function ocr(){
  var raster = ballsGroup.rasterize(75);
  
  for (var i = 0; i < balls.length; i++)
  {
    var ball = balls[i];
    ball.view.fillColor = colors[index];
    index++;
  }

  var imageData = raster.createImageData(raster.size);
  var ocrText = OCRAD(imageData);

  //raster.visible = false;
  for (var i = 0; i < balls.length; i++)
  {
    var ball = balls[i];
    ball.view.fillColor = 'white';
    index++;
  }

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

  physics.update();

  for (i = 0; i < balls.length; i++) {
    // balls[i].fixture.velocity.x = 0;
    // balls[i].fixture.velocity.y = 0;
    // balls[i].fixture.appyForce()
    // balls[i].fixture.inertia = 0.001;
    // balls[i].fixture.speed = 0.001;
    // console.log(balls[i]);
  }

  // Matter.Body.applyForce(balls[i].fixture, balls[i].fixture.position, force);

  //if((timeSinceLastBall += dt) > 500) {
  // for (var i = 0; i < 10; i++) {
  //   addBall();
  //   if(balls.length > 10) {
  //     removeBall(balls[0]);
  //   }
  //   timeSinceLastBall = 0;
  // }

}


/* 
  called everytime a new user enters -
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  var lineThickness = 15;
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