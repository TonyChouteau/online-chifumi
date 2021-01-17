const express = require('express');
var cors = require('cors');

const app = express();
app.use(cors());
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

let rooms = {};

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// State variable

let ID = 0;
let alphabet = {
	start : 65,
	end : 91,
};

// CSTE

const PLAYER = 0;
const SPECTATOR = 1;

io.on('connection', (socket) => {

	// CREATE
	socket.on("create", (data) => {
		console.log("Creating room", data);

		socket.nickname = data.nickname;
		socket.status = PLAYER;

		let room = {
			id: ID,
			playerCount: 1, 
			players: [
				data.nickname
			],
			spectators: [],
			score: [0,0],
			full: false,
			code: makeRoomCode()
		}
		ID++;
		rooms[room.id] = room;

		socket.emit("created", room);
		console.log("Room created");
	})

	// JOIN
	socket.on("join", (data) => {
		console.log("Joining room", data);

		let resultJoiningRoom = joinRoom(data);

		if (resultJoiningRoom.error) {
			socket.emit("error", resultJoiningRoom.error);
			return;
		}

		if (resultJoiningRoom.playerCount === 1) {
			resultJoiningRoom.players.push(data.nickname);
			resultJoiningRoom.playerCount = resultJoiningRoom.players.length;
		} else {
			resultJoiningRoom.spectators.push(data.nickname);
		}

		socket.emit("joined", resultJoiningRoom);
		socket.broadcast.emit("update", resultJoiningRoom);

		console.log("Room joined");
	})
});

function makeRoomCode() {
	let codeAlreadyUsed = true;
	let roomCode;

	while (codeAlreadyUsed) {
		let code = [0,0,0,0,0,0];
		
		for (let i in code) {
			code[i] = String.fromCharCode(alphabet.start+Math.floor(Math.random()*26));
		}

		roomCode = code.join("");
	
		codeAlreadyUsed = false;
		for (let room in rooms) {
			if (room.code === roomCode) {
				codeAlreadyUsed = true;
			}
		}
	}

	return roomCode
}

function joinRoom(data) {
	let roomToJoin = null;

	for (let id in rooms) {
		if (data.code === rooms[id].code) {
			roomToJoin = rooms[id];
		}
	}
	if (roomToJoin === null) {
		return {
			error: "This room doesn't exist"
		};
	}

	let roomUsers = roomToJoin.players.concat(rooms.spectators)
	for (let id in roomUsers) {
		if (roomUsers[id] === data.nickname) {
			return {
				error: "This nickname is already used"
			};
		}
	}

	return roomToJoin;
}