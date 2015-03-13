var app   = null,
    users = [],
    ghosts = [];

var filish = ['assets/loop/1.svg','assets/loop/2.svg','assets/loop/3.svg','assets/loop/4.svg','assets/loop/5.svg',
              'assets/loop/6.svg','assets/loop/7.svg','assets/loop/8.svg','assets/loop/9.svg','assets/loop/10.svg',
              'assets/loop/11.svg','assets/loop/12.svg','assets/loop/13.svg','assets/loop/14.svg','assets/loop/15.svg',
              'assets/loop/16.svg','assets/loop/17.svg','assets/loop/18.svg','assets/loop/19.svg','assets/loop/20.svg',
              'assets/loop/21.svg','assets/loop/22.svg','assets/loop/23.svg','assets/loop/24.svg','assets/loop/25.svg'];

/* 
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'loop',
    author1 : 'Benjamin',
    author2 : 'Alexia '
  });
}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  var lpos, rpos, segs, user;

  for(var i=0; i<users.length; i++) {
    user = users[i];

    // if we're not recording
    if (!user.isRecording) {
      if(user.leftHand.state == "closed" || user.rightHand.state == "closed") {
        //console.log(user.bodyId + ' about to record');
        user.isRecording = true;
        user.ghost = null;
        var usingFilish = filish[Math.floor(Math.random()*filish.length)];
        importSVG(user, usingFilish, function(item, _user){
          //item.remove();
          _user.ghost = getNewGhost(item);
          //console.log(_user.bodyId + ' start record');
        });
      }
    }
    // otherwise add new frame
    else if (user.ghost) {
      var g = user.ghost;
      //console.log(g.history);
      // if our ghost has less than 400 frames
      if(g.history) {

        if(g.history.length < 120) {
          // add a new frame
          //console.log(user.bodyId + ' add frame');
          g.history.push({
            left : user.leftHand.position.clone(),  // clone main gauche
            right : user.rightHand.position.clone() // clone main droite
          });
        } else {
          user.isRecording = false;
          //console.log(user.bodyId + ' recording ended');
        }

      }
    }
  }

  while (ghosts.length > 18) {
    var ghost = ghosts[0];
    ghost.item.remove();
    ghosts.splice(0, 1);
  }

  // GHOST PLAYBACK

  for (var j=0; j<ghosts.length; j++) {

    var gh = ghosts[j];

    //console.log(gh.history);
    if(!gh.history.length) return;

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

    // if(gh.type == 'line') {
    //   var p0 = handsMid.subtract(handsVec.multiply(0.5));
    //   var p1 = handsMid.add(handsVec.multiply(0.5));
    //   gh.item.segments[0].point = p0;
    //   gh.item.segments[1].point = p1;
    // } else {
      //gh.item.scale((handsVec.length / 100 * 0.3), 1 );

      gh.item.rotation = 0;
      gh.item.scaling = new paper.Point((handsVec.length / 100 * 0.5), 1 );

      //console.log('add');
      gh.item.position = handsMid;
      gh.item.rotation = handsVec.getAngle();
    //}
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

  //console.log('new user');
  
  // var usingFilish = filish[Math.floor(Math.random()*filish.length)];

  // importSVG(usingFilish, function(item){
  //   //console.log(usingFilish);
  //   item.visible = false;

    // create an object defining our user's properties
    var user = {
      bodyId    : id,
      leftHand  : leftHand,
      rightHand : rightHand,
      //item      : item,
      isRecording  : false
    };
    // and add it to our users table
    users.push(user);
  // });
}


function getNewGhost(item) {
  var ghost = {
    item : item,
    history : [],
    currFrame : -1,
    offsetLeft  : new paper.Point(),
    offsetRight : new paper.Point()
  };
  //ghost.item.visible = true;
  // and add it to our ghost table
  ghosts.push(ghost);
  return ghost;
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


function importSVG(user, file, callback){

  paper.project.importSVG(file, function(item){
    var testy = new paper.Symbol(item);
    var testyItem = testy.place();
    item.rotation = 90;
    // testyItem.position = paper.view.center;
    //console.log(file + ' loaded');
    callback(testyItem,user);
  });
}