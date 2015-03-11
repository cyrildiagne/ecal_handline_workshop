var app;
//var line, userLeftHand, userRightHand;

var users = []; //on cree un tableaux
var activePath;
var activePaths = [];
var pUsers;


function setup() {
	console.log("ciao!");

  app = new HL.App();
  app.setup({
    projectName : 'Default',
    author1 : 'Edina ',
    author2 : 'JP ',
    author2 : 'Karen '
  });
}


function resize(width, height) {
	
}


function sillyRandomColor()
{
	var colors = ['red', 'green', 'blue', 'orange', 'yellow', 'purple', 'white', 'gray'];
	var color = colors[Math.floor(Math.random()*colors.length)];
	return color;
}

// Utiliser activePaths array 
// checker active path pour utilisateur conceré 

function update(dt) 
{
	for (var i = 0; i < users.length; i++) 
	{
		var user = users[i];
		//ligne entre les mains
		user.line.segments[0].point =  user.handLeft.position;
		user.line.segments[1].point =  user.handRight.position;


//		if (i != 0){ continue; } // uniquement pour le premier____________!

		//------- open	hand	
		if (user.handLeft.state === "open" ||
			user.handRight.state === "open" )
		{
			console.log("One of or both user hands are open");

			var pUser = pUsers[i]; // stade precedent user

			if (!user.activePath)
			{
				/*
				var strokeColor;
				if (i == 0)
				{
					strokeColor = 'blue';
				}
				else
				{
					strokeColor = 'red';
				}
				*/

				var strokeColor = i == 0 ? 'blue' : 'red';

				 user.activePath = new paper.Path({
				 	segments: [user.handLeft.position, user.handRight.position]
				 	/*strokeColor: strokeColor,
				 	fullySelected: true*/
				 });
				 user.activePath.fillColor = 'red';

			}
			else if (pUsers && (pUser.handLeft.state ||
				     			pUser.handRight.state ) === "open")
			{
//				console.log("Adding to active path");	
				user.activePath.insert(0, user.handLeft.position);
				user.activePath.add(user.handRight.position);
				user.activePath.fillColor = sillyRandomColor();
				//activePath.add(new paper.Point(user.handLeft.position));
			}
		}
		else 
		{
			//si un path est active , il le ferme
			if (user.activePath)
			{
				user.activePath.add(user.activePath.segments[0]);
				//user.activePath.simplify();
				//user.activePath.fillColor = 'red';

			}

			user.activePath = undefined;
		}
	}

	// copie des precedents utilisateurs; 
	//non pas simplement égal car on veut les valeurs et non pas la référence
	pUsers = $.extend(true, [], users);
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
		line : userLine,
		activePath: undefined
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