var app   = null,
    view  = null,
    lines = [],
    level = {};

/* 
  called once at initialisation
*/
function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'Shapematch',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });

  view = new paper.Group();

  level = {
    lines : []
  };

  // window.addEventListener('keydown', setOnSpotLevel);
}

function clearLevel() {

  for (var i=0; i<level.lines.length; i++) {
    level.lines[i].remove();
  }
  level.lines = [];
}

function setRandomLevel() {

  clearLevel();

  for (var i=0; i<lines.length; i++) {

    var x = paper.view.bounds.width  * (0.5+(Math.random()-0.5)*0.5),
        y = paper.view.bounds.height * (0.5+(Math.random()-0.5)*0.5),
        angle  = Math.random() * 180,
        length = 20 + Math.random() * 200;
    
    var l = new paper.Path.Line({
      from : new paper.Point(x, y),
      to : new paper.Point(x+length, y),
      strokeColor : "red",
      strokeWidth : 4
    });


    l.rotate(angle);
    level.lines.push(l);
    view.addChild(level.lines[i]);
  }
}

function setOnSpotLevel() {

  clearLevel();

  for (var i=0; i<lines.length; i++) {
    
    var l = new paper.Path.Line({
      from : lines[i].leftHand.position.clone(),
      to : lines[i].rightHand.position.clone(),
      strokeColor : "red",
      strokeWidth : 4
    });

    level.lines.push(l);
    view.addChild(level.lines[i]);
  }
}


function getMatching() {
  
  var i, j, k;

  var closest = [];
  for (i = 0; i < level.lines.length; i++) {
    closest.push(99999);
  }

  var segs, p1_l, p1_r, p2_l, p2_r;
  var dist, d1, d2;

  // for each level line
  for (i = 0; i < level.lines.length; i++) {
    var levelLine = level.lines[i];

    // for each user lines
    for (j = 0; j < lines.length; j++) {

      segs = lines[j].path.segments;

      // get distance of each point to each hand
      p1_l = levelLine.segments[0].point.getDistance(segs[0].point);
      p1_r = levelLine.segments[0].point.getDistance(segs[1].point);
      p2_l = levelLine.segments[1].point.getDistance(segs[0].point);
      p2_r = levelLine.segments[1].point.getDistance(segs[1].point);

      d1 = p1_l+p2_r;
      d2 = p2_l+p1_r;
      dist = (d1 < d2) ? d1 : d2; // which hand is closer to which point
      if (dist < closest[i]){
        closest[i] = dist;
      }
    }
  }

  var total = 0;
  for (i = 0; i < closest.length; i++) {
    total += closest[i];
  }
  total /= closest.length;

  return total;
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

  if(getMatching() < 30) {
    HL.sound.play("shapematch/win.mp3");
    // console.log(lines[0].path.strokeColor.brightness);
    TweenMax.to(lines[0].path.strokeColor, {
      red : 0
    }, 1000);
    // console.log(TweenMax.to);
    setRandomLevel();
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

  setRandomLevel();
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

  setRandomLevel();
}