var HL = HL || {};

HL.colors = {
  background : "#000",
  light : 'white',
  dark : "#101C40",
  alt : "8C5F37",
  bones : "#333"
};


// ---- JOINT VIEW ----


HL.JointView = function(joint) {
  this.joint = joint;
  this.position = new paper.Point();
  this.velocity = new paper.Point();
};



// ---- BONE VIEW ----



HL.BoneView = function(jvs) {
  this.jvs = jvs;
  this.view = new paper.Path({
    strokeColor : HL.colors.bones,
    strokeCap : 'round',
    strokeWidth : 4
  });

  for(var i=0; i<jvs.length; i++) {
    this.view.add(jvs[i].position);
  }
};

HL.BoneView.prototype.update = function() {
  for(var i=0; i<this.jvs.length; i++) {
    this.view.segments[i].point.x = this.jvs[i].position.x;
    this.view.segments[i].point.y = this.jvs[i].position.y;
  }
  this.view.smooth();
};



// ---- BODY VIEW ----



HL.BodyView = function (body) {
  this.body = body;
  this.view = new paper.Group();
  this.view.transformContent = false;
  this.view.pivot = new paper.Point(0, 0);
  this.width = 0;
  this.height = 0;
  this.joints = [];
  this.bones = [];
  this.dataRatio = 1;
  this.setupJoints();
  this.setupBones();
  this.resize({
    width: paper.view.bounds.width,
    height: paper.view.bounds.height
  });
};

HL.BodyView.prototype.setupJoints = function() {
  this.joints = [];
  this.jointsGrp = new paper.Group();
  for (var i=0; i<this.body.joints.length; i++) {
    j = this.body.joints[i];
    jv = new HL.JointView(j);
    this.joints.push(jv);
  }
};

HL.BodyView.prototype.setupBones = function() {
  this.bones = [];
  this.bonesGrp = new paper.Group();
  var leftLeg = [
    ks.JointType.LEFT_HIP,
    ks.JointType.LEFT_KNEE,
    ks.JointType.LEFT_FOOT
  ];
  var rightLeg = [
    ks.JointType.RIGHT_HIP,
    ks.JointType.RIGHT_KNEE,
    ks.JointType.RIGHT_FOOT
  ];
  var leftArm = [
    ks.JointType.LEFT_SHOULDER,
    ks.JointType.LEFT_ELBOW,
    ks.JointType.LEFT_HAND,
    ks.JointType.LEFT_HAND_TIP
  ];
  var rightArm = [
    ks.JointType.RIGHT_SHOULDER,
    ks.JointType.RIGHT_ELBOW,
    ks.JointType.RIGHT_HAND,
    ks.JointType.RIGHT_HAND_TIP
  ];
  var head = [
    ks.JointType.HEAD,
    ks.JointType.NECK
  ];
  var boneLists = [leftLeg, rightLeg, leftArm, rightArm, head];
  for (var i=0; i<boneLists.length; i++) {
    var arr = [];
    for( var j=0; j<boneLists[i].length; j++) {
      arr.push(this.joints[ boneLists[i][j] ]);
    }
    var b = new HL.BoneView(arr);
    this.bonesGrp.addChild(b.view);
    this.bones.push(b);
  }
  this.view.addChild(this.bonesGrp);
};


HL.BodyView.prototype.resize = function(vp) {
  if (vp.width > vp.height) {
    this.height = vp.height * 0.5;
    this.width = this.height * this.dataRatio;
  } else {
    this.width = vp.width * 0.5;
    this.height = this.width * this.dataRatio;
  }

  this.update(1);
};

HL.BodyView.prototype.update = function(speed, offset) {
  var bone, jnt, scale, i;
  if (speed === null || typeof speed == 'undefined') {
    speed = 0.5;
  }
  scale = this.width;
  offset = offset || {x:0,y:0};
  var c = paper.view.center;
  for (i=0; i<this.joints.length; i++) {
    jnt = this.joints[i];
    jnt.velocity.x = (jnt.joint.x * scale + offset.x + c.x - jnt.position.x) * speed;
    jnt.velocity.y = (jnt.joint.y * scale + offset.y + c.y - jnt.position.y) * speed;
    jnt.position.x += jnt.velocity.x;
    jnt.position.y += jnt.velocity.y;
  }

  for (i=0; i<this.bones.length; i++) {
    this.bones[i].update();
  }
};



// ---- APP ----



HL.App = function() {

  this.isDebug = false;
  this.bodies = [];

  this.ksTracker = null;
  this.ksProxy = null;
  this.ksDebug = null;

  this.debugCanvas = null;

  this.usersOffset = new paper.Point(0, 0);

  this.view = null;
};

HL.App.prototype.setup = function (infos) {

  if(typeof setInfos !== 'undefined') setInfos(infos);

  // kinect
  this.setupKinect();

  // gfx
  var canvas = document.getElementById('paperjs-canvas');
  paper.setup(canvas);

  this.view = new paper.Layer();
  this.view.pivot = new paper.Point(0,0);
  this.view.transformContent = false;

  this.resize();

  window.addEventListener('resize',  $.proxy(this.resize, this), false);
  window.addEventListener('keydown', $.proxy(this.onKeyDown, this), false);

  paper.view.on('frame', $.proxy(this.update, this));
};

HL.App.prototype.onKeyDown = function () {
  switch(event.keyCode) {
    case 9 :
      event.preventDefault();
      this.toggleDebug();
      break;
  }
};

HL.App.prototype.toggleDebug = function () {
  this.isDebug = !this.isDebug;
  if (this.isDebug) {
    document.body.appendChild(this.ksDebug.canvas);
    if(this.debugCanvas) document.body.appendChild(this.debugCanvas);
  } else {
    document.body.removeChild(this.ksDebug.canvas);
    if(this.debugCanvas) document.body.removeChild(this.debugCanvas);
  }
  if (typeof setDebug !== "undefined") {
    setDebug(this.isDebug);
  }
};

HL.App.prototype.addDebugCanvas = function(){
  this.debugCanvas = document.createElement('canvas');
  this.debugCanvas.width = paper.view.bounds.width;
  this.debugCanvas.height = paper.view.bounds.height;
  this.debugCanvas.className = 'debug';
};

HL.App.prototype.drawDebugLine = function(p0, p1, color) {
  if(!this.debugCanvas) {
    this.addDebugCanvas();
  }
  if(!this.isDebug) return;
  var ctx = this.debugCanvas.getContext('2d');
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
};

HL.App.prototype.drawDebugCircle = function(p, radius, color) {
  if(!this.debugCanvas) {
    this.addDebugCanvas();
  }
  if(!this.isDebug) return;
  var ctx = this.debugCanvas.getContext('2d');
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2, false);
  ctx.stroke();
};


HL.App.prototype.resize = function () {
  for(var i=0; i<this.bodies.length; i++){
    this.bodies[i].view.resize(paper.view.bounds);
  }
  window.stageWidth = paper.view.bounds.width;
  window.stageHeight = paper.view.bounds.height;
  if (typeof resize !== "undefined") {
    resize(window.stageWidth, window.stageHeight);
  }
};

HL.App.prototype.update = function (event) {

  this.ksDebug.render();
  var b;
  for(var i=0; i<this.bodies.length; i++) {
    b = this.bodies[i];
    b.view.update(null, this.usersOffset);
    b.view.joints[ks.JointType.LEFT_HAND_TIP].state = b.body.leftHandState;
    b.view.joints[ks.JointType.RIGHT_HAND_TIP].state = b.body.rightHandState;
  }

  if(this.debugCanvas) {
    this.debugCanvas.getContext('2d').clearRect(0,0,this.debugCanvas.width, this.debugCanvas.height);
  }

  update(event.delta*1000, this.bodies);
};

HL.App.prototype.setupKinect = function () {
  this.ksTracker = new ks.Tracker();
  this.ksTracker.addListener('user_in',  $.proxy(this.onKinectUserIn, this));
  this.ksTracker.addListener('user_out', $.proxy(this.onKinectUserOut, this));

  // this.ksProxy = new ks.Playback(this.ksTracker);
  // this.ksProxy.play('replays/2_users.json.gz', 30);
  var socket = getParam('socket');
  var replay = getParam('replay');
  if (socket) {
    this.ksProxy = new ks.SocketStream(this.ksTracker);
    // this.ksProxy.connect("ws://192.168.0.40:9092");
    this.ksProxy.connect(socket);
  } else {
    this.ksProxy = new ks.Playback(this.ksTracker);
    replay = replay || '2_users.json.gz';
    if(replay) {
      this.ksProxy.play('replays/'+replay, 30);
    }
  }

  this.ksDebug = new ks.DebugView(this.ksTracker);
  this.ksDebug.proxy = this.ksProxy;
  this.ksDebug.canvas.style.position = 'absolute';
  this.ksDebug.canvas.style.right = '0';
  this.ksDebug.canvas.style.bottom = '-20px';
};

HL.App.prototype.onKinectUserIn = function (event) {
  var b = {
    body : event.body,
    view : new HL.BodyView(event.body)
  };
  this.bodies.push(b);
  b.view.resize(paper.view.bounds);
  this.view.insertChild(0, b.view.view);
  var left = b.view.joints[ks.JointType.LEFT_HAND_TIP];
  left.state = b.body.leftHandState;
  var right = b.view.joints[ks.JointType.RIGHT_HAND_TIP];
  right.state = b.body.rightHandState;
  onUserIn(event.body.id, left, right);
};

HL.App.prototype.onKinectUserOut = function (event) {
  var b = null;
  for(var i=0; i<this.bodies.length; i++) {
    if (this.bodies[i].body.id == event.body.id) {
      b = this.bodies[i];
      break;
    }
  }
  this.bodies.splice(this.bodies.indexOf(b),1);
  b.view.view.remove();
  onUserOut(event.body.id);
};


// ---- GEOM ----


HL.geom = {

  sqr : function(x) {
    return x * x;
  },

  dist2 : function(v, w) {
    return HL.geom.sqr(v.x - w.x) + HL.geom.sqr(v.y - w.y);
  },

  // http://jsfiddle.net/mmansion/9K5p9/
  distToSegmentSquared : function(p, v, w) {
    var dist2 = HL.geom.dist2;
    var l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
  }
};


// ---- PHYSICS ----


HL.Physics = function() {
  var CustomRenderer = {
    create: function(options) { return this;},
    world: function(engine) {}
  };

  this.engine = Matter.Engine.create({
    positionIterations: 6,
    velocityIterations: 4,
    enableSleeping: true,
    render: {
      controller: CustomRenderer,
      options: {
        something: true
      }
    },
    world: {
      bounds: {
        min: {
          x: 0,
          y: 0
        },
        max: {
          x: paper.view.bounds.width * 2,
          y: paper.view.bounds.height
        }
      }
    }
  });
  this.bodies = [];
  this.handLineBodies = [];
};

//sol
HL.Physics.prototype.addFloor = function() {
  var w = paper.view.bounds.width;
  var h = paper.view.bounds.height;
  var floor = Matter.Bodies.rectangle(w*0.5, h+25, w, 50, {
    isStatic: true
  });
  return Matter.World.add(this.engine.world, floor);
};

//mur gauche
HL.Physics.prototype.addLeftWall = function() {
  var w = paper.view.bounds.width;
  var h = paper.view.bounds.height;
  var floor = Matter.Bodies.rectangle(-25, h*0.5, 50, h, {
    isStatic: true
  });
  return Matter.World.add(this.engine.world, floor);
};

//mur droit
HL.Physics.prototype.addRightWall = function() {
  var w = paper.view.bounds.width;
  var h = paper.view.bounds.height;
  var floor = Matter.Bodies.rectangle(w+25, h*0.5, 50, h, {
    isStatic: true
  });
  return Matter.World.add(this.engine.world, floor);
};

HL.Physics.prototype.addCircle = function(view, radius, opt) {
  opt = opt || { restitution: 0.7, friction : 0.0 };
  var circle = Matter.Bodies.circle(view.position.x, view.position.y, radius, opt, 10);
  circle.view = view;
  Matter.World.add(this.engine.world, circle);
  this.bodies.push({
    body: circle,
    view: view
  });
  return circle;
};

HL.Physics.prototype.addRectangle = function(view, width, height, opt) {
  opt = opt || { restitution: 0.7, friction : 0.0 };
  var rect = Matter.Bodies.rectangle(pos.x, pos.y, width, height, opt, 10);
  rect.view = view;
  Matter.World.add(this.engine.world, rect);
  this.bodies.push({
    body: rect,
    view: view
  });
  return rect;
};

HL.Physics.prototype.addHandLineRect = function(view, j1, j2, thickness, opt) {
  opt = opt || { restitution: 1.0, friction : 0.0 };
  opt.isStatic = true;
  var rect = Matter.Bodies.rectangle(view.position.x, view.position.y, 100, thickness, opt, 10);
  rect.view = view;
  Matter.World.add(this.engine.world, rect);
  this.handLineBodies.push({
    body: rect,
    view: view,
    thickness: thickness,
    j1 : j1,
    j2 : j2
  });
  return rect;
};

HL.Physics.prototype.remove = function(body) {
  Matter.World.remove(this.engine.world, body);
  var i, arr=this.bodies;
  if(body.j1) {
    arr = this.handLineBodies;
  }
  for (i=0; i<arr.length; i++) {
    var b = arr[i];
    if (b.body === body) {
      arr.splice(i, 1);
      return;
    }
  }
};

HL.Physics.prototype.updateHandLines = function(hlb) {
  var j1 = hlb.j1.position;
  var j2 = hlb.j2.position;
  var x = (j1.x + j2.x) * 0.5;
  var y = (j1.y + j2.y) * 0.5;
  var dx = j1.x - j2.x;
  var dy = j1.y - j2.y;
  var width = Math.sqrt(dx * dx + dy * dy);
  var height = hlb.thickness;
  var angle = Math.atan2(dy, dx);
  var body = hlb.body;
  body.position.x = x;
  body.position.y = y;
  body.vertices[0].x = x - width * 0.5;
  body.vertices[0].y = y - height * 0.5;
  body.vertices[1].x = x + width * 0.5;
  body.vertices[1].y = y - height * 0.5;
  body.vertices[2].x = x + width * 0.5;
  body.vertices[2].y = y + height * 0.5;
  body.vertices[3].x = x - width * 0.5;
  body.vertices[3].y = y + height * 0.5;
  Matter.Vertices.rotate(body.vertices, angle, body.position);
};

HL.Physics.prototype.update = function(dt) {
  Matter.Engine.update(this.engine, 1000 / 60, 1);
  var i, b;
  for (i=0; i<this.bodies.length; i++) {
    b = this.bodies[i];
    b.view.position.x = b.body.position.x;
    b.view.position.y = b.body.position.y;
    b.view.rotation = b.body.angle / Math.PI * 180;
  }
  for (i=0; i<this.handLineBodies.length; i++) {
    this.updateHandLines(this.handLineBodies[i]);
  }
};



// ---- SOUND ----


HL.sound = {

  cache : {},

  play : function(url) {
    url = "assets/"+url;
    this.cache[url] = this.cache[url] || new Howl( {urls: [url]} );
    this.cache[url].play();
  },

  context : Howler.ctx,

  tuna : new Tuna(Howler.ctx)
};