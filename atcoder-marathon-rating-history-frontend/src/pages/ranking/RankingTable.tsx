import React from 'react';
import BootstrapTable, {
  ColumnDescription,
  SortOrder,
} from 'react-bootstrap-table-next';
import paginationFactory, {
  PaginationProvider,
} from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { PaginationPanel } from '../../components/PaginationPanel';
import { getColor, RankingEntry } from '../../utils/Rating';
import { RatingCircle } from '../../components/RatingCircle';
import './ranking-table.scss';

const _sortCaret = (order: 'asc' | 'desc' | undefined): JSX.Element => {
  if (order === 'asc')
    return (
      <FontAwesomeIcon
        style={{
          marginLeft: '6px',
          marginTop: '0.2rem',
          marginBottom: '-0.2rem',
        }}
        icon={faSortUp}
      />
    );
  if (order === 'desc')
    return (
      <FontAwesomeIcon
        style={{
          marginLeft: '6px',
          marginTop: '-0.2rem',
          marginBottom: '0.2rem',
        }}
        icon={faSortDown}
      />
    );
  return <FontAwesomeIcon style={{ marginLeft: '6px' }} icon={faSort} />;
};

interface Props {
  ranking: RankingEntry[];
}

export const RankingTable: React.FC<Props> = (props) => {
  const { ranking } = props;

  if (ranking.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '500px',
          textAlign: 'center',
          marginTop: '100px',
          marginBottom: '100px',
        }}
      >
        Fetch data...
      </div>
    );
  }

  const columns: ColumnDescription[] = [
    {
      dataField: 'rank',
      text: 'Rank',
      sort: true,
      classes: 'standings-rank',
      headerClasses: 'standings-rank-head',
      sortFunc: function _sortFunc(a: number, b: number, order: SortOrder) {
        if (order === 'desc') {
          return a - b;
        } else {
          return b - a;
        }
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'username',
      text: 'User',
      sort: true,
      classes: 'standings-username',
      headerClasses: 'standings-username-head',
      filter: textFilter(),
      formatter: function _formatter(cell: string, _row: RankingEntry) {
        return (
          <>
            <a
              href={`https://atcoder.jp/users/${cell}`}
              className="username"
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: getColor(_row.rating)[1] }}
            >
              <RatingCircle id={cell} rating={_row.rating} />{' '}
              <span className="user">{cell}</span>
            </a>
          </>
        );
      },
      sortFunc: function _sortFunc(a: string, b: string, order: SortOrder) {
        if (order === 'desc') {
          return a > b ? 1 : -1;
        } else {
          return b < a ? -1 : 1;
        }
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'rating',
      text: 'Rating',
      sort: true,
      classes: 'standings-rating',
      headerClasses: 'standings-rating-head',
      formatter: function _formatter(cell: number) {
        return (
          <>
            <span style={{ color: getColor(cell)[1] }}>{cell}</span>
          </>
        );
      },
      sortFunc: function _sortFunc(_a: number, _b: number, order: SortOrder) {
        if (order === 'desc') {
          return _b - _a;
        } else {
          return _a - _b;
        }
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'match',
      text: 'Match',
      sort: true,
      classes: 'standings-match',
      headerClasses: 'standings-match-head',
      formatter: function _formatter(cell: number) {
        return (
          <>
            <span>{cell}</span>
          </>
        );
      },
      sortFunc: function _sortFunc(_a: number, _b: number, order: SortOrder) {
        if (order === 'desc') {
          return _b - _a;
        } else {
          return _a - _b;
        }
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'win',
      text: 'Win',
      sort: true,
      classes: 'standings-win',
      headerClasses: 'standings-win-head',
      formatter: function _formatter(cell: number) {
        return (
          <>
            <span>{cell}</span>
          </>
        );
      },
      sortFunc: function _sortFunc(_a: number, _b: number, order: SortOrder) {
        if (order === 'desc') {
          return _b - _a;
        } else {
          return _a - _b;
        }
      },
      sortCaret: _sortCaret,
    },
  ];

  return (
    <>
      <PaginationProvider
        pagination={paginationFactory({
          custom: true,
          sizePerPage: 100,
          sizePerPageList: [10, 20, 50, 100, 1000],
          totalSize: ranking.length,
        })}
      >
        {({ paginationProps, paginationTableProps }) => {
          paginationTableProps.keyField = 'user_name';
          paginationTableProps.data = ranking;
          paginationTableProps.columns = columns;
          return (
            <div>
              <PaginationPanel renderSizePerPage={true} {...paginationProps} />
              <BootstrapTable
                bootstrap4
                classes="th-center th-middle td-center td-middle table-standings"
                striped
                // keyField="user_name"
                // data={userStandingsEntries}
                // columns={columns}
                filter={filterFactory()}
                wrapperClasses="table-responsive"
                {...paginationTableProps}
              />
              <PaginationPanel renderSizePerPage={false} {...paginationProps} />
            </div>
          );
        }}
      </PaginationProvider>
      <hr />
    </>
  );
};
