var app;
//var line, userLeftHand, userRightHand;

var users = []; //on cree un tableaux
var activePath;
var activePaths = [];
var pUsers;
var min = 50;
var max = 600;

function setup() {
	console.log("ciao!");

  app = new HL.App();
  app.setup({
    projectName : 'Forty-nine Shades of Grey',
    author1 : 'Edina ',
    author2 : 'Jean Pablo & Karen'
  });
  app.usersOffset.y = 150;
}


function resize(width, height) {
	
}

function update(dt) 
{

	for (var i = activePaths.length - 1; i >= 0; i--) {
		activePaths[i].fillColor.alpha *= 0.997;
		activePaths[i].strokeColor.alpha *= 0.999;
	};

	for (var i = 0; i < users.length; i++) 
	{
		var user = users[i];

		//ligne entre les mains
		user.line.segments[0].point =  user.handLeft.position;
		user.line.segments[1].point =  user.handRight.position;

		//------- open	hand	
		if (user.handLeft.state === "open" ||
			user.handRight.state === "open" )
		{
			//console.log("One of or both user hands are open");

			var pUser = pUsers[i]; // stade precedent user



			if (!user.activePath)
			{
				 user.activePath = new paper.Path({
				 	segments: [user.handLeft.position, user.handRight.position]
				 });
			}


			else if (pUsers && (pUser.handLeft.state ||
				     			pUser.handRight.state ) === "open")
			{
				user.activePath.insert(0, user.handLeft.position);
				user.activePath.add(user.handRight.position);

				var distance = user.handLeft.position.getDistance(user.handRight.position);	

				if (user.activePath)
				{
					user.activePath.add(user.activePath.segments[0]);

					//------------------ couleur
					if (distance >= max) 
					{
						distance == max;
					};
					if (distance < min) 
					{
						distance == min;
					};
					distance = (-(distance / max)) + 1;

					user.activePath.fillColor = new paper.Color(distance, 1);
					user.activePath.strokeColor = new paper.Color(distance, 1);
					user.activePath.strokeWidth = 0.2;

					user.line.strokeColor = new paper.Color(distance, 1);
					user.line.strokeWidth = 10;	
					//------------------ couleur

				}
				activePaths.push(user.activePath);
				user.activePath = new paper.Path
				({
				segments: [user.handLeft.position, user.handRight.position]
				});
			}
		}

		else 
		{
			//si un path est active , il le ferme
			if (user.activePath)
			{
				user.activePath.add(user.activePath.segments[0]);
			}
			user.line.strokeColor = 'red' ;
			user.line.strokeWidth = 0.5;
			user.activePath = undefined;
		}


		user.line.bringToFront();

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
		strokeColor : 'white',
		strokeWidth : 2

	});
	var user = {
		bodyId : id,
		handLeft : leftHand,
		handRight : rightHand,
		line : userLine,
		activePath: undefined
	};




	line = new paper.Path.Line();

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