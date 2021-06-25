import * as PIXI from 'pixi.js';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import { StatusCanvas } from './StatusCanvas';
import { newGraphics } from '../../utils/Shape';
import { COLORS, STEP_SIZE, getColor } from '../../utils/Rating';
import { RatingHistoryEntry } from '../../interfaces/RatingHistoryEntry';

const MARGIN_VAL_X = 86400 * 30;
const MARGIN_VAL_Y_LOW = 100;
const MARGIN_VAL_Y_HIGH = 300;
const OFFSET_X = 50;
const OFFSET_Y = 5;
const PANEL_WIDTH = 640 - OFFSET_X - 10;
const PANEL_HEIGHT = 360 - OFFSET_Y - 30;
const HIGHEST_WIDTH = 80;
const HIGHEST_HEIGHT = 20;
const START_YEAR = 2010;
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const YEAR_SEC = 86400 * 365;

// additional
const LABEL_FONT_FAMILY = 'Lato';

const getPer = (x: number, l: number, r: number): number => {
  return (x - l) / (r - l);
};

export class ChartCanvas {
  app: PIXI.Application;
  chartContainer?: PIXI.Container;
  x_min!: number;
  x_max!: number;
  y_min!: number;
  y_max!: number;
  labelTextStyle!: PIXI.TextStyle;
  R!: number;

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

  init(ratingHistory: RatingHistoryEntry[], statusCanvas: StatusCanvas): void {
    this.destroy();
    this.chartContainer = new PIXI.Container();
    void this.app.stage.addChild(this.chartContainer);

    this.R = 1.0;

    this.x_min = 100000000000;
    this.x_max = 0;
    this.y_min = 10000;
    this.y_max = 0;
    ratingHistory.forEach((ratingHistoryEntry) => {
      this.x_min = Math.min(this.x_min, ratingHistoryEntry.EndTime);
      this.x_max = Math.max(this.x_max, ratingHistoryEntry.EndTime);
      this.y_min = Math.min(this.y_min, ratingHistoryEntry.NewRating);
      this.y_max = Math.max(this.y_max, ratingHistoryEntry.NewRating);
    });
    this.x_min -= MARGIN_VAL_X;
    this.x_max += MARGIN_VAL_X;
    this.y_min = Math.min(1500, Math.max(0, this.y_min - MARGIN_VAL_Y_LOW));
    this.y_max += MARGIN_VAL_Y_HIGH;

    this.labelTextStyle = new PIXI.TextStyle({
      fontFamily: LABEL_FONT_FAMILY,
      fontSize: 12 * this.R,
      fill: 0x000000,
    });

    void this.initBackground();
    void this.initChart(ratingHistory, statusCanvas);
  }

  initBackground(): void {
    if (this.chartContainer === undefined) return;

    const panelGraphics = new PIXI.Graphics();
    panelGraphics.x = OFFSET_X * this.R;
    panelGraphics.y = OFFSET_Y * this.R;
    panelGraphics.alpha = 0.3;
    const borderGraphics = new PIXI.Graphics();
    borderGraphics.x = OFFSET_X * this.R;
    borderGraphics.y = OFFSET_Y * this.R;

    void this.chartContainer.addChild(panelGraphics);
    void this.chartContainer.addChild(borderGraphics);

    // 背景色を塗る
    let y1 = 0;
    for (let i = COLORS.length - 1; i >= 0; i--) {
      const y2 =
        PANEL_HEIGHT -
        PANEL_HEIGHT * getPer(COLORS[i][0], this.y_min, this.y_max);
      if (y2 > 0 && y1 < PANEL_HEIGHT) {
        y1 = Math.max(y1, 0);
        panelGraphics
          .beginFill(COLORS[i][3])
          .drawRect(
            0,
            y1 * this.R,
            PANEL_WIDTH * this.R,
            (Math.min(y2, PANEL_HEIGHT) - y1) * this.R
          )
          .endFill();
      }
      y1 = y2;
    }

    const newLabelY = (s: string, y: number): PIXI.Text => {
      const t = new PIXI.Text(s, this.labelTextStyle);
      t.x = (OFFSET_X - 10) * this.R;
      t.y = (OFFSET_Y + y) * this.R;
      t.anchor.x = 1.0;
      t.anchor.y = 0.5;
      if (this.chartContainer === undefined) return t;
      return this.chartContainer.addChild(t);
    };

    const newLabelX = (s: string, x: number, y: number): PIXI.Text => {
      const t = new PIXI.Text(s, this.labelTextStyle);
      t.x = (OFFSET_X + x) * this.R;
      t.y = (OFFSET_Y + PANEL_HEIGHT + 2 + y) * this.R;
      t.anchor.x = 0.5;
      t.anchor.y = 0.0;
      if (this.chartContainer === undefined) return t;
      return this.chartContainer.addChild(t);
    };

    // y 軸ラベルとグリッド線を追加する
    for (let i = 0; i <= this.y_max; i += STEP_SIZE) {
      if (i >= this.y_min) {
        const y =
          PANEL_HEIGHT - PANEL_HEIGHT * getPer(i, this.y_min, this.y_max);
        void newLabelY(String(i), y);
        borderGraphics.lineStyle(1.0 * this.R, 0xffffff);
        if (i === 2000) borderGraphics.lineStyle(1.0 * this.R, 0x000000);
        borderGraphics
          .moveTo(0, y * this.R)
          .lineTo(PANEL_WIDTH * this.R, y * this.R);
      }
    }
    borderGraphics.lineStyle(1.0 * this.R, 0xffffff);

    // x 軸ラベルとグリッド線を追加する
    let month_step = 6;
    for (let i = 3; i >= 1; i--) {
      if (this.x_max - this.x_min <= YEAR_SEC * i + MARGIN_VAL_X * 2)
        month_step = i;
    }
    let isFirst = true;
    for (let i = START_YEAR; i < 3000; i++) {
      let isEnded = false;
      for (let j = 0; j < 12; j += month_step) {
        const month = `0${j + 1}`.slice(-2);
        const unix = Date.parse(`${i}-${month}-01T00:00:00`) / 1000;
        if (this.x_min < unix && unix < this.x_max) {
          const x = PANEL_WIDTH * getPer(unix, this.x_min, this.x_max);
          if (j === 0 || isFirst) {
            void newLabelX(MONTH_NAMES[j], x, 0);
            void newLabelX(String(i), x, 13);
            isFirst = false;
          } else {
            void newLabelX(MONTH_NAMES[j], x, 0);
          }
          borderGraphics
            .moveTo(x * this.R, 0)
            .lineTo(x * this.R, PANEL_HEIGHT * this.R);
        }
        if (unix > this.x_max) {
          isEnded = true;
          break;
        }
      }
      if (isEnded) break;
    }
    borderGraphics
      .lineStyle(1.5 * this.R, 0x888888)
      .drawRoundedRect(
        0,
        0,
        PANEL_WIDTH * this.R,
        PANEL_HEIGHT * this.R,
        2 * this.R
      );
  }

  initChart(
    ratingHistory: RatingHistoryEntry[],
    statusGraphics: StatusCanvas
  ): void {
    if (this.chartContainer === undefined) return;

    const chartGraphics = new PIXI.Graphics();
    this.chartContainer.addChild(chartGraphics);
    // chart_container.shadow = new cj.Shadow("rgba(0,0,0,0.3)", 1, 2, 3);
    const dropShadowFilter = new DropShadowFilter();
    dropShadowFilter.color = 0x000000;
    dropShadowFilter.alpha = 0.3;
    dropShadowFilter.distance = Math.hypot(1, 2) * this.R;
    dropShadowFilter.angle = Math.atan2(1, 2);
    dropShadowFilter.blur = 3 * this.R;
    chartGraphics.filters = [dropShadowFilter];

    const lineGraphics = newGraphics(chartGraphics);
    const highestGraphics = newGraphics(chartGraphics);
    highestGraphics.interactive = true;

    const mouseoverVertex = (i: number): void => {
      vertexGraphics[i].scale.x = vertexGraphics[i].scale.y = 1.2;
      statusGraphics.set(ratingHistory[i], true);
    };

    const mouseoutVertex = (i: number): void => {
      vertexGraphics[i].scale.x = vertexGraphics[i].scale.y = 1;
    };
    const { argmax: highestIdx } = ratingHistory.reduce(
      ({ argmax, maxRating }, ratingHistoryEntry, index) => {
        if (ratingHistoryEntry.NewRating > maxRating) {
          argmax = index;
          maxRating = ratingHistoryEntry.NewRating;
        }
        return { argmax, maxRating };
      },
      { argmax: 0, maxRating: 0 }
    );

    const vertexGraphics = ratingHistory.map((ratingHistoryEntry, index) => {
      const vertex = newGraphics(chartGraphics);
      vertex.lineStyle(1.0 * this.R, 0xffffff);
      if (index === highestIdx) vertex.lineStyle(1.0 * this.R, 0x000000);
      vertex
        .beginFill(getColor(ratingHistoryEntry.NewRating)[3])
        .drawCircle(0, 0, 3.5 * this.R);
      vertex.x =
        (OFFSET_X +
          PANEL_WIDTH *
            getPer(ratingHistoryEntry.EndTime, this.x_min, this.x_max)) *
        this.R;
      vertex.y =
        (OFFSET_Y +
          (PANEL_HEIGHT -
            PANEL_HEIGHT *
              getPer(ratingHistoryEntry.NewRating, this.y_min, this.y_max))) *
        this.R;
      vertex.interactive = true;
      vertex.on('mouseover', () => {
        mouseoverVertex(index);
      });
      vertex.on('mouseout', () => {
        mouseoutVertex(index);
      });
      return vertex;
    });
    {
      let dx = 80 * this.R;
      if ((this.x_min + this.x_max) / 2 < ratingHistory[highestIdx].EndTime)
        dx = -80 * this.R;
      const x = vertexGraphics[highestIdx].x + dx;
      const y = vertexGraphics[highestIdx].y - 16;
      highestGraphics
        .lineStyle(1.0 * this.R, 0xffffff)
        .moveTo(vertexGraphics[highestIdx].x, vertexGraphics[highestIdx].y)
        .lineTo(x, y);
      highestGraphics
        .lineStyle(1.0 * this.R, 0x888888)
        .beginFill(0xffffff)
        .drawRoundedRect(
          x - (HIGHEST_WIDTH / 2) * this.R,
          y - (HIGHEST_HEIGHT / 2) * this.R,
          HIGHEST_WIDTH * this.R,
          HIGHEST_HEIGHT * this.R,
          2 * this.R
        );
      const highest_text = new PIXI.Text(
        `Highest: ${ratingHistory[highestIdx].NewRating}`,
        this.labelTextStyle
      );
      highest_text.x = x;
      highest_text.y = y;
      highest_text.anchor.x = 0.5;
      highest_text.anchor.y = 0.5;
      this.chartContainer.addChild(highest_text);

      highestGraphics.on('mouseover', () => {
        mouseoverVertex(highestIdx);
      });
      highestGraphics.on('mouseout', () => {
        mouseoutVertex(highestIdx);
      });
    }
    // 折れ線を描画
    (
      [
        [2.0, 0xaaaaaa],
        [1.0, 0xffffff],
      ] as [number, number][]
    ).forEach(([width, color]) => {
      lineGraphics.lineStyle(width * this.R, color);
      lineGraphics.moveTo(vertexGraphics[0].x, vertexGraphics[0].y);
      vertexGraphics.forEach((vertex) => {
        lineGraphics.lineTo(vertex.x, vertex.y);
      });
    });
  }
}
