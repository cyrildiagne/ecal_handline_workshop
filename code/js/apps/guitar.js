var app   = null,
    users = [],
    triggers = [];


/* 
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'Guitar',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });

  // setup our level
  setupTriggers();
}


/* 
  called about 60 times per seconds
  dt : deltaTime since last frames (in milliseconds);
*/
function update(dt) {

  updateLines();

  updateGuitar();
}

function updateLines() {
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


function updateGuitar() {

  var i, j, trigger, user, d;
  var leftPos, rightPos;

  for (i = 0; i < triggers.length; i++) {

    trigger = triggers[i];

    for (j = 0; j < users.length; j++) {

      user = users[j];
      leftPos = user.leftHand.position;
      rightPos = user.rightHand.position;

      d = HL.geom.distToSegmentSquared(trigger.position, leftPos, rightPos);

      if (d < 30 && !trigger.isIdle) {
        connectTrigger(trigger, user);
      }
    }
  }
}

function connectTrigger(t, user) {
  
  user.audio.sound.play();

  t.fillColor = 'red';
  t.isIdle = true;
  setTimeout(function(){
    t.fillColor = 'white';
    t.isIdle = false;
  }, 200);
}

/* 
  called everytime a new user enters
  this is usually where you create a new line
  - leftHand and rightHand are objects structured as :
  {
    position : paper.Point,
    velocity : paper.Point
    joint : ks.Joint
    state : "unknown", "open" or "closed"
  }
*/
function onUserIn(id, leftHand, rightHand) {

  // create a line with paperjs
  var line = new paper.Path.Line({
    strokeColor : 'white',
    strokeWidth : 5
  });

  // create an object defining our user's properties
  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    line      : line,
    audio     : createAudio()
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


// ----


function setupTriggers() {

  var trigger;
  for (var i = 0; i < 25; i++) {
    var px = Math.random()*stageWidth;
    var py = Math.random()*stageHeight;
    trigger = new paper.Path.Circle({
      radius : 5,
      center : new paper.Point(px, py),
      fillColor : 'white'
    });
    triggers.push(trigger);
  }
}


function createAudio() {

  // create the sound effect
  var effect = new HL.sound.tuna.Phaser({
    rate: 1 + Math.random() * 5,        // 0.01 to 8 is a decent range, but higher values are possible
    depth: 0.8,       // 0 to 1
    feedback: 0.9,    // 0 to 1+
    stereoPhase: Math.random()*180, // 0 to 180
    baseModulationFrequency: 500 + Math.random()*1000, //500 to 1500
    bypass: 0
  });
  effect.connect(HL.sound.context.destination);

  // load the sound
  var sound = new Howl({
    urls: ['assets/guitar/3rd_String_G.mp3',
           'assets/guitar/3rd_String_G.ogg']
  });
  sound._audioNode[0].connect(effect.input);

  // return an object containing the sound and the effect
  return {
    sound : sound,
    effect : effect
  };
}