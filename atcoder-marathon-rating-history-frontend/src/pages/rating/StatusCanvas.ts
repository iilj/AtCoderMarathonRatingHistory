import * as PIXI from 'pixi.js';
import { newGraphics, newText } from '../../utils/Shape';
import { getColor, getRatingPer } from '../../utils/Rating';
import { RatingHistoryEntry } from '../../interfaces/RatingHistoryEntry';
import { getOrdinal } from '../../utils';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';

export const LABEL_FONT_FAMILY = 'Lato';
export const RATING_FONT_FAMILY = 'Squada One';

const OFFSET_X = 50;
const OFFSET_Y = 5;
const STATUS_WIDTH = 640 - OFFSET_X - 10;
const STATUS_HEIGHT = 80 - OFFSET_Y - 5;

const STAR_MIN = 3200;
const PARTICLE_MIN = 3;
const PARTICLE_MAX = 20;
const LIFE_MAX = 30;

/**
 * 増減値を文字列に変換する
 * @param x 増減値
 * @returns 増減値を表す文字列
 */
const getDiff = (x: number): string => {
  const sign = x === 0 ? '±' : x < 0 ? '-' : '+';
  return `${sign}${Math.abs(x)}`;
};

class Particle {
  object: PIXI.Text;
  angle: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  rotateSpeed: number;
  life: number;
  initialX: number;
  initialY: number;

  constructor(statusContainer: PIXI.Container, x: number, y: number) {
    this.initialX = x;
    this.initialY = y;
    this.object = newText(statusContainer, 0, 0, LABEL_FONT_FAMILY, 64);
    this.angle = 0;
    this.speed = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotateSpeed = 0;
    this.life = 0;
    this.object.x = this.initialX;
    this.object.y = this.initialY;
  }

  set(color: number, alpha: number, useStar: boolean) {
    this.object.x = this.initialX;
    this.object.y = this.initialY;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 4 + 4;
    this.velocityX = Math.cos(this.angle) * this.speed;
    this.velocityY = Math.sin(this.angle) * this.speed;
    this.rotateSpeed = Math.random() * 20 + 10;
    this.life = LIFE_MAX;
    this.object.visible = true;
    this.object.style.fill = color;
    this.object.text = useStar ? '★' : '@';
    this.object.alpha = alpha;
  }

  disable() {
    this.life = 0;
    this.object.visible = false;
  }

  update() {
    if (this.life <= 0) {
      this.object.visible = false;
      return;
    }
    this.object.x += this.velocityX;
    this.velocityX *= 0.9;
    this.object.y += this.velocityY;
    this.velocityY *= 0.9;
    this.life--;
    this.object.scale.x = this.object.scale.y = this.life / LIFE_MAX;
    this.object.rotation += this.rotateSpeed;
  }
}

class Particles {
  particles: Particle[];

  constructor(statusContainer: PIXI.Container, x: number, y: number) {
    this.particles = [];
    for (let i = 0; i < PARTICLE_MAX; ++i) {
      this.particles.push(new Particle(statusContainer, x, y));
    }
  }

  set(num: number, color: number, alpha: number, rating: number) {
    const useStar = rating >= STAR_MIN;
    this.particles.forEach((particle, index) => {
      if (index < num) {
        particle.set(color, alpha, useStar);
      } else {
        particle.disable();
      }
    });
  }

  update() {
    this.particles.forEach((particle) => {
      if (particle.life > 0) {
        particle.update();
      }
    });
  }
}

export class StatusCanvas {
  app: PIXI.Application;
  statusContainer?: PIXI.Container;
  borderGraphics!: Graphics;
  ratingText!: PIXI.Text;
  placeText!: PIXI.Text;
  diffText!: PIXI.Text;
  dateText!: PIXI.Text;
  contestNameText!: PIXI.Text;

  particles?: Particles;
  standingsUrl: string;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.statusContainer = undefined;
    this.standingsUrl = '';

    this.app.ticker.maxFPS = 60;
    this.app.ticker.add(() => {
      this.animate();
    });
  }

  destroy(): void {
    if (this.statusContainer) {
      this.statusContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
      this.statusContainer = undefined;
    }
  }

  init(): void {
    this.destroy();
    this.statusContainer = new PIXI.Container();
    void this.app.stage.addChild(this.statusContainer);

    this.borderGraphics = newGraphics(this.statusContainer);
    this.ratingText = newText(
      this.statusContainer,
      OFFSET_X + 75,
      OFFSET_Y + STATUS_HEIGHT / 2,
      RATING_FONT_FAMILY,
      48
    );
    this.placeText = newText(
      this.statusContainer,
      OFFSET_X + 160,
      OFFSET_Y + STATUS_HEIGHT / 2.7,
      LABEL_FONT_FAMILY,
      16
    );
    this.diffText = newText(
      this.statusContainer,
      OFFSET_X + 160,
      OFFSET_Y + STATUS_HEIGHT / 1.5,
      LABEL_FONT_FAMILY,
      11
    );
    this.diffText.style.fill = 0x888888;
    this.dateText = newText(
      this.statusContainer,
      OFFSET_X + 200,
      OFFSET_Y + STATUS_HEIGHT / 4,
      LABEL_FONT_FAMILY,
      14
    );
    this.contestNameText = newText(
      this.statusContainer,
      OFFSET_X + 200,
      OFFSET_Y + STATUS_HEIGHT / 1.6,
      LABEL_FONT_FAMILY,
      20
    );
    this.dateText.anchor.x = 0.0;
    this.contestNameText.anchor.x = 0.0;
    if (this.contestNameText.width > STATUS_WIDTH - 200 - 10) {
      this.contestNameText.scale.x =
        (STATUS_WIDTH - 200 - 10) / this.contestNameText.width;
    }

    this.contestNameText.interactive = true;
    this.contestNameText.cursor = 'pointer';
    this.contestNameText.on('click', () => {
      window.location.href = this.standingsUrl;
    });

    this.particles = new Particles(
      this.statusContainer,
      this.ratingText.x,
      this.ratingText.y
    );
  }

  set(data: RatingHistoryEntry, particle_flag: boolean): void {
    if (!this.particles) return;
    const date = new Date(data.EndTime * 1000);
    const rating = data.NewRating,
      old_rating = data.OldRating;
    const place = data.Place;
    const contest_name = data.ContestName;
    const tmp = getColor(rating);
    const color = tmp[3],
      alpha = tmp[2];
    this.borderGraphics
      .clear()
      .lineStyle(1.0, color)
      .drawRoundedRect(OFFSET_X, OFFSET_Y, STATUS_WIDTH, STATUS_HEIGHT, 2);
    this.ratingText.text = String(rating);
    this.ratingText.style.fill = color;
    this.placeText.text = getOrdinal(place);
    this.diffText.text = getDiff(rating - old_rating);
    this.dateText.text = date.toLocaleDateString();
    this.contestNameText.text = contest_name;
    this.contestNameText.scale.x = 1.0;
    if (this.contestNameText.width > STATUS_WIDTH - 200 - 10) {
      this.contestNameText.scale.x =
        (STATUS_WIDTH - 200 - 10) / this.contestNameText.width;
    }
    if (particle_flag) {
      const particleNum = Math.floor(
        Math.pow(getRatingPer(rating), 2) * (PARTICLE_MAX - PARTICLE_MIN) +
          PARTICLE_MIN
      );
      this.particles.set(particleNum, color, alpha, rating);
    }
    this.standingsUrl = data.StandingsUrl;
  }

  animate(): void {
    if (!this.particles) return;
    this.particles.update();
  }
}
