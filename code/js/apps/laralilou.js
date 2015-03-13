var app   = null,
    users = [],
    levelItem = null,
    traitsArray = [];
var howls =  {};
var levelId, levelName;

var levels = ['stronger', 'getbusy', 'callmemaybe', 'crazyinlove', 'geturfreakon', 'golddigger', 'livinlavidaloca' ];
var lastSounds = [];

var hasLastSoundBeenPlayed = false;
/* 
  called once at initialisation
*/
function setup() {
  
  // create an HL app to start retrieving kinect datas
  // and automatically call the function update, onUserIn and onUserOut
  app = new HL.App();

  // set it up with our project's metadatas
  app.setup({
    projectName : 'Typonic',
    author1 : 'Lilou Bellenot',
    author2 : 'Lara Défayes'
  });

  app.usersOffset.y = 200;


  levelId = getParam('level') || 0;
  levelName = levels[levelId];

  lastSounds = [
       'assets/laralilou/sounds/'+levelName+'/all.mp3',
  ]
  addSound();


  // $(window).click(function(){
  //   win();
  // });

  importSVG('assets/laralilou/svg/'+levelName+'.svg');
}

function addSound() {

 

 //preload holw object 
 var sounds = [
      'assets/laralilou/sounds/'+levelName+'/1.mp3',
      'assets/laralilou/sounds/'+levelName+'/2.mp3',
      'assets/laralilou/sounds/'+levelName+'/3.mp3',
      'assets/laralilou/sounds/'+levelName+'/4.mp3'
      ]

  howls =  {};

  for (var i = 0; i < sounds.length; i++) {
    howls[sounds[i]] = new Howl({
      urls: [sounds[i]]
    });
  }

  for (var i = 0; i < lastSounds.length; i++) {
    howls[lastSounds[i]] = new Howl({
      urls: [lastSounds[i]]
    });
  }
}


function stopSound(user) {
  user.sound.sound.stop();
  user.sound.phaser.disconnect();
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
    //console.log(fc.toCSS());
    
      item.fillColor = 'white';
   
  } 
  
  else if (item.strokeColor){
    window.sc = sc;
    //console.log(sc.toCSS());
    // transforme tous les stroke en cyan
    if (levelName == 'stronger') {
      item.strokeColor = 'cyan';
    } else if (levelName == 'getbusy') {
      item.strokeColor = '#de2b00';
    } else if (levelName == 'callmemaybe') {
      item.strokeColor = '#f900ca';
    } else if (levelName == 'crazyinlove') {
      item.strokeColor = '#4902af';
    } else if (levelName == 'geturfreakon') {
      item.strokeColor = '#12d879';
    } else if (levelName ==  'golddigger') {
      item.strokeColor = '#d8c012';
    } else if (levelName ==  'livinlavidaloca') {
      item.strokeColor = '#d6137a';
    }
    
    var hb = new paper.Point(levelItem.bounds.width*0.5, levelItem.bounds.height*0.5);
    var trait = {
      from : item.segments[0].point.add(paper.view.center).subtract(hb),
      to : item.segments[1].point.add(paper.view.center).subtract(hb),
      item : item
    };
    traitsArray.push(trait);
    item.visible = false;
    //console.log(item.segments[0].point)
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

 
for (var i = users.length - 1; i >= 0; i--) 
{
  for (var j = traitsArray.length - 1; j >= 0; j--) 
  {
    var distmax = 50;

    leftHandPos  = users[i].leftHand.position;
    rightHandPos = users[i].rightHand.position;

    var dg0 = leftHandPos.getDistance(traitsArray[j].from);

    var dd1 = rightHandPos.getDistance(traitsArray[j].to);

    var dg1 = leftHandPos.getDistance(traitsArray[j].to);

    var dd0 = rightHandPos.getDistance(traitsArray[j].from);
    //console.log(traitsArray.length);
    //console.log(dg0+dd1);
    if (dg0+dd1 < distmax || dd0+dg1 < distmax) {
      var l = users[i].line;
      if (isLevelCompleted() && !hasLastSoundBeenPlayed) {

     

        win();

      } 
      else
      {
        if (l.visible) 
        {
          traitsArray[j].item.visible = true;
          
          if (!isLevelCompleted())
          {
            playRandomSound();
          }
          
          l.visible = false;

          setTimeout(function(){
            l.visible = true;
           // console.log(l);
          }, 1000);

        }
    }
      
    };
  }
}
 // pour tous les utilisateurs
    // pour tous les traits (dans tableau seg)

        // recuperer la distance 'dg0' entre la main gauche et le segment 0 du trait
        // recuperer la distance 'dd1' entre la main droite et le segment 1 du trait

        // recuperer la distance 'dd0' entre la main droite et le segment 0 du trait
        // recuperer la distance 'dg1' entre la main gauche et le segment 1 du trait

        // si dg0+dd1 < distance max  OU  dd0+dg1 < distance max

            // alors on ajoute le trait

  for (var i = traitsArray.length - 1; i >= 0; i--) {
    app.drawDebugLine(traitsArray[i].from, traitsArray[i].to, 'red');
    //console.log(seg[i].from);
  };

}



function win(){

setInterval(function () {
    $("body").css("background-color", function () {
        this.switch = !this.switch
        return this.switch ? "white" : ""
    });
}, 80)
  
  playLastSound();
  
  hasLastSoundBeenPlayed = true;
  setTimeout(function(){
    levelId++;
    if(levelId>=levels.length){
      levelId = 0;
    }
    var url = window.location.origin;
    url += '?app=laralilou&level='+levelId;

    ws = getParam('socket');
    if(ws) {
      url += '&socket='+ws;
    }
    window.location.href = url;
  }, 9000);
}

function playLastSound()
{
  var lastSoundFileName = lastSounds[0];
  howls[lastSoundFileName].play();
}

function playRandomSound()
{
  var sounds = [
            'assets/laralilou/sounds/'+levelName+'/1.mp3',
            'assets/laralilou/sounds/'+levelName+'/2.mp3',
            'assets/laralilou/sounds/'+levelName+'/3.mp3',
            'assets/laralilou/sounds/'+levelName+'/4.mp3'
            ];
  var soundsFile = sounds[Math.floor(Math.random()*sounds.length)];
  howls[soundsFile].play();
}

function isLevelCompleted()
{
  for (var i = 0; i < traitsArray.length; i++)
  {
    var trait = traitsArray[i].item;
    if (!trait.visible)
    {
      return false;
    } 
  }
  return true;
}

function onUserIn(id, leftHand, rightHand) {
  var couleur = 'cyan';
   if (levelName == 'stronger') {
      couleur = 'cyan';
    } else if (levelName == 'getbusy') {
      couleur = '#de2b00';
    } else if (levelName == 'callmemaybe') {
      couleur = '#f900ca';
    } else if (levelName == 'crazyinlove') {
      couleur = '#4902af';
    } else if (levelName == 'geturfreakon') {
      couleur = '#12d879';
    } else if (levelName ==  'golddigger') {
      couleur = '#d8c012';
    } else if (levelName ==  'livinlavidaloca') {
      couleur = '#d6137a';
    }

  // create a line with paperjs
  var line = new paper.Path.Line({
    strokeColor : couleur,
    strokeWidth : 10,
  
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