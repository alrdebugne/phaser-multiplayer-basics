var express = require('express');
var app = express();
var server = require('http').Server(app);
var { Server } = require("socket.io");
var io = new Server(server);

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    /*
    ~~~ Connection ~~~
    */
    console.log(`New user ${socket.id} connected`);
    // Create a new player, and add it to the players object
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };
    // Update all players with newly spawned player
    socket.emit('currentPlayers', players);
    // Update all other active players with the newly spawned player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    // ^ socket.emit sends event to every socket
    //   socket.broadcast.emit sends event to every socket except the emitting one

    socket.on('disconnect', function() {
        /*
        ~~~ Disconnection ~~~
        */
        console.log(`User ${socket.id} disconnected`);
        // Remove player from players object
        delete players[socket.id];
        // Emit message to all other players to remove disconnected player
        io.emit('playerDisconnect', socket.id)
    });
});

server.listen(8081, function() {
    console.log(`Listening on ${server.address().port}`);
});