import React, { useState } from 'react';
import useSWR from 'swr';
import { Alert, Nav, NavItem } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faList } from '@fortawesome/free-solid-svg-icons';
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
import './nav.scss';
import { HistoryTable } from './HistoryTable';

enum ContentTab {
  'chart' = 0,
  'table' = 1,
}

const ContentWrapper: React.FC<{
  display: boolean;
}> = (props) => <>{props.display ? props.children : <></>}</>;

const getNavClassName = (active: boolean): string => {
  if (active) return 'active nav-link';
  return 'nav-link';
};

interface Props {
  match: {
    params: {
      user: string;
    };
  };
}

export const RatingPage: React.FC<Props> = (props) => {
  const paramUser: string = props.match.params.user ?? '';
  const [activeTab, setActiveTab] = useState<ContentTab>(ContentTab.chart);

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
        <>
          <Nav tabs className="justify-content-center">
            <NavItem>
              <a
                className={getNavClassName(activeTab === ContentTab.chart)}
                onClick={() => {
                  setActiveTab(ContentTab.chart);
                }}
              >
                <FontAwesomeIcon style={{ marginRight: '4px' }} icon={faUser} />
                Profile
              </a>
            </NavItem>
            <NavItem>
              <a
                className={getNavClassName(activeTab === ContentTab.table)}
                onClick={() => {
                  setActiveTab(ContentTab.table);
                }}
              >
                <FontAwesomeIcon style={{ marginRight: '4px' }} icon={faList} />
                Competition History
              </a>
            </NavItem>
          </Nav>
          <ContentWrapper display={activeTab === ContentTab.chart}>
            <div
              style={{
                maxWidth: '640px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
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
          </ContentWrapper>
          <ContentWrapper display={activeTab === ContentTab.table}>
            <div className="container">
              <HistoryTable
                paramUser={paramUser}
                ratingHistory={ratingHistory}
              />
            </div>
          </ContentWrapper>
        </>
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
