import React, { useEffect, useState } from 'react';

import { Button, ButtonGroup, UncontrolledTooltip } from 'reactstrap';
import { TwitterIcon, TwitterShareButton } from 'react-share';
import { RatingHistoryEntry } from '../../interfaces/RatingHistoryEntry';
import { RatingRanks } from '../../utils/Rating';
import { RatingDistributionGraph } from './RatingDistributionGraph';
import { RatingGraph } from './RatingGraph';
import { getOrdinal } from '../../utils';

interface Props {
  paramUser: string;
  ratingHistory?: RatingHistoryEntry[];
  ratingRanks: RatingRanks;
}

enum ChartTab {
  'rating' = 0,
  'ratingDistribution' = 1,
}

const ChartWrapper: React.FC<{
  display: boolean;
}> = (props) => <>{props.display ? props.children : <></>}</>;

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
      }!\n` + `AtCoder Marathon Rating History`;
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
          <RatingGraph paramUser={paramUser} ratingHistory={ratingHistory} />
        </ChartWrapper>
        <ChartWrapper display={activeTab === ChartTab.ratingDistribution}>
          <RatingDistributionGraph xaxis={xaxis} data={data} rating={rating} />
        </ChartWrapper>
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
