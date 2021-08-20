export interface RatingHistoryEntry {
  readonly EndTime: number;
  readonly NewRating: number;
  readonly OldRating: number;
  readonly Place: number;
  readonly ContestName: string;
  /** "https://atcoder.jp/contests/ahc001/standings?watching=hakomo" など */
  readonly StandingsUrl: string;
  /** "/contests/ahc001/standings?watching=hakomo" など */
  readonly StandingsU: string;
  readonly low: number;
  readonly high: number;
}
export interface RatingHistoryEntryEx extends RatingHistoryEntry {
  readonly performance: number;
  readonly change: number;
  /** コンテストの slug */
  readonly slug: string;
}
