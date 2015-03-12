var app   = null,
    users = [];

var physics = null,
    balls = [],
    timeSinceLastBall = 0,
    squares = [];

var sideBall = true;


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



function addWall(poswall) {

  var wRect = 30;
  //var hRect = 30;

  var hRect = paper.view.bounds.height/1.5;
  var pos = new paper.Point(paper.view.bounds.width/2, poswall);
  var rview = new paper.Path.Rectangle({
    position : pos,
    fillColor : 'white',
    width : wRect,
    height : hRect
  });
  physics.addRectangle(rview, wRect+20, hRect, {restitution:0.9, friction:0, isStatic: true})


}

function addBall() {

  var radius = 30;
  var posx;
  


  if (sideBall == true){
    posx = paper.view.bounds.width * 0.25;
    sideBall = false;
    console.log("gauche");

  }else if (sideBall == false){
    posx = paper.view.bounds.width * 0.75;
    sideBall = true;

    console.log("droite");

  }


  var pos = new paper.Point(posx, paper.view.bounds.height-(radius/2)-50);
  //var pos = new paper.Point(paper.view.bounds.width/2, paper.view.bounds.height/2);

  var bview = new paper.Path.Circle({
    position : pos,
    fillColor : 'royalblue',
    //fillColor : '#'+Math.floor(Math.random()*16777215).toString(16),

    radius : radius + 15
  });
  bview.fillColor.alpha = Math.random() * 0.8;
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

  if((timeSinceLastBall += dt) > 100 && balls.length < 100) {
    addBall();
    
    timeSinceLastBall = 0;

  }
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