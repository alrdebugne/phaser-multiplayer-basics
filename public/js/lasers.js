class LaserGroup extends Phaser.Physics.Arcade.Group
{
    constructor(scene, spaceship) {
        super(scene.physics.world, scene);

        if (spaceship) {
            var team = spaceship.team;
            var teamCapitalised = team.charAt(0).toUpperCase() + team.slice(1);
        } else {
            var teamCapitalised = null;
        }
        // Initialise group
        this.createMultiple({
            classType: Laser,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: 'laser'
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
        super(scene, x, y, 'laserRed');
    }

    fire(x, y, rotation) {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        // Shoot laser in direction facing spaceship
        var speed = new Phaser.Math.Vector2();
        speed.setToPolar(rotation + 90 * Math.PI / 180);
        // ^ align axes
        this.setVelocityX(speed.x * 800);
        this.setVelocityY(speed.y * 800);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        const cond = false;
        if (cond) {
            this.setActive(false);
            this.setVisible(false);
        }
        // ^ TODO: replace with viable condition to allow user to
        // to refill lasers after a while
    }
}

export { LaserGroup };
