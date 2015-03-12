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
    if(g.history.length < 400) {

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
      gh.currFrame = 0;
    }
    if(gh.type == 'line') {
      gh.shape.segments[0].point = gh.history[gh.currFrame].left;
      gh.shape.segments[1].point = gh.history[gh.currFrame].right;
    } else {
      var left = gh.history[gh.currFrame].left;
      var right = gh.history[gh.currFrame].right;
      var handsMid = left.add(right).multiply(0.5);
      var handsVec = left.subtract(right);
      gh.shape.scaling = handsVec.length / 100 * 0.5;
      gh.shape.position = handsMid;
      gh.shape.rotation = handsVec.getAngle();
    }
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
    currFrame : -1
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