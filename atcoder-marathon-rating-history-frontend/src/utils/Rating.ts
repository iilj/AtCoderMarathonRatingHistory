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

export class RatingRanks {
  user2rating: Map<string, number>;
  ratings: number[];

  constructor(contestResultsArray?: (ContestResults | undefined)[]) {
    this.user2rating = new Map<string, number>();
    if (contestResultsArray === undefined) {
      this.ratings = [];
      return;
    }
    contestResultsArray.forEach((contestResults) => {
      if (contestResults === undefined) return;
      for (const username in contestResults) {
        if (this.user2rating.has(username)) {
          this.user2rating.set(
            username,
            Math.max(
              this.user2rating.get(username) as number,
              contestResults[username].NewRating
            )
          );
        } else {
          this.user2rating.set(username, contestResults[username].NewRating);
        }
      }
    });
    this.ratings = Array.from(this.user2rating.values());
    this.ratings.sort((a, b) => b - a);
  }

  getRank(username: string): number {
    const rating = this.user2rating.get(username);
    if (rating === undefined) return -1;
    for (let i = 0; i < this.ratings.length; ++i) {
      if (this.ratings[i] === rating) return i + 1;
    }
    return -1;
  }
}
