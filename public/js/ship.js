import { LaserGroup } from "./lasers.js";

class Spaceship {
    constructor(scene, x, y, spriteName) {
        this.scene = scene;

        // Create spaceship
        this.ship = this.scene.physics.add.image(x, y, spriteName)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(53, 40);
        this.ship.setDrag(100);
        this.ship.setAngularDrag(100);
        this.ship.setMaxVelocity(200);
        this.ship.team = spriteName;

        // Add collisions with lasers and other spaceships
        this.scene.physics.add.overlap(this.ship, this.scene.otherLasers, function (ship, lasers) {
            console.log("Collision detected!")
                // TODOs:
                // * Destroy ship, play animation
                // * Respawn player after animation completes
                // * Remove laser (i.e. make inactive, invisible)
                // * Update killing score for player who scored kill
                // * Emit events for all of these
        });

        // Animations
        const anims = scene.anims;
    }

    update() {

    }
}

export { Spaceship };
