var querystring = require("querystring");
var fs = require("fs");
var url = require("url");

var joueur;
var arme;
var armure;

function create(response, request) {
	console.log("Le gestionnaire 'create' est appelé.");
	var arguments = querystring.parse(url.parse(request.url).query);
	joueur = new Joueur("", 0, 0, 0, 0);
	if (arguments != null) {
		joueur.name = arguments.name;
		joueur.hp = arguments.hp;
		joueur.strength = arguments.strength;
		joueur.agility = arguments.agility;
		joueur.intelligence = arguments.intelligence;
	}
	response.end();
}

function save(response) {
	console.log("Le gestionnaire 'save' est appelé.");
	fs.writeFileSync("./data/JSON/data.json", '{' +
		'"joueur":' + JSON.stringify(joueur) + ',' +
		'"arme":' + JSON.stringify(arme) + ',' +
		'"armure":' + JSON.stringify(armure) + '}',
		function (err) {
			if (err) console.log(err);
		});
	response.end();
}

function load(response) {
	console.log("Le gestionnaire 'load' est appelé.");
	var file = fs.readFileSync('./data/JSON/data.json', 'utf8');
	response.write(file);
	joueur.name = JSON.parse(file).joueur.name;
	joueur.hp = JSON.parse(file).joueur.hp;
	joueur.strength = JSON.parse(file).joueur.strength;
	joueur.agility = JSON.parse(file).joueur.agility;
	joueur.intelligence = JSON.parse(file).joueur.intelligence;
	joueur.direction = JSON.parse(file).joueur.direction;
	joueur.posX = JSON.parse(file).joueur.posX;
	joueur.posY = JSON.parse(file).joueur.posY;
	joueur.inventaire = JSON.parse(file).joueur.inventaire;
	response.end();
}

function moveTo(response, request) {
	console.log("Le gestionnaire 'moveTo' est appelé.");
	var arguments = querystring.parse(url.parse(request.url).query);
	joueur.direction = arguments.direction;
	if (joueur.direction == "east") joueur.posX += 1;
	if (joueur.direction == "west") joueur.posX -= 1;
	if (joueur.direction == "north") joueur.posY += 1;
	if (joueur.direction == "south") joueur.posY -= 1;
	response.write(joueur.evenement() + "$" + ((joueur.hp >= 0) ? "vivant" : "mort"));
	response.end();
}

exports.create = create;
exports.save = save;
exports.load = load;
exports.moveTo = moveTo;


//---------------------------------------
//-----------------------------------
//------------------------------
//-------------------------
//---------------------
//-------------------------
//------------------------------
//-----------------------------------
//---------------------------------------


//classe Joueur

class Joueur {
	constructor(name, hp, strength, agility, intelligence) {
		this.name = name;
		this.hp = parseInt(hp);
		this.strength = parseInt(strength);
		this.agility = parseInt(agility);
		this.intelligence = parseInt(intelligence);
		this.direction = "";
		this.posX = 0;
		this.posY = 0;
		this.inventaire = new Array();
		create_inventaire(this);
	}

	evenement() {
		console.log(this.hp);
		this.randomNumber = Math.floor(Math.random() * Math.floor(5) + 1);
		console.log(this.randomNumber);
		switch (this.randomNumber) {
			case 1:
				return this.findMonstre();
			case 2:
				return this.findArme();
			case 3:
				return this.findArmure();
			default:
				return "<br>Vous arrivez dans une salle vide...<br>";
		}
	}


	findMonstre() {
		var unMonstre = new Monstre(Math.floor(Math.random() * Math.floor(10) + 1));
		var unMonstreDmg = (unMonstre.might - this.inventaire[1].strength);
		if (unMonstreDmg < 0) unMonstreDmg = 0;
		var text = "";
		text += "<br>Le joueur a trouvé un monstre nommé " + unMonstre.nom + " ayant " + unMonstre.hp + " HP/Force";
		while (unMonstre.hp > 0 && this.hp > 0) {
			this.hp -= unMonstreDmg;
			unMonstre.hp -= this.inventaire[0].strength;
			text += "<br>Vous attaquez avec votre arme ayant " +
				this.inventaire[0].strength + " de dégats mais vous prenez " +
				unMonstreDmg + " de dégats." +
				"<br>Points de vie du monstre: " + unMonstre.hp +
				"<br>Vos Points de vie: " + this.hp;
		}
		text += "<br>-----------------------";
		return text + '<br>';
	}

	findArme() {
		var text = "";
		var uneArme = new Arme(Math.floor(Math.random() * Math.floor(10) + 1));
		text += "<br>Vous trouvé une arme avec " +
			uneArme.strength + " de puissance.";
		if (uneArme.strength > this.inventaire[0].strength) {
			this.inventaire[0] = uneArme;
			text += "<br>Vous décidez de la ramassez " +
				"car elle est plus puissante que votre arme actuelle .";
		} else {
			text += "<br>Vous ne la ramassez pas " +
				"car elle est moins puissante que votre arme actuelle.";
		}
		text += "<br>-----------------------";
		return text + '<br>';
	}

	findArmure() {
		var text = "";
		var uneArmure = new Armure(Math.floor(Math.random() * Math.floor(5) + 1));
		text += "<br>Vous trouvé une armure avec " +
			uneArmure.strength + " de résistance.";
		if (uneArmure.strength > this.inventaire[1].strength) {
			this.inventaire[1] = uneArmure;
			text += "<br>Vous d?cidez de la ramassez " +
				"car elle est plus résistante que votre armure actuelle .";
		} else {
			text += "<br>Vous ne la ramassez pas " +
				"car elle est moins résistante que votre armure actuelle.";
		}
		text += "<br>-----------------------";
		return text + '<br>';
	}
}

function create_inventaire(joueur) {
	armure = new Armure(0);
	arme = new Arme(1);
	joueur.inventaire = [arme, armure];
}

// classe Arme
class Arme {
	constructor(strength) {
		this.nom = "Lance";
		this.strength = strength;
	}
}

//classe Armure
class Armure {
	constructor(strength) {
		this.nom = "Plastron";
		this.strength = strength;
	}

}

//classe Monstre

class Monstre {
	constructor(strength) {
		this.nom = "Xulbux";
		this.might = parseInt(strength);
		this.hp = parseInt(strength);
		console.log(this);
	}
}