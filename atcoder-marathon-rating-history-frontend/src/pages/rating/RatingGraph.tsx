import React, { useState, useEffect, useRef } from 'react';
import useFontFaceObserver from 'use-font-face-observer';
import * as PIXI from 'pixi.js';
import { TwitterIcon, TwitterShareButton } from 'react-share';
import { RatingHistoryEntry } from '../../interfaces/RatingHistoryEntry';
import { ChartCanvas } from './ChartCanvas';
import { StatusCanvas, RATING_FONT_FAMILY } from './StatusCanvas';
import { getOrdinal } from '../../utils';
import { UncontrolledTooltip } from 'reactstrap';

interface Props {
  ratingHistory?: RatingHistoryEntry[];
  paramUser: string;
}

export const RatingGraph: React.FC<Props> = (props) => {
  const { paramUser, ratingHistory } = props;
  const isFontListLoaded = useFontFaceObserver([
    { family: RATING_FONT_FAMILY },
  ]);
  const statusCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvases, setCanvases] = useState<[StatusCanvas, ChartCanvas]>();
  const [tweetTitle, setTweetTitle] = useState('');

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

    const _statusCanvas = new StatusCanvas(_statusApp);
    const _chartCanvas = new ChartCanvas(_chartApp);

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

  useEffect(() => {
    if (!ratingHistory) return;
    const lastHistory = ratingHistory[ratingHistory.length - 1];
    const rank = lastHistory.Place;
    const _tweetTitle =
      `${paramUser} took ${getOrdinal(rank)} place in ${
        lastHistory.ContestName
      }!\n` + `AtCoder Marathon Rating History`;
    setTweetTitle(_tweetTitle);
  }, [paramUser, ratingHistory]);

  return (
    <>
      <div style={{ marginTop: '20px' }}>
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
      </div>
      <div style={{ textAlign: 'center' }}>
        <TwitterShareButton
          url={window.location.href}
          title={tweetTitle}
          id="chart-share-button"
        >
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <UncontrolledTooltip placement="top" target="chart-share-button">
          {(tweetTitle + ' ' + window.location.href).replaceAll('\n', ' ')}
        </UncontrolledTooltip>
      </div>
    </>
  );
};
