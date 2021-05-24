class LaserGroup extends Phaser.Physics.Arcade.Group
{
    constructor(scene) {
        super(scene.physics.world, scene);

        // Initialise group
        if (scene.ship) {
            this.team = scene.ship.team;
            this.laserSpriteKey = this.team + 'Laser';
        } else {
            this.laserSpriteKey = null;
        }
        
        this.createMultiple({
            classType: Laser,
            frameQuantity: 3,
            active: false,
            visible: false,
            key: this.laserSpriteKey
        });
        // ^ max. of 3 laser on-screen at once
        // (refreshed on leaving screen)
    }

    fireLaser(x, y, rotation) {
        // Get the first available sprite in the group
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y, rotation);
            // Emit message that laser was fired
            this.scene.socket.emit('laserFired', {
                x: laser.x,
                y: laser.y,
                velocityX: laser.body.velocity.x,
                velocityY: laser.body.velocity.y,
                rotation: laser.rotation,
                socketId: this.scene.socket.id,
                team: laser.team
            });
        }
    }
}

class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, scene.ship.team + 'Laser');
        this.team = this.scene.ship.team;
    }

    fire(x, y, rotation) {
        this.body.reset(x, y);

        // Turn sprite on, and rotate
        this.setActive(true);
        this.setVisible(true);
        this.rotation = rotation;

        // Shoot laser in direction facing spaceship
        var speed = new Phaser.Math.Vector2();
        speed.setToPolar(rotation + 90 * Math.PI / 180);
        // ^ align axes
        this.setVelocityX(speed.x * 500);
        this.setVelocityY(speed.y * 500);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Set laser to inactive once it leaves the screen
        var window = this.scene.window;
        if (this.y < 0 || this.y > window.innerHeight || this.x < 0 || this.x > window.innerWidth) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export { LaserGroup };
