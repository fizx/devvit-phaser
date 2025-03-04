export class Asteroid extends Phaser.GameObjects.Container {
  graphics: Phaser.GameObjects.Graphics;
  body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.graphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0xffffff },
    });
    this.add(this.graphics);
    this.drawAsteroid();

    // Initialize physics body
    scene.physics.world.enable(this);
    this.body = this.body as Phaser.Physics.Arcade.Body;
  }

  private drawAsteroid() {
    this.graphics.clear();
    this.graphics.beginPath();
    const points = 8;
    const radius = 20;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const variation = Phaser.Math.FloatBetween(0.8, 1.2);
      const x = Math.cos(angle) * radius * variation;
      const y = Math.sin(angle) * radius * variation;
      if (i === 0) {
        this.graphics.moveTo(x, y);
      } else {
        this.graphics.lineTo(x, y);
      }
    }
    this.graphics.closePath();
    this.graphics.strokePath();
  }
}
