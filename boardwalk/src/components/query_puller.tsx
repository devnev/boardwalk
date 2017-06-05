import * as React from 'react';
import { StrictMatchFilter, MatchFilter } from '../match';
import { State as QueryDataState } from '../reducers/query_data';
import { FormatTemplate } from '../fmt';
import { connect } from 'react-redux';
import { State } from '../reducers';
import * as query_actions from '../actions/query';

export interface Query {
  query: string;
  source: string;
  match: {[key: string]: string};
}

interface QueryPullerProps {
  options: Query;
  strictMatch: boolean;
  filter: {[label: string]: string};
  data: QueryDataState;
  updated: (results: object) => void;
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
        this.props.updated(results);
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
      nextProps.updated(nextData || {});
    }
  }
}

interface QueryContainerProps {
  options: Query;
  strictMatch: boolean;
  updated: (results: object) => void;
}

export const QueryContainer: React.ComponentClass<QueryContainerProps> = connect<{}, {}, QueryContainerProps>(
  (state: State) => ({
    filter: state.filter.filters,
    data: state.data,
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
