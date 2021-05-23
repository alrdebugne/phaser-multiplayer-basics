/*
A small class to allow multiple keys to treated as one input.
Example: let player user either directional keys or WASD controls:
```javascript
var leftInput = new MultiKey(scene, [LEFT, A]);
```
*/

class MultiKey {
  constructor(scene, keys) {
    if (!Array.isArray(keys)) keys = [keys];
    this.keys = keys.map(key => scene.input.keyboard.addKey(key));
  }

  // Are any of the keys down?
  isDown() {
    return this.keys.some(key => key.isDown);
  }

  // Same, but fire only once
  justDown() {
    return this.keys.some(key => Phaser.Input.Keyboard.JustDown(key));
  }

  // Are all of the keys up?
  isUp() {
    return this.keys.every(key => key.isUp);
  }
};

export { MultiKey };
