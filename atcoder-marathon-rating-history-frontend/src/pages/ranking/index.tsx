import React from 'react';
import useSWR from 'swr';
import { Alert } from 'reactstrap';
import { Contest } from '../../interfaces/Contest';
import {
  ContestResults,
  fetchContestResults,
  fetchContests,
} from '../../utils/Data';
import { RankingEntry, RatingRanks } from '../../utils/Rating';
import { RankingTable } from './RankingTable';

export const RankingPage: React.FC = () => {
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

  const ratingRanks = new RatingRanks(contestResultsArray);
  // {rank, rating, username}[]
  const ranking: RankingEntry[] = ratingRanks.getRanking();

  return (
    <>
      <h2>!!! DEPRECATED !!!</h2>
      <p>
        AtCoder が公式に Heuristic
        コンテストのランキング・グラフ表示に対応したため，そちらを用いてください．
      </p>
      <p>
        <a href="https://atcoder.jp/ranking?contestType=heuristic">
          ランキング - AtCoder
        </a>
      </p>
      <p>AtCoder Marathon Rating History は，今後更新されません．</p>
      <hr />

      <h2>Description</h2>
      <p>AtCoder で行われたマラソンコンテストの総合ランキングを表示します．</p>
      <p>
        AtCoder
        が公式にマラソンレートの総合ランキング表示機能を実装するまでのつなぎです．
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
      <RankingTable ranking={ranking} />
    </>
  );
};
