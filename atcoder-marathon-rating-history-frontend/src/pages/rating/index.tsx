import React from 'react';
import useSWR from 'swr';
import { Alert } from 'reactstrap';
import { FormBlock } from './FormBlock';
import { UserInfoTable } from './UserInfoTable';
import { Contest } from '../../interfaces/Contest';
import { RatingHistoryEntryEx } from '../../interfaces/RatingHistoryEntry';
import {
  ContestResults,
  fetchContestResults,
  fetchContests,
} from '../../utils/Data';
import { RatingRanks } from '../../utils/Rating';
import { ChartSection } from './ChartSection';

interface Props {
  match: {
    params: {
      user: string;
    };
  };
}

export const RatingPage: React.FC<Props> = (props) => {
  const paramUser: string = props.match.params.user ?? '';

  const { data: contests, error: contestsError } = useSWR<Contest[], Error>(
    '/json/contests/contests',
    fetchContests
  );
  const { data: contestResultsArray, error: contestResultsArrayError } = useSWR<
    (ContestResults | undefined)[],
    Error
  >(contests ? `/json/results/` : null, () => {
    if (!contests) return Promise.resolve([undefined]);
    const promises = contests.map((contest) =>
      fetchContestResults(contest.slug)
    );
    return Promise.all(promises);
  });

  const ratingHistory =
    paramUser && contestResultsArray
      ? (contestResultsArray
          .map((contestResults) => {
            if (contestResults && paramUser in contestResults)
              return contestResults[paramUser];
            else return undefined;
          })
          .filter(
            (contestResult) => contestResult !== undefined
          ) as RatingHistoryEntryEx[])
      : undefined;
  const ratingRanks = new RatingRanks(contestResultsArray);

  return (
    <>
      <h2>Description</h2>
      <p>
        AtCoder
        で行われたマラソンコンテストのレーティング推移をグラフに表示します．
      </p>
      <p>
        AtCoder
        が公式にマラソンレートのグラフ表示機能を実装するまでのつなぎです．
      </p>
      <hr />

      {contestsError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest list.
        </Alert>
      ) : contests === undefined ? (
        <div
          style={{
            width: '100%',
            height: '500px',
            textAlign: 'center',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          Fetch contest data...
        </div>
      ) : contestResultsArrayError ? (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          Failed to fetch contest results.
        </Alert>
      ) : contestResultsArray === undefined ? (
        <div
          style={{
            width: '100%',
            height: '500px',
            textAlign: 'center',
            marginTop: '100px',
            marginBottom: '100px',
          }}
        >
          Fetch contest results...
        </div>
      ) : (
        <></>
      )}
      <FormBlock paramUser={paramUser} />
      <hr />
      {ratingHistory?.length ? (
        <div
          style={{ maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <UserInfoTable
            paramUser={paramUser}
            ratingHistory={ratingHistory}
            ratingRanks={ratingRanks}
          />
          <ChartSection
            paramUser={paramUser}
            ratingHistory={ratingHistory}
            ratingRanks={ratingRanks}
          />
        </div>
      ) : (
        <Alert
          color="danger"
          style={{
            marginTop: '50px',
            marginBottom: '50px',
          }}
        >
          AtCoder ID is empty or invalid.
        </Alert>
      )}
    </>
  );
};
