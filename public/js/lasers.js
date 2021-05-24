class LaserGroup extends Phaser.Physics.Arcade.Group
{
    constructor(scene) {
        super(scene.physics.world, scene);

        // Initialise group
        if (scene.ship) {
            var team = scene.ship.team;
            var laserSpriteKey = 'laser' + team.charAt(0).toUpperCase() + team.slice(1)
        } else {
            var laserSpriteKey = null;
        }
        
        this.createMultiple({
            classType: Laser,
            frameQuantity: 3,
            active: false,
            visible: false,
            key: laserSpriteKey
        })
    }

    fireLaser(x, y, rotation) {
        // Get the first available sprite in the group
        const laser = this.getFirstDead(false);
        if (laser) {
            laser.fire(x, y, rotation);
        }
    }
}

class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        var team = scene.ship.team;
        var laserSpriteKey = 'laser' + team.charAt(0).toUpperCase() + team.slice(1)
        super(scene, x, y, laserSpriteKey);
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
