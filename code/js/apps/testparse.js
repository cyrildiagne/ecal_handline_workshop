var app   = null,
    users = [],
    level = null;


/* 
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'Test Parse',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });

  importSVG('assets/testparse/level.svg');
}

function importSVG(file) {

  paper.project.importSVG(file, function(item){
    level = new paper.Symbol(item);
    parse(level.definition);
    var levelItem = level.place();
    levelItem.position = paper.view.center;
  });
}

function parse(item) {

  var fc = item.fillColor;

  if (fc) {
    window.fc = fc;
    console.log(fc.toCSS());
    if(fc.toCSS() == 'rgb(1,0,0)') {
      item.visible = false;
    } else {
      fc.red = 1;
      item.rotation = 45;
    }
  }
  else if (item.strokeColor && !item.children) {
    if(item.type == "circle") {
    } else {
      console.log(item.segments[0].point.x);
      console.log(item.segments[1].point.x);
    }
  }
  else {
    for (var i = 0; i < item.children.length; i++) {
      parse( item.children[i] );
    }
  }
}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  var lpos, rpos, segs;

  for(var i=0; i<users.length; i++) {

    // update the position of each line with the new hands positions
    
    leftHandPos  = users[i].leftHand.position;
    rightHandPos = users[i].rightHand.position;
    lineSegments = users[i].line.segments;

    lineSegments[0].point.x = leftHandPos.x;
    lineSegments[0].point.y = leftHandPos.y;
    lineSegments[1].point.x = rightHandPos.x;
    lineSegments[1].point.y = rightHandPos.y;
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
  line.sendToBack();

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