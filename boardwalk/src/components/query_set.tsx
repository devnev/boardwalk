import * as React from 'react';
import { StrictMatchFilter, MatchFilter } from '../match';
import { FormatTemplate, FormatMetric } from '../fmt';
import * as _ from 'underscore';
import { connect } from 'react-redux';
import { State } from '../reducers';
import { State as QueryDataState } from '../reducers/query_data';
import * as query_actions from '../actions/query';

function formatResults(options: QueryOptions, results: RawResult[]): QueryResult[] {
  return results.map((result) => {
    var title = (
      options.title ?
        FormatTemplate(options.title, result.metric) :
        FormatMetric(result.metric)
    );
    return {...result, title, queryOptions: options, queryIndex: -1};
  });
}

export interface QueryOptions {
  title: string;
  query: string;
  source: string;
  match: {[key: string]: string};
}

interface RawResult {
  metric: {[label: string]: string};
}

export interface QueryResult {
  metric: {[label: string]: string};
  title: string;
  queryOptions: QueryOptions;
  queryIndex: number;
}

interface QueryPullerProps {
  options: QueryOptions;
  strictMatch: boolean;
  filter: {[label: string]: string};
  data: QueryDataState;
  updated: (results: QueryResult[]) => void;
  subscribe: (query: string, source: string, object: {}) => void;
  unsubscribe: (query: string, source: string, object: {}) => void;
}

class QueryPuller extends React.Component<QueryPullerProps, {}> {
  render(): null {
    return null;
  }
  componentDidMount() {
    const matchFn = this.props.strictMatch ? StrictMatchFilter : MatchFilter;
    if (matchFn(this.props.options.match, this.props.filter)) {
      const source = FormatTemplate(this.props.options.source, this.props.filter);
      const query = FormatTemplate(this.props.options.query, this.props.filter);
      this.props.subscribe(query, source, this);
      const results = this.props.data.get(this.props.data, query, source, {data: undefined}).data;
      if (results) {
        this.props.updated(formatResults(this.props.options, results));
      }
    }
  }
  componentWillReceiveProps(nextProps: QueryPullerProps) {
    let data = null;
    let query = null;
    let source = null;
    const matchFn = this.props.strictMatch ? StrictMatchFilter : MatchFilter;
    if (matchFn(this.props.options.match, this.props.filter)) {
      source = FormatTemplate(this.props.options.source, this.props.filter);
      query = FormatTemplate(this.props.options.query, this.props.filter);
      data = this.props.data.get(this.props.data, query, source, {data: null}).data;
    }
    let nextData = null;
    let nextQuery = null;
    let nextSource = null;
    const nextMatchFn = nextProps.strictMatch ? StrictMatchFilter : MatchFilter;
    if (nextMatchFn(nextProps.options.match, nextProps.filter)) {
      nextSource = FormatTemplate(nextProps.options.source, nextProps.filter);
      nextQuery = FormatTemplate(nextProps.options.query, nextProps.filter);
      nextData = nextProps.data.get(nextProps.data, nextQuery, nextSource, {data: null}).data;
    }
    if (query !== nextQuery || source !== nextSource) {
      if (query && source) {
        this.props.unsubscribe(query, source, this);
      }
      if (!nextQuery || !nextSource) {
        console.warn('unexpected empty query %s or empty source %s', nextSource, nextQuery);
      } else {
        this.props.subscribe(nextQuery, nextSource, this);
      }
    }
    if (data !== nextData) {
      nextProps.updated(formatResults(nextProps.options, nextData || []));
    }
  }
}

interface QueryProps {
  options: QueryOptions;
  strictMatch: boolean;
  updated: (results: QueryResult[]) => void;
}

export const Query: React.ComponentClass<QueryProps> = connect<{}, {}, QueryProps>(
  (state: State) => ({
    filter: state.filter.filters,
    data: state.data.queries,
  }),
  (dispatch) => ({
    subscribe: (query: string, source: string, obj: {}) => dispatch<query_actions.SubscribeQueryAction>({
      type: query_actions.SUBSCRIBE_QUERY,
      query: query,
      source: source,
      object: obj,
    }),
    unsubscribe: (query: string, source: string, obj: {}) => dispatch<query_actions.UnsubscribeQueryAction>({
      type: query_actions.UNSUBSCRIBE_QUERY,
      query: query,
      source: source,
      object: obj,
    }),
  }),
)(QueryPuller);

export interface QuerySetProps {
  queries: QueryOptions[];
  strictMatch: boolean;
  onQueryData: (results: QueryResult[]) => void;
}

interface QuerySetState {
  results: QueryResult[][];
}

export class QuerySet extends React.Component<QuerySetProps, QuerySetState> {
  constructor(props: QuerySetProps) {
    super(props);
    this.state = {results: new Array(props.queries.length)};
  }
  componentWillReceiveProps(nextProps: QuerySetProps) {
    if (this.props.queries !== nextProps.queries) {
      this.setState({results: new Array(nextProps.queries.length)});
    }
  }
  _onQueryData(queryIndex: number, queryResults: QueryResult[]) {
    if (_.isEmpty(queryResults)) {
      const oldResults = this.state.results[queryIndex];
      if (!oldResults || _.isEmpty(oldResults)) {
        return;
      }
    }
    const fixedResults = _.map(queryResults, (result) => ({...result, queryIndex}));
    this.state.results[queryIndex] = fixedResults;
    const results = _.flatten(this.state.results, true).filter(_.identity);
    this.props.onQueryData(results);
  }
  render(): JSX.Element {
    const queries = this.props.queries.map((opts: QueryOptions, index: number): JSX.Element => (
      <Query
        key={index}
        options={opts}
        strictMatch={this.props.strictMatch}
        updated={(results) => this._onQueryData(index, results)}
      />
    ));
    return <div>{queries}</div>;
  }
}
