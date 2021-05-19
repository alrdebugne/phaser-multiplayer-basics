var express = require('express');
var app = express();
var server = require('http').Server(app);
var { Server } = require("socket.io");
var io = new Server(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('A user connected');
    socket.on('disconnect', function() {
        console.log('User disconnected');
    });
});

server.listen(8081, function() {
    console.log(`Listening on ${server.address().port}`);
});