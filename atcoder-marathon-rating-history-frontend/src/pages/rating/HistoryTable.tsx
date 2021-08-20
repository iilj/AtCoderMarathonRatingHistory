import React from 'react';
import BootstrapTable, {
  ColumnDescription,
  SortOrder,
} from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSortAmountDown,
  faSortAmountDownAlt,
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import { RatingHistoryEntryEx } from '../../interfaces/RatingHistoryEntry';
import { formatDatetime, getDiff } from '../../utils';
import { getRatingColorBG } from '../../utils/RatingColor';
import { UncontrolledTooltip } from 'reactstrap';
import './history-table.scss';

const _sortCaret = (order: 'asc' | 'desc' | undefined): JSX.Element => {
  if (order === 'asc')
    return (
      <FontAwesomeIcon
        style={{
          marginLeft: '6px',
        }}
        icon={faSortAmountDown}
      />
    );
  if (order === 'desc')
    return (
      <FontAwesomeIcon
        style={{
          marginLeft: '6px',
        }}
        icon={faSortAmountDownAlt}
      />
    );
  return (
    <FontAwesomeIcon
      style={{ marginLeft: '6px', opacity: 0.2 }}
      icon={faSort}
    />
  );
};

interface Props {
  paramUser: string;
  ratingHistory: RatingHistoryEntryEx[];
}

export const HistoryTable: React.FC<Props> = (props) => {
  const { paramUser, ratingHistory } = props;

  const columns: ColumnDescription[] = [
    {
      dataField: 'EndTime',
      text: 'Date',
      sort: true,
      formatter: function _formatter(cell: number) {
        const date = new Date(cell * 1000);
        return (
          <>
            <span>{formatDatetime(date)}</span>
          </>
        );
      },
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
      dataField: 'ContestName',
      text: 'Contest',
      sort: true,
      classes: 'history-table-contest',
      formatter: function _formatter(cell: string, _row: RatingHistoryEntryEx) {
        const btnId = `js-history-user-btn-submission-${_row.slug}`;
        return (
          <>
            <a
              href={`https://atcoder.jp/contests/${_row.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              {cell}
            </a>
            <span className="history-user-btn">
              <a
                href={`https://atcoder.jp/contests/${_row.slug}/submissions?f.User=${paramUser}`}
                id={btnId}
              >
                <FontAwesomeIcon icon={faSearch} />
              </a>
              <UncontrolledTooltip placement="top" target={btnId}>
                {`view ${paramUser}'s submissions`}
              </UncontrolledTooltip>
            </span>
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
      dataField: 'Place',
      text: 'Rank',
      sort: true,
      formatter: function _formatter(cell: number, _row: RatingHistoryEntryEx) {
        return (
          <>
            <a href={_row.StandingsUrl} target="_blank" rel="noreferrer">
              {cell}
            </a>
          </>
        );
      },
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
      dataField: 'performance',
      text: 'Performance',
      sort: true,
      sortFunc: function _sortFunc(a: number, b: number, order: SortOrder) {
        if (order === 'desc') {
          return a - b;
        } else {
          return b - a;
        }
      },
      style: function _style(cell: number) {
        return { backgroundColor: getRatingColorBG(cell) };
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'NewRating',
      text: 'New Rating',
      sort: true,
      sortFunc: function _sortFunc(a: number, b: number, order: SortOrder) {
        if (order === 'desc') {
          return a - b;
        } else {
          return b - a;
        }
      },
      style: function _style(cell: number) {
        return { backgroundColor: getRatingColorBG(cell) };
      },
      sortCaret: _sortCaret,
    },
    {
      dataField: 'change',
      text: 'Diff',
      sort: true,
      formatter: function _formatter(cell: number) {
        return (
          <>
            <span>{getDiff(cell)}</span>
          </>
        );
      },
      sortFunc: function _sortFunc(a: number, b: number, order: SortOrder) {
        if (order === 'desc') {
          return a - b;
        } else {
          return b - a;
        }
      },
      sortCaret: _sortCaret,
    },
  ];
  const data = [...ratingHistory].reverse();

  return (
    <BootstrapTable
      bootstrap4
      classes="th-center th-middle td-center td-middle table-standings"
      striped
      keyField="EndTime"
      filter={filterFactory()}
      wrapperClasses="table-responsive"
      data={data}
      columns={columns}
    />
  );
};
