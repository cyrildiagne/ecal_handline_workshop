var app   = null,
    lines = [],
    debug = null;

function setup() {
  app = new HL.App();
  app.setup({
    projectName : 'Debug Canvas',
    description : 'shows how to use the debug canvas',
    instructions : 'press TAB to toggle debug mode',
    author1 : 'Prenom Nom',
    author2 : 'Prenom Nom'
  });
}


function update(dt) {

  for (var i = 0; i < lines.length; i++) {

    app.drawDebugLine(lines[i].a.position, lines[i].b.position, 'red');

    for (var j = 0; j < lines.length; j++) {

      if( j != i) {
        app.drawDebugLine(lines[i].b.position, lines[j].a.position, 'blue');
      }
    }
  }
}

function onUserIn(id, leftHand, rightHand) {
  lines.push({ id : id, a : leftHand, b : rightHand});
}

function onUserOut(id) {
  for (var i = 0; i < lines.length; i++) {
    if(lines[i].id == id) { lines.splice(i, 1); }
  }
}