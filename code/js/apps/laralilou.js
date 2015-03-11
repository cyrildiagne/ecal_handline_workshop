var app   = null,
    users = [],
    levelItem = null,
    seg = [];


/* 
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : '..',
    author1 : 'Julie-Lou Bellenot',
    author2 : 'Lara Défayes'
  });

importSVG('assets/testparse/level2.svg');
}

function importSVG(file){

  paper.project.importSVG(file, function(item){
    level = new paper.Symbol(item);
    levelItem = level.place();
    // levelItem.pivot = new paper.Point(0,0);
    parse(level.definition);
    levelItem.position = paper.view.center;

  });
}
function parse(item){

  var fc = item.fillColor;
  var sc = item.strokeColor;

 // transforme tous les fillColor en blanc
  if (fc){
    window.fc = fc;
    console.log(fc.toCSS());
    
      item.fillColor = 'white';
   
  } 
  
  else if (item.strokeColor){
    window.sc = sc;
    console.log(sc.toCSS());
    // transforme tous les stroke en cyan
    item.strokeColor = 'cyan';
    var hb = new paper.Point(levelItem.bounds.width*0.5, levelItem.bounds.height*0.5);
    var trait = {
      from : item.segments[0].point.add(paper.view.center).subtract(hb),
      to : item.segments[1].point.add(paper.view.center).subtract(hb)
    };
    seg.push(trait);
    item.visible = false;
  }
  else {
    for (var i = 0; i < item.children.length; i++) {
      parse(item.children[i]);

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

  // pour tous les utilisateurs
for (var i = users.length - 1; i >= 0; i--) {
  for (var j = seg.length - 1; j >= 0; j--) {

    var dg0 = leftHandPos - item.segments[0].point;
    var dd1 =  rightHandPos - item.segments[1].point;
    var dg1 = leftHandPos - item.segments[0].point;
    var dd0 = rightHandPos - item.segments[1].point;
  }
}
    // pour tous les traits (dans tableau seg)

        // recuperer la distance 'dg0' entre la main gauche et le segment 0 du trait
        // recuperer la distance 'dd1' entre la main droite et le segment 1 du trait

        // recuperer la distance 'dd0' entre la main droite et le segment 0 du trait
        // recuperer la distance 'dg1' entre la main gauche et le segment 1 du trait

        // si dg0+dd1 < distance max  OU  dd0+dg1 < distance max

            // alors on ajoute le trait

  for (var i = seg.length - 1; i >= 0; i--) {
    app.drawDebugLine(seg[i].from, seg[i].to, 'red');
    //console.log(seg[i].from);
  };
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