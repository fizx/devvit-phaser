export class Ship extends Phaser.GameObjects.Container {
  graphics: Phaser.GameObjects.Graphics;
  body: Phaser.Physics.Arcade.Body;
  usernameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.graphics = scene.add.graphics({
      lineStyle: { width: 2, color: 0xffffff },
    });
    this.add(this.graphics);
    this.drawShip();

    this.usernameText = scene.add.text(0, -30, "", {
      color: "#ffffff",
      fontSize: "16px",
      align: "center",
    });
    this.usernameText.setOrigin(0.5, 0.5);
    this.add(this.usernameText);

    // Listen for container rotation and counter-rotate text
    scene.events.on("update", () => {
      this.usernameText.angle = -this.angle;
    });

    scene.physics.world.enable(this);
    this.body = this.body as Phaser.Physics.Arcade.Body;
    this.usernameText.setDepth(1).setRotation(0).setScrollFactor(0, 0);
  }

  setUsername(username: string) {
    this.usernameText.setText(username);
  }

  private drawShip() {
    this.graphics.clear();
    this.graphics.beginPath();
    this.graphics.moveTo(15, 0);
    this.graphics.lineTo(-15, 10);
    this.graphics.lineTo(-15, -10);
    this.graphics.lineTo(15, 0);
    this.graphics.strokePath();
  }
}
