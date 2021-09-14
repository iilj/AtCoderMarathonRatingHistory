import { Contest } from '../interfaces/Contest';
import { RatingHistoryEntryEx } from '../interfaces/RatingHistoryEntry';

let CONTESTS: Contest[] | undefined = undefined;
export const fetchContests = async (): Promise<Contest[]> =>
  CONTESTS === undefined
    ? fetch(`${process.env.PUBLIC_URL}/json/contests/contests.json`)
        .catch((e) => {
          throw Error(e);
        })
        .then(async (r) => {
          CONTESTS = (await r.json()) as Contest[];
          return CONTESTS;
        })
    : Promise.resolve(CONTESTS);

export type ContestResults = { [key: string]: RatingHistoryEntryEx };
const CONTEST_RESULTS_MAP: Map<string, ContestResults> = new Map<
  string,
  ContestResults
>();
export const fetchContestResults = async (
  contest?: string
): Promise<ContestResults | undefined> =>
  contest !== undefined && contest.length > 0
    ? !CONTEST_RESULTS_MAP.has(contest)
      ? fetch(`${process.env.PUBLIC_URL}/json/results/${contest}.json`)
          .catch((e) => {
            throw Error(e);
          })
          .then(async (r) => {
            const submissions = (await r.json()) as ContestResults;
            CONTEST_RESULTS_MAP.set(contest, submissions);
            return submissions;
          })
      : Promise.resolve(CONTEST_RESULTS_MAP.get(contest) as ContestResults)
    : Promise.resolve(undefined);
