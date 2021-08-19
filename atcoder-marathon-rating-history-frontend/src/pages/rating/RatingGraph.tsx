import React, { useState, useEffect, useRef } from 'react';
import useFontFaceObserver from 'use-font-face-observer';
import * as PIXI from 'pixi.js';
import { RatingHistoryEntryEx } from '../../interfaces/RatingHistoryEntry';
import { ChartCanvas, ChartCanvasMode } from './ChartCanvas';
import {
  StatusCanvas,
  LABEL_FONT_FAMILY,
  RATING_FONT_FAMILY,
} from './StatusCanvas';

interface Props {
  ratingHistory?: RatingHistoryEntryEx[];
  paramUser: string;
  mode: ChartCanvasMode;
}

export const RatingGraph: React.FC<Props> = (props) => {
  const { ratingHistory, mode } = props;
  const isFontListLoaded = useFontFaceObserver([
    { family: RATING_FONT_FAMILY },
    { family: LABEL_FONT_FAMILY },
  ]);
  const statusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvases, setCanvases] = useState<[StatusCanvas, ChartCanvas]>();

  const R = 1.0;
  useEffect(() => {
    const statusCanvas: HTMLCanvasElement | null = statusCanvasRef.current;
    const chartCanvas: HTMLCanvasElement | null = chartCanvasRef.current;
    if (statusCanvas === null || chartCanvas === null) return;

    const _statusApp = new PIXI.Application({
      width: 640,
      height: 80,
      view: statusCanvas,
      antialias: true,
    });
    const _chartApp = new PIXI.Application({
      width: 640 * R,
      height: 360 * R,
      view: chartCanvas,
      antialias: true,
    });

    _statusApp.renderer.backgroundColor = 0xffffff;
    _chartApp.renderer.backgroundColor = 0xffffff;

    const _statusCanvas = new StatusCanvas(_statusApp, mode);
    const _chartCanvas = new ChartCanvas(_chartApp, mode);

    // _statusCanvas.init();
    setCanvases([_statusCanvas, _chartCanvas]);
  }, []);

  useEffect(() => {
    if (!isFontListLoaded) return;
    if (!ratingHistory) return;
    if (!canvases) return;

    const [statusCanvas, chartCanvas] = canvases;
    if (ratingHistory.length === 0) {
      chartCanvas.destroy();
      statusCanvas.destroy();
      return;
    }
    const lastHistory = ratingHistory[ratingHistory.length - 1];

    statusCanvas.init();
    chartCanvas.init(ratingHistory, statusCanvas);
    statusCanvas.set(lastHistory, false);
  }, [isFontListLoaded, ratingHistory, canvases]);

  return (
    <>
      <div>
        <canvas
          style={{
            margin: '0px auto',
            maxWidth: '640px',
            maxHeight: '80px',
            height: '100%',
            width: '100%',
            display: 'block',
          }}
          ref={statusCanvasRef}
          width="640"
          height="80"
        ></canvas>
      </div>
      <div>
        <canvas
          style={{
            margin: '0px auto',
            maxWidth: '640px',
            maxHeight: '360px',
            height: '100%',
            width: '100%',
            display: 'block',
          }}
          ref={chartCanvasRef}
          width="640"
          height="360"
        ></canvas>
      </div>
    </>
  );
};
