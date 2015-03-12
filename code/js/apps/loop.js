var app   = null,
    users = [],
    ghosts = [];


/* 
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'Default',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });
}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  var lpos, rpos, segs;

  for(var i=0; i<users.length; i++) {

    // GHOST RECORD

    var g = users[i].ghost;

    // if our ghost has less than 400 frames
    if(g.history.length < 120) {

      // add a new frame
      g.history.push({
        left : users[i].leftHand.position.clone(),  // clone main gauche
        right : users[i].rightHand.position.clone() // clone main droite
      });
    }
  }

  // PLAYBACK RECORD

  for (var j=0; j<ghosts.length; j++) {

    var gh = ghosts[j];
    gh.currFrame++;

    if (gh.currFrame >= gh.history.length) {
      // replay complete
      gh.currFrame = 0;
      var firstFrame = gh.history[0];
      var lastFrame  = gh.history[gh.history.length-1];
      gh.offsetLeft  = gh.offsetLeft.add( lastFrame.left.subtract(firstFrame.left) );
      gh.offsetRight = gh.offsetRight.add( lastFrame.left.subtract(firstFrame.left) );
    }

    var left = gh.history[gh.currFrame].left.add(gh.offsetLeft);
    var right = gh.history[gh.currFrame].right.add(gh.offsetRight);
    var handsMid = left.add(right).multiply(0.5);
    var handsVec = left.subtract(right);

    loopWallsX(handsMid, gh.offsetLeft);
    loopWallsY(handsMid, gh.offsetRight);

    if(gh.type == 'line') {
      var p0 = handsMid.subtract(handsVec.multiply(0.5));
      var p1 = handsMid.add(handsVec.multiply(0.5));
      gh.shape.segments[0].point = p0;
      gh.shape.segments[1].point = p1;
    } else {
      gh.shape.scaling = handsVec.length / 100 * 0.5;
      gh.shape.position = handsMid;
      gh.shape.rotation = handsVec.getAngle();
    }
  }
}

// p : position
function loopWallsX(p) {
  var offset = 100;
  while(p.x < -offset) {
    p.x += (paper.view.bounds.width+offset);
  }
  p.x = p.x % (paper.view.bounds.width+offset);
}

function loopWallsY(p) {
  var offset = 100;
  while(p.y < offset) {
    p.y += (paper.view.bounds.height+offset);
  }
  p.y = p.y % (paper.view.bounds.height+offset);
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

  var shape=null, colors=null, type = '';
  var random = Math.random()*2;

  if(random < 1) {
    type = 'triangle';
    shape = new paper.Path.RegularPolygon(new paper.Point(0, 0), 3, 100);
    // get a random color
    colors = ['red', 'blue', 'green'];
    shape.fillColor = colors[Math.floor(Math.random()*colors.length)];
  }
  else {
    type = 'line';
    shape = new paper.Path.Line({ strokeColor : 'white', strokeWidth : 5 });
    // get a random color
    colors = ['yellow', 'cyan', 'magenta'];
    shape.strokeColor = colors[Math.floor(Math.random()*colors.length)];
  }
  shape.transformContent = false;

  

  // create our ghost
  var ghost = {
    shape : shape,
    type : type,
    history : [],
    currFrame : -1,
    offsetLeft  : new paper.Point(),
    offsetRight : new paper.Point()
  };
  // and add it to our ghost table
  ghosts.push(ghost);

  // create an object defining our user's properties
  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    ghost     : ghost
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
      users.splice(i, 1);
      break;
    }
  }
}