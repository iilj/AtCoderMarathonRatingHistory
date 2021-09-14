import React, { useEffect, useState } from 'react';

import { Button, ButtonGroup, UncontrolledTooltip } from 'reactstrap';
import { TwitterIcon, TwitterShareButton } from 'react-share';
import { RatingHistoryEntryEx } from '../../interfaces/RatingHistoryEntry';
import { RatingRanks } from '../../utils/Rating';
import { RatingDistributionGraph } from './RatingDistributionGraph';
import { RatingGraph } from './RatingGraph';
import { getDiff, getHashtagSet, getOrdinal } from '../../utils';

interface Props {
  paramUser: string;
  ratingHistory?: RatingHistoryEntryEx[];
  ratingRanks: RatingRanks;
}

enum ChartTab {
  'rating' = 0,
  'performance' = 1,
  'ratingDistribution' = 2,
}

const ChartWrapper: React.FC<{
  display: boolean;
}> = (props) => <>{props.display ? props.children : <></>}</>;

const getDiffText = (x: number): string => {
  const face = x === 0 ? ':|' : x < 0 ? ':(' : ':)';
  return `(${getDiff(x)}) ${face}`;
};

export const ChartSection: React.FC<Props> = (props) => {
  const { paramUser, ratingHistory, ratingRanks } = props;

  const [activeTab, setActiveTab] = useState<ChartTab>(ChartTab.rating);
  const [tweetTitle, setTweetTitle] = useState('');

  useEffect(() => {
    if (!ratingHistory) return;
    const lastHistory = ratingHistory[ratingHistory.length - 1];
    const rank = lastHistory.Place;
    const _tweetTitle =
      `${paramUser} took ${getOrdinal(rank)} place in ${
        lastHistory.ContestName
      }!\n` +
      `Performance: ${lastHistory.performance}\n` +
      `Rating: ${lastHistory.OldRating}→${lastHistory.NewRating} ${getDiffText(
        lastHistory.NewRating - lastHistory.OldRating
      )}\n` +
      (lastHistory.NewRating > lastHistory.OldRating
        ? 'Updated highest rating!\n'
        : '') +
      `${getHashtagSet(lastHistory.slug).join(' ')}\n\n` +
      `AtCoder Marathon Rating History\n`;
    setTweetTitle(_tweetTitle);
  }, [paramUser, ratingHistory]);

  const [xaxis, data] = ratingRanks.getHistogram();
  const rating = ratingRanks.getRating(paramUser);

  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <ButtonGroup size="sm" className="btn-group-ac-style">
          <Button
            onClick={() => {
              setActiveTab(ChartTab.rating);
            }}
            active={activeTab === ChartTab.rating}
          >
            Rating
          </Button>
          <Button
            onClick={() => {
              setActiveTab(ChartTab.performance);
            }}
            active={activeTab === ChartTab.performance}
          >
            Performance
          </Button>
          <Button
            onClick={() => {
              setActiveTab(ChartTab.ratingDistribution);
            }}
            active={activeTab === ChartTab.ratingDistribution}
          >
            Rating Distribution
          </Button>
        </ButtonGroup>
      </div>

      <div style={{ marginTop: '20px' }}>
        <ChartWrapper display={activeTab === ChartTab.rating}>
          <RatingGraph
            paramUser={paramUser}
            ratingHistory={ratingHistory}
            mode="Rating"
          />
        </ChartWrapper>
        <ChartWrapper display={activeTab === ChartTab.performance}>
          <RatingGraph
            paramUser={paramUser}
            ratingHistory={ratingHistory}
            mode="Performance"
          />
        </ChartWrapper>
        <ChartWrapper display={activeTab === ChartTab.ratingDistribution}>
          <RatingDistributionGraph xaxis={xaxis} data={data} rating={rating} />
        </ChartWrapper>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
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
