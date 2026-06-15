import Phaser from 'phaser';
import { REGION_LIST } from '../../data/regions';
import type { Region } from '../../data/types';
import { EVENTS, gameEvents, type QuizClosedPayload } from '../events';

const MARKER_RADIUS = 56;

/**
 * Mapa do Brasil com as cinco regiões como marcadores geométricos
 * (sem imagens com copyright). Clicar numa região liberada abre o
 * quiz na camada React via gameEvents.
 */
export class MapScene extends Phaser.Scene {
  private masteredRegions = new Set<string>();

  constructor() {
    super('Map');
  }

  create() {
    const { width } = this.scale;

    this.add
      .text(width / 2, 40, 'Escolha uma região para enfrentar o guardião', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#e8f5e9',
      })
      .setOrigin(0.5);

    REGION_LIST.forEach((region) => this.drawRegion(region));

    const onQuizClosed = (payload: QuizClosedPayload) => {
      if (payload.passed) {
        this.masteredRegions.add(payload.region);
        this.scene.restart();
      }
    };
    gameEvents.on(EVENTS.QUIZ_CLOSED, onQuizClosed);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off(EVENTS.QUIZ_CLOSED, onQuizClosed);
    });
  }

  private drawRegion(region: Region) {
    const mastered = this.masteredRegions.has(region.id);
    const locked = !region.unlocked && !mastered;

    const circle = this.add.circle(region.mapX, region.mapY, MARKER_RADIUS, region.color);
    circle.setStrokeStyle(4, mastered ? 0xffd700 : 0xffffff, locked ? 0.3 : 0.9);
    circle.setAlpha(locked ? 0.35 : 1);

    this.add
      .text(region.mapX, region.mapY - 10, region.name, {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(locked ? 0.5 : 1);

    this.add
      .text(region.mapX, region.mapY + 14, locked ? '🔒' : region.guardian.name, {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(locked ? 0.6 : 0.9);

    if (mastered) {
      this.add
        .text(region.mapX, region.mapY + MARKER_RADIUS + 16, '★ Mestre', {
          fontFamily: 'sans-serif',
          fontSize: '14px',
          color: '#ffd700',
        })
        .setOrigin(0.5);
    }

    if (locked || mastered) return;

    circle.setInteractive({ useHandCursor: true });
    circle.on(Phaser.Input.Events.POINTER_OVER, () => {
      this.tweens.add({ targets: circle, scale: 1.12, duration: 120 });
    });
    circle.on(Phaser.Input.Events.POINTER_OUT, () => {
      this.tweens.add({ targets: circle, scale: 1, duration: 120 });
    });
    circle.on(Phaser.Input.Events.POINTER_UP, () => {
      gameEvents.emit(EVENTS.REGION_SELECTED, region.id);
    });
  }
}
