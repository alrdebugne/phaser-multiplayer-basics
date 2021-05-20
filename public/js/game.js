var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 } 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

function preload() {
    // Load assets
    this.load.image('red', 'assets/spaceships/spaceship2_red.png');
    this.load.image('blue', 'assets/spaceships/spaceship2_blue.png');
}

function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();

    // Update position of current players
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                // Add own spaceship
                addPlayer(self, players[id]);
            } else {
                // Add other spaceships
                addOtherPlayers(self, players[id]);
            }
        });
    });

    // Add position of new player
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo)
    });

    // Remove players upon disconnection
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEarch(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
}

function update() {}

function addPlayer(self, playerInfo) {
    var spriteName = `${playerInfo.team}`
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, spriteName)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
    var spriteName = `${playerInfo.team}`
    const otherPlayer = self.physics.add.image(playerInfo.x, playerInfo.y, spriteName)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}