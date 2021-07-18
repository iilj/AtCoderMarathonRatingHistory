import React, { useState, useEffect, useRef } from 'react';
import useFontFaceObserver from 'use-font-face-observer';
import * as PIXI from 'pixi.js';
import { LABEL_FONT_FAMILY, RATING_FONT_FAMILY } from './StatusCanvas';
import { RatingDistributionChartCanvas } from './RatingDistributionChartCanvas';

interface Props {
  xaxis: number[];
  data: number[];
  rating: number;
}

export const RatingDistributionGraph: React.FC<Props> = (props) => {
  const { xaxis, data, rating } = props;
  const isFontListLoaded = useFontFaceObserver([
    { family: RATING_FONT_FAMILY },
    { family: LABEL_FONT_FAMILY },
  ]);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<RatingDistributionChartCanvas>();

  useEffect(() => {
    const chartCanvas: HTMLCanvasElement | null = chartCanvasRef.current;
    if (chartCanvas === null) return;

    const _chartApp = new PIXI.Application({
      width: 640,
      height: 480,
      view: chartCanvas,
      antialias: true,
    });
    _chartApp.renderer.backgroundColor = 0xffffff;

    const _chartCanvas = new RatingDistributionChartCanvas(_chartApp);
    setCanvas(_chartCanvas);
  }, []);

  useEffect(() => {
    if (!isFontListLoaded) return;
    if (!data) return;
    if (!canvas) return;

    if (data.length === 0) {
      canvas.destroy();
      return;
    }
    canvas.init(xaxis, data, rating);
  }, [isFontListLoaded, data, canvas]);

  return (
    <>
      <div>
        <canvas
          style={{
            margin: '0px auto',
            maxWidth: '640px',
            maxHeight: '480px',
            height: '100%',
            width: '100%',
            display: 'block',
          }}
          ref={chartCanvasRef}
          width="640"
          height="480"
        ></canvas>
      </div>
    </>
  );
};
