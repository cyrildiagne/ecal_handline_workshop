var app;
//var line, userLeftHand, userRightHand;

var users = []; //on cree un tableaux

function setup() {
	console.log("ciao!");

  app = new HL.App();
  app.setup({
    projectName : 'Default',
    author1 : 'Prenom Karen',
    author2 : 'Prenom Nom'
  });
}


function resize(width, height) {
	
}


var activePath;
var pUsers;

function update(dt) 
{
	for (var i = 0; i < users.length; i++) 
	{
		var user = users[i];
		user.line.segments[0].point =  user.handLeft.position;
		user.line.segments[1].point =  user.handRight.position;


		if (user.handLeft.state === "open")
		{
			 console.log("User left hand is open");
			// var path = new paper.Path.Circle(new paper.Point(user.handLeft.position), 30);
			// path.fillColor = 'red';
			// console.log(path);
	//--------------------
//		var path = new Path();
//		path.strokeColor = 'black';
			if (pUsers && ( pUsers[i].handLeft.position === "unknown" ||
								 pUsers[i].handLeft.position === "closed"))
			{
				activePath = new paper.Path({
					segments: [user.handLeft.position],
					strokeColor: 'blue',
					fullySelected: true
				});
			}
			else if ( pUsers && pUsers[i].handLeft.position === "open"  )
			{
				activePath.add(new paper.Point(user.handLeft.position));
			}



			/*
			var path = new paper.Path
			({
				segments: [event.point],
				strokeColor: 'black',
				// Select the path, so we can see its segment points:
				fullySelected: true
			});

			path.strokeColor = 'blue';

			for (var i = 0; i < handLeftDraw.length; i++) 
			{
				var handLeftDraw = handLeftDraw[i];
				path.add(new paper.Point(user.handLeft.position));
			}


			if (path) 
			{
				path.selected = false;
			}
		var segmentCount = path.segments.length;
			*/
		}	

	//--------------------

	}
/*
	var user = users[0];
	if (user && user.handLeft.state === "open") 
	{	
		var path = new Path.Circle(new Point(user.handLeft.position), 30);
		path.fillColor = 'red';
		console.log(path);
		//fillColor: 'red';
	}
	*/
	pUsers = users.slice(0); // copie des utilisateurs; 
							//non pas simplement égal car on veut les valeurs et non pas la référence
}

function onUserIn(id, leftHand, rightHand) {
	var userLine = new paper.Path.Line
	({
		from : leftHand.position,
		to : rightHand.position,
		strokeColor : 'white'
	});

	line = new paper.Path.Line
	({
	strokeColor : 'white'
    })

	var user = {
		bodyId : id,
		handLeft : leftHand,
		handRight : rightHand,
		line : userLine
	};

	users.push(user); // on ajoute au tableaux, qui est globale

	user[0]

}


function onUserOut(id) {
	for (var i = 0; i < users.length; i++) {
		var user = users[i]
		// check if user's id  equals the parameter's id
		//if that's the case, remove the line from paper paperjs via its metod line.remove()
		// remove the user from the array using 

		if (user.bodyId == id){
			user.line.remove();
			users.splice(users.indexOf(user), 1);
		}
	}


	
}

//COMMAND SHIFT ALT 7