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

    // update the position of each line with the new hands positions
    
    var leftHandPos  = users[i].leftHand.position;
    var rightHandPos = users[i].rightHand.position;
    var lineSegments = users[i].line.segments;

    // GHOST RECORD
    var g = users[i].ghost;
    // if our ghost has less than 40 frames
    if(g.history.length < 200) {
      // add a new frame
      g.history.push({
        left : users[i].leftHand.position.clone(), // clone main gauche
        right : users[i].rightHand.position.clone() // clone main droite
      });
    }

    lineSegments[0].point.x = leftHandPos.x;
    lineSegments[0].point.y = leftHandPos.y;
    lineSegments[1].point.x = rightHandPos.x;
    lineSegments[1].point.y = rightHandPos.y;
  }

  // PLAYBACK RECORD
  for (var j=0; j<ghosts.length; j++) {
    var gh = ghosts[j];
    gh.currFrame++;
    if (gh.currFrame >= gh.history.length) {
      gh.currFrame = 0;
    }
    gh.line.segments[0].point = gh.history[gh.currFrame].left;
    gh.line.segments[1].point = gh.history[gh.currFrame].right;
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

  // create our ghost
  var ghost = {
    line : line.clone(),
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
    line      : line,
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
      users[i].line.remove();
      users.splice(i, 1);
      break;
    }
  }
}