import React, { useState } from 'react';
import { Badge, Tooltip } from 'reactstrap';
import { getRatingColor } from '../utils/RatingColor';
import { TopcoderLikeCircle } from './TopcoderLikeCircle';
import './RatingCircle.css';

type Rating = number;

interface Props {
  id?: string;
  rating?: Rating;
}

function getColor(rating: Rating) {
  if (rating < 3200) {
    return getRatingColor(rating);
  } else if (rating < 3600) {
    return 'Bronze';
  } else if (rating < 4000) {
    return 'Silver';
  } else {
    return 'Gold';
  }
}

export const RatingCircle: React.FC<Props> = (props) => {
  const { id, rating } = props;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltipState = (): void => setTooltipOpen(!tooltipOpen);
  const circleId = `RatingCircle-${id ?? ''}`;
  if (rating === undefined || rating < 0) {
    return (
      <span>
        <Badge
          className="rating-unavailable-circle"
          color="info"
          id={circleId}
          pill
        >
          ?
        </Badge>
        <Tooltip
          placement="top"
          target={circleId}
          isOpen={tooltipOpen}
          toggle={toggleTooltipState}
        >
          Rating is unavailable.
        </Tooltip>
      </span>
    );
  }
  const color = getColor(rating);

  return (
    <>
      <TopcoderLikeCircle
        color={color}
        rating={rating}
        className="rating-circle"
        id={circleId}
      />
      <Tooltip
        placement="top"
        target={circleId}
        isOpen={tooltipOpen}
        toggle={toggleTooltipState}
      >
        {`Rating: ${rating}`}
      </Tooltip>
    </>
  );
};
