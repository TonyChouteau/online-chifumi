// Menu
let $menu;

let $pseudo;
let $createButton;
let $joinInput;
let $joinButton;

// Room
let $room;
let $roomTitle;
let $playerList;
let $spectatorList;
let $gameContainer;

// State

let waitingForServer = false;

var socket = io("localhost:3000");

$(document).ready(() => {

	// Menu
	$menu = $(".menu");

	$pseudo = $(".pseudo");
	$pseudo.val("Player_"+Math.floor(Math.random()*100000)); 

	$createButton = $(".create_room");
	$joinInput = $(".join_code");
	$joinButton = $(".join_room");

	// Room
	$room = $(".room");

	$roomTitle = $(".room_title");

	$playerList = $(".player_list");
	$spectatorList = $(".spectator_list");

	$roomGame = $(".game_container");

	// Listen to the server
	listenToServer();

	// Menu
	createRoom();
	joinRoom();

});

function createRoom() {
	$createButton.on("click", () => {
		if (waitingForServer) {
			return;
		}
		waitingForServer = true;
		setTimeout(() => {waitingForServer = false}, 2000); //To void spam request

		socket.emit("create", {
			nickname: $pseudo.val()
		});
	});
}

function joinRoom() {
	$joinInput.on("change keydown keyup", (e) => {
		let $node = $(e.target);
		$node.val($node.val().toUpperCase());
		if ($node.val().length === 6) {
			$joinButton.removeClass("disabled");
		} else {
			$joinButton.addClass("disabled");
		}
	});

	$joinButton.on("click", () => {
		if ($joinButton.hasClass("disabled")){
			return;
		}
		if (waitingForServer) {
			return;
		}
		waitingForServer = true;
		setTimeout(() => {waitingForServer = false}, 2000); //To void spam request

		socket.emit("join", {
			nickname: $pseudo.val(),
			code: $joinInput.val()
		});
	});
}

function listenToServer() {
	console.log("Listening to server");

	socket.on("created", (data) => {
		fadeOutMenu(data);
		console.log("Room created", data);
	});

	socket.on("joined", (data) => {
		fadeOutMenu(data);
	});

	socket.on("error", (data) => {
		console.log("ERROR :", data);
	})
	socket.on("update", (data) => {
		updateRoomData(data);
	});
}

function fadeOutMenu(data) {
	$(".menu").fadeOut(() => {
		displayRoom(data);
	});
}

function displayRoom(room) {
	$room.show();
	$roomTitle.html("Room : <span> " + room.code + "</span>");

	updateRoomData(room);
}

function updateRoomData(room) {
	console.log(room)

	let playerList = "";
	for (let id in room.players) {
		playerList += "<li>"+ (room.players[id] ? room.players[id] : "-") +"</li>";
	}
	if (room.players.length < 2) {
		playerList += "<li>-</li>";
	}
	$playerList.html(playerList);

	let spectatorList = "";
	for (let id in room.spectators) {
		spectatorList += "<li>"+ room.spectators[id] +"</li>";
	}
	$spectatorList.html(spectatorList);
}