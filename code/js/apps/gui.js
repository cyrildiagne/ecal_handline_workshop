/* 
  this ap shows how to load and use a list of external libraries
  in this case the gui library dat-gui
*/

var app   = null,
    view  = null,
    lines = [],
    shape = null,
    gui   = null;

/* 
  called once at initialisation
*/
function setup() {
  
  include([
    "https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.5/dat.gui.min.js"

  ], function() {

    app = new HL.App();
    app.setup({
      projectName : 'External Lib',
      author1 : 'Prenom Nom',
      author2 : 'Prenom Nom'
    });

    view = new paper.Group();

    shape = new paper.Path.Circle({
      radius : 20,
      position : paper.view.center,
      fillColor : 'red'
    });
    view.addChild(shape);

    gui = new dat.GUI();
    gui.add(shape.position, 'x', paper.view.center.x-200, paper.view.center.x+200);
    gui.add(shape.position, 'y', paper.view.center.y-200, paper.view.center.y+200);
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

  if (!lines.length) return;

  var lpos, rpos, segs;

  for(var i=0; i<lines.length; i++) {

    lpos = lines[i].leftHand.position;
    rpos = lines[i].rightHand.position;
    segs = lines[i].path.segments;

    segs[0].point.x = lpos.x;
    segs[0].point.y = lpos.y;
    segs[1].point.x = rpos.x;
    segs[1].point.y = rpos.y;
  }

}


/* 
  called everytime a new user enters
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  var line = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    path : new paper.Path.Line({
      strokeColor : HL.colors.light,
      strokeWidth : 20
    })
  };

  view.addChild(line.path);
  lines.push(line);
}


/* 
  called everytime a user leaves
  this is usually where you remove the user's line
*/
function onUserOut(id) {

  for(var i=0; i<lines.length; i++) {

    if (lines[i].bodyId == id) {
      lines[i].path.remove();
      lines.splice(i, 1);
      break;
    }
  }
}