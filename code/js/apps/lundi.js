var app, line, userLeftHand, userRightHand;

function setup() {

  app = new HL.App();
  app.setup({
    projectName : 'hello monday',
    author1 : '',
    author2 : ''
  });

  line = new paper.Path.Line({
    strokeColor : 'white'
  });
}

function resize(width, height) {
  
}

function update(dt) {
  if (userLeftHand) {
    line.segments[0].point = userLeftHand.position;
    line.segments[1].point = userRightHand.position;
  }
}

function onUserIn(id, leftHand, rightHand) {
  userLeftHand = leftHand;
  userRightHand = rightHand;
}

function onUserOut(id) {
  
}