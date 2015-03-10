var app   = null,
    users = [],
    obstacles = [],
    ball = null,
    velocity = null;


/*
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'Ball Bounce',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });

  setupBall();
  setupObstacles();
}


function setupBall() {
  ball = new paper.Path.Circle({
    radius : 10,
    position : [0, paper.view.center.y],
    fillColor : 'red'
  });

  velocity = new paper.Point(5 + Math.random()*10, (Math.random()-0.5)*10);
}

function setupObstacles() {
  for (var i = 0; i < 5; i++) {
    from = new paper.Point(Math.random()*stageWidth, Math.random()*stageHeight);
    to = new paper.Point(Math.random()*stageWidth, Math.random()*stageHeight);
    addObstacle(from, to, 'blue');
  }
}

function addObstacle(from, to, color) {
  obstacle = new paper.Path.Line({
    from : from,
    to : to,
    strokeColor : color,
    strokeWidth : 10
  });
  obstacles.push(obstacle);
}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  var lpos, rpos, segs;

  for(var i=0; i<users.length; i++) {

    // update the position of each line with the new hands positions
    
    var leftHandPos  = users[i].leftHand.position;
    var rightHandPos = users[i].rightHand.position;
    var lineSegments = users[i].line.segments;

    lineSegments[0].point.x = leftHandPos.x;
    lineSegments[0].point.y = leftHandPos.y;
    lineSegments[1].point.x = rightHandPos.x;
    lineSegments[1].point.y = rightHandPos.y;
  }

  updateBall();
}


function updateBall() {

  ball.position = ball.position.add(velocity);

  var obstacle, bCollide;

  for (var i = 0; i < obstacles.length; i++) {
    
    obstacle = obstacles[i];

    bCollide = checkCollide(ball.position, obstacle.segments[0].point, obstacle.segments[1].point);
    if(bCollide) {
      bounce(ball.position, obstacle.segments[0].point, obstacle.segments[1].point);
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
    strokeColor : 'white',
    strokeWidth : 5
  });

  // create an object defining our user's properties
  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    line      : line
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