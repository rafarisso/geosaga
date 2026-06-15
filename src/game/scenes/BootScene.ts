import Phaser from 'phaser';

/**
 * Cena de boot. Por enquanto não há assets (placeholders geométricos
 * são desenhados em runtime), mas é aqui que sprites, áudio e tilemaps
 * serão carregados no futuro.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.scene.start('Map');
  }
}
