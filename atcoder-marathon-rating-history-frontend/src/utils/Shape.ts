import * as PIXI from 'pixi.js';
import { SmoothGraphics as Graphics } from '@pixi/graphics-smooth';

export const newGraphics = (
  parent: PIXI.Graphics | PIXI.Container
): Graphics => {
  const s = new Graphics();
  parent.addChild(s);
  return s;
};

export const newText = (
  parent: PIXI.Container,
  x: number,
  y: number,
  font: string,
  fontSize: number
): PIXI.Text => {
  const t = new PIXI.Text(
    '',
    new PIXI.TextStyle({
      fontFamily: font,
      fontSize: fontSize,
      fill: 0x000000,
    })
  );
  t.x = x;
  t.y = y;
  t.anchor.x = 0.5;
  t.anchor.y = 0.5;
  parent.addChild(t);
  return t;
};
