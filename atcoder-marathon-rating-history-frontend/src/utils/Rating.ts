import { BinaryIndexedTree } from './BinaryIndexedTree';
import { ContestResults } from './Data';

export const STEP_SIZE = 400;
export const COLORS: [number, string, number, number][] = [
  [0, '#808080', 0.15, 0x808080],
  [400, '#804000', 0.15, 0x804000],
  [800, '#008000', 0.15, 0x008000],
  [1200, '#00C0C0', 0.2, 0x00c0c0],
  [1600, '#0000FF', 0.1, 0x0000ff],
  [2000, '#C0C000', 0.25, 0xc0c000],
  [2400, '#FF8000', 0.2, 0xff8000],
  [2800, '#FF0000', 0.1, 0xff0000],
];

/**
 * レーティング x に関する色情報を返す
 * @param x レーティング
 * @returns [レーティング下限値，色文字列，アルファ値，色数値]
 */
export const getColor = (x: number): [number, string, number, number] => {
  for (let i = COLORS.length - 1; i >= 0; i--) {
    if (x >= COLORS[i][0]) return COLORS[i];
  }
  return [-1, '#000000', 0.1, 0x000000];
};

/**
 * 同色レーティング帯のうち何割の位置にいるかを求める
 * @param x レーティング値
 * @returns 割合
 */
export const getRatingPer = (x: number): number => {
  let pre = COLORS[COLORS.length - 1][0] + STEP_SIZE;
  for (let i = COLORS.length - 1; i >= 0; i--) {
    if (x >= COLORS[i][0]) return (x - COLORS[i][0]) / (pre - COLORS[i][0]);
    pre = COLORS[i][0];
  }
  return 0;
};

export interface RankingEntry {
  rank: number;
  rating: number;
  username: string;
  win: number;
  match: number;
}

const MAX_RATING = 10000;
export class RatingRanks {
  bit: BinaryIndexedTree;
  user2rating: Map<string, RankingEntry>;
  // userid => [rating, rank][]
  user2ratingRankHistory: Map<string, [number, number][]>;
  ratings: number[];

  constructor(contestResultsArray?: (ContestResults | undefined)[]) {
    this.bit = new BinaryIndexedTree(MAX_RATING);
    this.user2rating = new Map<string, RankingEntry>();
    this.user2ratingRankHistory = new Map<string, [number, number][]>();
    if (contestResultsArray === undefined) {
      this.ratings = [];
      return;
    }
    contestResultsArray.forEach((contestResults) => {
      if (contestResults === undefined) return;

      // レーティング更新の反映
      for (const username in contestResults) {
        const rankingEntry = this.user2rating.get(username);
        if (rankingEntry !== undefined) {
          const oldRating = rankingEntry.rating;
          rankingEntry.rating = contestResults[username].NewRating;
          rankingEntry.match++;
          if (contestResults[username].Place === 1) {
            rankingEntry.win++;
          }
          this.bit.add(oldRating, -1);
          this.bit.add(contestResults[username].NewRating, 1);
        } else {
          this.user2rating.set(username, {
            rank: -1,
            rating: contestResults[username].NewRating,
            username,
            win: contestResults[username].Place === 1 ? 1 : 0,
            match: 1,
          });
          this.bit.add(contestResults[username].NewRating, 1);
        }
      }

      // ランキング更新
      this.user2rating.forEach(
        (rankingEntry: RankingEntry, username: string) => {
          const rank = this.bit.query(rankingEntry.rating + 1, MAX_RATING) + 1;
          rankingEntry.rank = rank;
          if (this.user2ratingRankHistory.has(username)) {
            this.user2ratingRankHistory
              .get(username)
              ?.push([rankingEntry.rating, rank]);
          } else {
            this.user2ratingRankHistory.set(username, [
              [rankingEntry.rating, rank],
            ]);
          }
        }
      );
    });
    // dump
    const aaa = [] as number[];
    for (let i = 0; i < 4000; ++i) {
      aaa.push(this.bit.query(i, i + 1));
    }
    console.log(aaa);
    this.ratings = Array.from(this.user2rating.values()).map(
      (rankingEntry) => rankingEntry.rating
    );
    this.ratings.sort((a, b) => b - a);
  }

  getRank(username: string): number {
    const ratingAndRank = this.user2ratingRankHistory.get(username);
    if (ratingAndRank === undefined) return -1;
    return ratingAndRank[ratingAndRank.length - 1][1];
  }

  getRating(username: string): number {
    return this.user2rating.get(username)?.rating ?? 0;
  }

  getHistogram(): [number[], number[]] {
    const xaxis = [
      0, 1, 2, 3, 4, 5, 7, 9, 12, 15, 19, 25, 32, 42, 54, 69, 89, 114, 147, 188,
      242, 311, 400,
    ];
    // 400 以降は 100 区切りで 10000 まで追加しておく
    for (let x = 500; x < 10000; x += 100) {
      xaxis.push(x);
    }
    const data = Array(xaxis.length) as number[];
    data.fill(0);

    // 区切りごとに個数を数える
    this.ratings.forEach((rating) => {
      const index: number = xaxis.findIndex(
        (x, i) => x <= rating && rating < xaxis[i + 1]
      );
      if (index === -1) return;
      data[index]++;
    });

    // 0 要素を後ろから削る
    while (data[data.length - 1] === 0) {
      data.pop();
      xaxis.pop();
    }
    return [xaxis, data];
  }

  /** get {rank, rating, username, win, match}[] */
  getRanking(): RankingEntry[] {
    const ratingAndUsername = Array.from(this.user2rating.values());
    ratingAndUsername.sort((a, b) => {
      if (a.rating != b.rating) return b.rating - a.rating;
      else if (a.username < b.username) return -1;
      else return 1;
    });
    return ratingAndUsername;
  }
}
