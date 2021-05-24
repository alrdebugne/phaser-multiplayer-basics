var express = require('express');
var app = express();
var server = require('http').Server(app);
var { Server } = require("socket.io");
var io = new Server(server);

var players = {};
var lasers = {};
var scores = {
    blue: 0,
    red: 0,
    green: 0,
    orange: 0,
};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

/*
~~~ Connection ~~~
*/
io.on('connection', function (socket) {
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

    /*
    ~~~ Disconnection ~~~
    */
    socket.on('disconnect', function() {
        console.log(`User ${socket.id} disconnected`);
        // Remove player from players object
        delete players[socket.id];
        // Emit message to all other players to remove disconnected player
        io.emit('playerDisconnects', socket.id)
    });

    /*
    ~~~ Movement ~~~
    */
    socket.on('playerMoves', function (movement) {
        players[socket.id].x = movement.x;
        players[socket.id].y = movement.y;
        players[socket.id].rotation = movement.rotation;
        // Broadcast message to all other players about current socket's movement
        socket.broadcast.emit('updatePlayerMovement', players[socket.id]);
   });

   /*
   ~~~ Lasers ~~~
   */
   socket.on('laserFired', function (laserInfo) {
        lasers[socket.id] = laserInfo;
        // Broadcast message to all other players about current socket's active lasers
        socket.broadcast.emit('createPlayerLaser', lasers[socket.id]);
  });

});

server.listen(8081, function() {
    console.log(`Listening on ${server.address().port}`);
});