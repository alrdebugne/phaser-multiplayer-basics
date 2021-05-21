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

    // Create players
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

    // Add position of new entrant
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo)
    });

    // Remove players upon disconnection
    this.socket.on('playerDisconnects', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });

    // Update on-screen position of other players
    this.socket.on('updatePlayerMovement', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
    });

    this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // TODO: copy dynamics from Unity project
    if (this.ship) {
        // Rotation
        if (this.cursors.left.isDown) {
            this.ship.setAngularVelocity(-150);
        } else if (this.cursors.right.isDown) {
            this.ship.setAngularVelocity(150);
        } else {
            this.ship.setAngularVelocity(0);
        }
        // Movement
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(
                this.ship.rotation + 1.5, 100, this.ship.body.acceleration
            );
        } else {
            this.ship.setAcceleration(0);
        }

        // Emit player movement, if it has changed
        var x = this.ship.x;
        var y = this.ship.y;
        var r = this.ship.rotation;
        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
            this.socket.emit('playerMoves', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation});
        }
        // Store old position
        this.ship.oldPosition = {
            x: this.ship.x,
            y: this.ship.y,
            rotation: this.ship.rotation,
        };

        this.physics.world.wrap(this.ship, 5);
    }

}

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