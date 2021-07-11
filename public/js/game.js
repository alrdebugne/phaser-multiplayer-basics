import { Spaceship } from './ship.js';
import { LaserGroup } from './lasers.js';
import { MultiKey } from './multi-key.js';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
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
    this.window = window;
    /*
    ~~~ Load assets ~~~
    */
    // Spaceships
    this.load.image('red', 'assets/spaceships/spaceship2_red.png');
    this.load.image('blue', 'assets/spaceships/spaceship2_blue.png');
    // Weapons
    this.load.image('redLaser', 'assets/weapons/laserRedShort.png')
    this.load.image('blueLaser', 'assets/weapons/laserBlueShort.png')
    // Background
    this.load.image('background', 'assets/background/purple.png');
}

function create() {
    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.otherLasers = this.physics.add.group();

    // Create background
    this.background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'background');
    this.background.setDisplaySize(window.innerWidth, window.innerHeight);

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

    // Create lasers
    this.socket.on('createPlayerLaser', function (laserInfo) {
        if (laserInfo.socketId !== self.socket.id) {
            addOtherLasers(self, laserInfo);
        }
    });

    /*
    ~~~ Controls ~~~
    */

    const { LEFT, RIGHT, UP, SPACE, A, D, W } = Phaser.Input.Keyboard.KeyCodes;
    this.leftInput = new MultiKey(this, [LEFT, A]);
    this.rightInput = new MultiKey(this, [RIGHT, D]);
    this.forwardInput = new MultiKey(this, [UP, W]);
    this.spaceInput = new MultiKey(this, [SPACE]);
}

function update() {
    if (this.ship) {
        // Rotation
        if (this.leftInput.isDown()) {
            this.ship.setAngularVelocity(-150);
        } else if (this.rightInput.isDown()) {
            this.ship.setAngularVelocity(150);
        } else {
            this.ship.setAngularVelocity(0);
        }
        // Movement
        if (this.forwardInput.isDown()) {
            this.physics.velocityFromRotation(
                this.ship.rotation + 1.5, 100, this.ship.body.acceleration
            );
        } else {
            this.ship.setAcceleration(0);
        }
        // Shoot laser
        if (this.spaceInput.justDown()) {
            shootLaser(this);  // emits message 'laserFired'
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

/*
~~~ Functions for client's ship ~~~
*/
function addPlayer(self, playerInfo) {
    var spriteName = `${playerInfo.team}`;
    self.ship = new Spaceship(self, playerInfo.x, playerInfo.y, spriteName).ship;
    self.ship.laserGroup = new LaserGroup(self);
}

function shootLaser(self) {
    var dr = 20;
    var theta = self.ship.rotation + 90 * Math.PI / 180;
    var dx = dr * Math.cos(theta);
    var dy = dr * Math.sin(theta);
    self.ship.laserGroup.fireLaser(self.ship.x + dx, self.ship.y + dy, self.ship.rotation);
}

/*
~~~ Functions for other ships ~~~
*/
function addOtherPlayers(self, playerInfo) {
    // Create new player, and add to Group `otherPlayers`
    var spriteName = `${playerInfo.team}`
    const otherPlayer = self.physics.add.image(playerInfo.x, playerInfo.y, spriteName)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

function addOtherLasers(self, laserInfo) {
    // Create new laser and add to Group `otherLasers`
    var spriteName = `${laserInfo.team}` + 'Laser';
    const otherLaser = self.otherLasers.create(laserInfo.x, laserInfo.y, spriteName);
    // self.otherLasers.add(otherLaser);
    // ^ Note: for whatever reason, velocities must be set _after_ adding
    // the body to the group (otherwise they get reset to 0).
    otherLaser.setVelocityX(laserInfo.velocityX);
    otherLaser.setVelocityY(laserInfo.velocityY);
    otherLaser.rotation = laserInfo.rotation;
    otherLaser.team = laserInfo.team;
    // Destroy laser once it leaves the screen
    // This is achieved by activating collisions with world bounds, then destroying
    // the laser when a collision event is detected.
    otherLaser.setCollideWorldBounds(true);
    otherLaser.body.onWorldBounds = true;
    otherLaser.body.world.on('worldbounds', function(body) {
        // Check that object of collision is indeed the laser
        if (body.gameObject === otherLaser) {
            otherLaser.destroy();
        }
    }, otherLaser);
}
