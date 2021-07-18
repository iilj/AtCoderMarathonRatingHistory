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

const MAX_RATING = 10000;
export class RatingRanks {
  bit: BinaryIndexedTree;
  user2rating: Map<string, number>;
  // userid => [rating, rank][]
  user2ratingRankHistory: Map<string, [number, number][]>;
  ratings: number[];

  constructor(contestResultsArray?: (ContestResults | undefined)[]) {
    this.bit = new BinaryIndexedTree(MAX_RATING);
    this.user2rating = new Map<string, number>();
    this.user2ratingRankHistory = new Map<string, [number, number][]>();
    if (contestResultsArray === undefined) {
      this.ratings = [];
      return;
    }
    contestResultsArray.forEach((contestResults) => {
      if (contestResults === undefined) return;

      // レーティング更新の反映
      for (const username in contestResults) {
        if (this.user2rating.has(username)) {
          this.user2rating.set(
            username,
            Math.max(
              this.user2rating.get(username) as number,
              contestResults[username].NewRating
            )
          );
          this.bit.add(contestResults[username].OldRating, -1);
          this.bit.add(contestResults[username].NewRating, 1);
        } else {
          this.user2rating.set(username, contestResults[username].NewRating);
          this.bit.add(contestResults[username].NewRating, 1);
        }
      }

      // ランキング更新
      this.user2rating.forEach((rating: number, username: string) => {
        const rank = this.bit.query(rating + 1, MAX_RATING) + 1;
        if (this.user2ratingRankHistory.has(username)) {
          this.user2ratingRankHistory.get(username)?.push([rating, rank]);
        } else {
          this.user2ratingRankHistory.set(username, [[rating, rank]]);
        }
      });
    });
    this.ratings = Array.from(this.user2rating.values());
    this.ratings.sort((a, b) => b - a);
  }

  getRank(username: string): number {
    const ratingAndRank = this.user2ratingRankHistory.get(username);
    if (ratingAndRank === undefined) return -1;
    return ratingAndRank[ratingAndRank.length - 1][1];
  }

  getRating(username: string): number {
    return this.user2rating.get(username) ?? 0;
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
}
