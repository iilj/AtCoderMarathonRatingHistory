import React from 'react';
import { RatingHistoryEntry } from '../../interfaces/RatingHistoryEntry';
import { formatDate, getOrdinal } from '../../utils';
import { getColor, RatingRanks } from '../../utils/Rating';

interface Props {
  paramUser: string;
  ratingHistory: RatingHistoryEntry[];
  ratingRanks: RatingRanks;
}

export const UserInfoTable: React.FC<Props> = (props) => {
  const { paramUser, ratingHistory, ratingRanks } = props;
  if (ratingHistory.length === 0) {
    return <></>;
  }
  const lastResult = ratingHistory[ratingHistory.length - 1];
  const lastCompeted = new Date(lastResult.EndTime * 1000);
  const rank = ratingRanks.getRank(paramUser);
  const ratingColor = getColor(lastResult.NewRating)[1];

  return (
    <>
      <h3 style={{ fontSize: '24px' }}>Contest Status</h3>
      <hr />
      <table className="dl-table" style={{ fontSize: '14px' }}>
        <tr>
          <th className="no-break">Name</th>
          <td>{paramUser}</td>
        </tr>
        <tr>
          <th className="no-break">Rank</th>
          <td>{getOrdinal(rank)}</td>
        </tr>
        <tr>
          <th className="no-break">Rating</th>
          <td>
            <span style={{ color: ratingColor }}>{lastResult.NewRating}</span>
          </td>
        </tr>
        <tr>
          <th className="no-break">Rated Matches</th>
          <td>{ratingHistory.length}</td>
        </tr>
        <tr>
          <th className="no-break">Last Competed</th>
          <td>{formatDate(lastCompeted)}</td>
        </tr>
      </table>
    </>
  );
};
