var app   = null,
    users = [];


/* 
  called once at initialisation
*/
function setup() {
  
  app = new HL.App();
  app.setup({
    projectName : 'Default',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });
}


/* 
  called when the window is resized
  w & h are the new canvas dimensions
*/
function resize(w, h) {

}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  var lpos, rpos, segs;

  for(var i=0; i<users.length; i++) {

    lpos = users[i].leftHand.position;
    rpos = users[i].rightHand.position;
    segs = users[i].line.segments;

    segs[0].point.x = lpos.x;
    segs[0].point.y = lpos.y;
    segs[1].point.x = rpos.x;
    segs[1].point.y = rpos.y;
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
  }
*/
function onUserIn(id, leftHand, rightHand) {

  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    line : new paper.Path.Line({
      strokeColor : HL.colors.light,
      strokeWidth : 20
    })
  };

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