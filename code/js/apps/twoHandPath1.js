var app;
//var line, userLeftHand, userRightHand;

var users = []; //on cree un tableaux

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


var activePath;

var activePaths = [];
var pUsers;

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


		if (i != 0){ continue; } // uniquement pour le premier____________!



		//------- open	hand	
		if (user.handLeft.state === "open")
		{
			 console.log("User left hand is open");

			var pUser = pUsers[i]; // stade precedent user



			 if (!activePath) //TODO
			 {
				activePath = new paper.Path({
					segments: [user.handLeft.position, user.handRight.position],
					strokeColor: 'blue'/*,
					fullySelected: true*/
				});
			}
			else if (pUsers && pUser.handLeft.state === "open")
			{
				console.log("Adding to active path");	
				activePath.insert(0, user.handLeft.position);
				activePath.add(user.handRight.position);
				//activePath.add(new paper.Point(user.handLeft.position));
			}
		}
		//------- close hand
		else 
		{
			//si un path est active , il le ferme
			if (activePath)
			{
				activePath.add(activePath.segments[0]);
				activePath.simplify();
			}
			

			activePath = undefined;
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