/* 
  this ap shows how to modulate an mp3
  according to the length of the lines
*/

var app   = null,
    users = [],
    soundContext = null,
    tuna = null;

/* 
  called once at initialisation
*/
function setup() {
  
  include([

    "libs/extras/tuna.js"

  ], function() {

    app = new HL.App();
    app.setup({
      projectName : 'External Lib',
      author1 : 'Prenom Nom',
      author2 : 'Prenom Nom'
    });

    setupSound();
  });
}


function setupSound() {

  soundContext = Howler.ctx;
  tuna = new Tuna(soundContext);
}

function addSound() {

  // create our sound effect
  var phaser = new tuna.Phaser({
    rate: 1.2,        // 0.01 to 8 is a decent range, but higher values are possible
    depth: 0.8,       // 0 to 1
    feedback: 0.9,    // 0 to 1+
    stereoPhase: 180, // 0 to 180
    baseModulationFrequency: 500, //500 to 1500
    bypass: 0
  });
  phaser.connect(soundContext.destination);

  // load our sound
  var sound = new Howl({
    urls: ['assets/tuna/sin_300.mp3',
           'assets/tuna/sin_300.ogg'],
    loop: true
  });
  sound.play();
  sound._audioNode[0].connect(phaser.input);

  return {
    sound : sound,
    phaser : phaser
  };
}


function stopSound(user) {
  user.sound.sound.stop();
  user.sound.phaser.disconnect();
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

  if (!users.length) return;

  var lpos, rpos, segs;

  for(var i=0; i<users.length; i++) {

    lpos = users[i].leftHand.position;
    rpos = users[i].rightHand.position;
    segs = users[i].line.segments;

    segs[0].point.x = lpos.x;
    segs[0].point.y = lpos.y;
    segs[1].point.x = rpos.x;
    segs[1].point.y = rpos.y;

    var lineMin = 20;
    var lineMax = 350;

    // console.log();
    users[i].sound.phaser.rate = users[i].line.length / lineMax * 8;
  }
}


/* 
  called everytime a new user enters
  this is usually where you create a new line
*/
function onUserIn(id, leftHand, rightHand) {

  var user = {
    bodyId    : id,
    leftHand  : leftHand,
    rightHand : rightHand,
    line : new paper.Path.Line({
      strokeColor : new paper.Color(0, Math.random(), 1),
      strokeWidth : 5
    }),
    sound : addSound()
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
      stopSound(users[i]);
      users.splice(i, 1);
      break;
    }
  }
}