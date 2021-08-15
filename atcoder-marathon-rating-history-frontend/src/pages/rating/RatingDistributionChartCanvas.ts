import * as PIXI from 'pixi.js';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import { getPer } from '../../utils';
import { newGraphics } from '../../utils/Shape';
import { getColor } from '../../utils/Rating';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';

const OFFSET_X = 40;
const OFFSET_Y = 20;
const MARGIN_Y_PER = 1.1;
const STEP = 20;
const PANEL_WIDTH = 640 - OFFSET_X - 12;
const PANEL_HEIGHT = 480 - OFFSET_Y - 30;

// additional
const LABEL_FONT_FAMILY = 'Lato';

export class RatingDistributionChartCanvas {
  app: PIXI.Application;
  chartContainer?: PIXI.Container;
  chartGraphics?: Graphics;
  labelTextStyle!: PIXI.TextStyle;

  n!: number;
  xaxis!: number[];
  data!: number[];
  rating!: number;

  yMax!: number;

  lineGraphics?: Graphics;
  ratingText?: PIXI.Text;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.chartContainer = undefined;
    // void this.init();
  }

  destroy(): void {
    if (this.chartContainer) {
      this.chartContainer.destroy({
        children: true,
        texture: true,
        baseTexture: true,
      });
      this.chartContainer = undefined;
    }
  }

  init(xaxis: number[], data: number[], rating: number): void {
    this.destroy();
    this.chartContainer = new PIXI.Container();
    void this.app.stage.addChild(this.chartContainer);

    if (data.length !== xaxis.length) {
      throw new Error('長さ不一致');
    }
    this.xaxis = xaxis;
    this.data = data;
    this.rating = rating;

    this.n = data.length;
    if (this.n == 0) return;
    this.xaxis.push(this.xaxis[this.n - 1] + 100);

    this.yMax =
      this.data.reduce((prev, curr) => Math.max(prev, curr), 0) * MARGIN_Y_PER;

    this.labelTextStyle = new PIXI.TextStyle({
      fontFamily: LABEL_FONT_FAMILY,
      fontSize: 12,
      fill: 0x000000,
    });

    void this.initBackground();
    void this.initChart();
  }

  initBackground(): void {
    if (this.chartContainer === undefined) return;

    const panelGraphics = newGraphics(this.chartContainer);
    panelGraphics.x = OFFSET_X;
    panelGraphics.y = OFFSET_Y;
    panelGraphics.alpha = 0.3;
    const borderGraphics = newGraphics(this.chartContainer);
    borderGraphics.x = OFFSET_X;
    borderGraphics.y = OFFSET_Y;

    const newLabelY = (s: string, y: number): PIXI.Text => {
      const t = new PIXI.Text(s, this.labelTextStyle);
      t.x = OFFSET_X - 10;
      t.y = OFFSET_Y + y;
      t.anchor.x = 1.0;
      t.anchor.y = 0.5;
      if (this.chartContainer === undefined) return t;
      return this.chartContainer.addChild(t);
    };

    const newLabelX = (s: string, x: number): PIXI.Text => {
      const t = new PIXI.Text(
        s,
        new PIXI.TextStyle({
          fontFamily: LABEL_FONT_FAMILY,
          fontSize: 10,
          fill: 0x000000,
        })
      );
      t.x = OFFSET_X + x;
      t.y = OFFSET_Y + PANEL_HEIGHT + 3;
      t.anchor.x = 0.0;
      t.anchor.y = 0.5;
      t.angle = 90;
      if (this.chartContainer === undefined) return t;
      return this.chartContainer.addChild(t);
    };

    // y 軸ラベルとグリッド線を追加する
    borderGraphics.lineStyle(1.0, 0xdddddd);
    for (let i = STEP; i < this.yMax; i += STEP) {
      const y = PANEL_HEIGHT - PANEL_HEIGHT * getPer(i, 0, this.yMax);
      borderGraphics.moveTo(0, y).lineTo(PANEL_WIDTH, y);
      newLabelY(String(i), y);
    }

    // x 軸ラベルを追加する
    for (let i = 0; i < this.n; i += 2) {
      const x = PANEL_WIDTH * getPer(i, 0, this.n);
      newLabelX(String(this.xaxis[i]), x);
    }

    borderGraphics
      .lineStyle(1.5, 0x888888)
      .drawRoundedRect(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 2);
  }

  newText(
    parent: Graphics,
    x: number,
    y: number,
    font: PIXI.TextStyle
  ): PIXI.Text {
    const t = new PIXI.Text('', font);
    t.x = x;
    t.y = y;
    t.anchor.x = 0.5;
    t.anchor.y = 0.5;
    parent.addChild(t);
    return t;
  }

  initChart(): void {
    if (this.chartContainer === undefined) return;

    this.chartGraphics = newGraphics(this.chartContainer);
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = 0x000000;
    dropShadowFilter.alpha = 0.3;
    dropShadowFilter.distance = Math.hypot(1, 2);
    dropShadowFilter.angle = Math.atan2(1, 2);
    dropShadowFilter.blur = 3;
    this.chartGraphics.filters = [dropShadowFilter];

    // マウスオーバー時に表示する線と数字を用意する
    const countText = this.newText(
      this.chartGraphics,
      0,
      0,
      new PIXI.TextStyle({
        fontFamily: LABEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0x000000,
      })
    );
    countText.visible = false;
    const countGraphics = newGraphics(this.chartContainer);
    countGraphics
      .lineStyle(1.0, 0xdddddd)
      .moveTo(0, 20)
      .lineTo(0, PANEL_HEIGHT);
    countGraphics.y = OFFSET_Y;
    countGraphics.visible = false;
    const mouseover = (i: number): void => {
      const x = OFFSET_X + PANEL_WIDTH * getPer(i + 0.5, 0, this.n);
      countText.text = `${this.data[i]}`;
      countText.style.fill = getColor(this.xaxis[i])[1];
      countText.x = x;
      countText.y = OFFSET_Y + 10;
      countGraphics.x = x;
      countText.visible = true;
      countGraphics.visible = true;
    };
    const mouseout = (): void => {
      countText.visible = false;
      countGraphics.visible = false;
    };

    // ヒストグラム本体を描画する
    for (let i = 0; i < this.n; ++i) {
      const histogramGraphics = newGraphics(this.chartGraphics);

      const rectHeight = PANEL_HEIGHT * getPer(this.data[i], 0, this.yMax);

      const x0 = Math.floor(OFFSET_X + PANEL_WIDTH * getPer(i, 0, this.n));
      const x1 = Math.floor(OFFSET_X + PANEL_WIDTH * getPer(i + 1, 0, this.n));
      histogramGraphics.x = x0;
      histogramGraphics.y = OFFSET_Y + PANEL_HEIGHT - rectHeight;
      histogramGraphics
        .lineStyle(0.5, 0xffffff)
        .beginFill(getColor(this.xaxis[i])[3])
        .drawRect(0, 0, x1 - x0 - 1, rectHeight);

      const hitAreaRect = new PIXI.Rectangle(
        0,
        +rectHeight - PANEL_HEIGHT,
        PANEL_WIDTH / this.n,
        PANEL_HEIGHT
      );
      histogramGraphics.hitArea = hitAreaRect;
      histogramGraphics.interactive = true;
      histogramGraphics.on('mouseover', () => {
        mouseover(i);
      });
      histogramGraphics.on('mouseout', () => {
        mouseout();
      });
    }

    // ユーザのレーティングを表す線を描画する
    void this.initUserRatingLine(this.rating);
  }

  getXandColor(rating: number): [number, number] {
    let x = PANEL_WIDTH;
    let col = 0x000000;
    for (let i = this.n - 1; i >= 0; i--) {
      if (this.xaxis[i] <= rating) {
        const per = getPer(rating + 0.5, this.xaxis[i], this.xaxis[i + 1]);
        x = PANEL_WIDTH * getPer(i + per, 0, this.n);
        col = getColor(this.xaxis[i])[3];
        break;
      }
    }
    return [x, col];
  }

  initUserRatingLine(rating: number): void {
    if (this.chartContainer === undefined) return;
    if (this.chartGraphics === undefined) return;

    const [x, col] = this.getXandColor(rating);
    this.lineGraphics = newGraphics(this.chartContainer);
    this.lineGraphics
      .lineStyle(1.0, 0x000000)
      .moveTo(0, 0)
      .lineTo(0, PANEL_HEIGHT);
    this.lineGraphics.x = OFFSET_X + x;
    this.lineGraphics.y = OFFSET_Y;
    this.ratingText = this.newText(
      this.chartGraphics,
      OFFSET_X + x,
      12,
      new PIXI.TextStyle({
        fontFamily: LABEL_FONT_FAMILY,
        fontSize: 11,
        fill: col,
      })
    );
    this.ratingText.text = String(rating);
  }

  updateUserRatingLine(rating: number): void {
    this.rating = rating;
    if (this.lineGraphics === undefined) return;
    if (this.ratingText === undefined) return;

    this.lineGraphics.x = OFFSET_X + this.getXandColor(rating)[0];
    this.ratingText.text = String(rating);
  }
}
