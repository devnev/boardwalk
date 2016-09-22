// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import { FormatMetric, FormatTemplate, StrictMatchFilter, MatchFilter } from './utils.jsx';

function formatResults(options, results) {
  return results.map((result) => {
    var title = (
      options.title ?
        FormatTemplate(options.title, result.metric) :
        FormatMetric(result.metric)
    );
    return {...result, title, queryOptions: options};
  });
}

export class QuerySet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {results: new Array(this.props.queries.length)};
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.queries !== nextProps.queries) {
      this.setState({results: new Array(nextProps.queries.length)});
    }
  }
  render() {
    const queries = this.props.queries.map((queryOptions, index) => (
      <Query
        key={index}
        options={queryOptions}
        strictMatch={this.props.strictMatch}
        updated={(results) => this._onQueryData(index, results)} />
    ));
    return <div>{queries}</div>;
  }
  _onQueryData(queryIndex, queryResults) {
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
}
QuerySet.propTypes = {
  queries: React.PropTypes.array.isRequired,
  strictMatch: React.PropTypes.bool.isRequired,
  onQueryData: React.PropTypes.func.isRequired,
};

class _Query extends React.Component {
  render() {
    return false;
  }
  componentDidMount() {
    const matchFn = this.props.strictMatch ? StrictMatchFilter : MatchFilter;
    if (matchFn(this.props.options.match, this.props.filter)) {
      const source = FormatTemplate(this.props.options.source, this.props.filter);
      const query = FormatTemplate(this.props.options.query, this.props.filter);
      this.props.subscribe(query, source, this);
      const results = this.props.data.get(query, source, {}).data;
      if (results) {
        this.props.updated(formatResults(this.props.options, results));
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    let data = null;
    let query = null;
    let source = null;
    const matchFn = this.props.strictMatch ? StrictMatchFilter : MatchFilter;
    if (matchFn(this.props.options.match, this.props.filter)) {
      source = FormatTemplate(this.props.options.source, this.props.filter);
      query = FormatTemplate(this.props.options.query, this.props.filter);
      data = this.props.data.get(query, source, {}).data;
    }
    let nextData = null;
    let nextQuery = null;
    let nextSource = null;
    const nextMatchFn = nextProps.strictMatch ? StrictMatchFilter : MatchFilter;
    if (nextMatchFn(nextProps.options.match, nextProps.filter)) {
      nextSource = FormatTemplate(nextProps.options.source, nextProps.filter);
      nextQuery = FormatTemplate(nextProps.options.query, nextProps.filter);
      nextData = nextProps.data.get(query, source, {}).data;
    }
    if (query !== nextQuery || source !== nextSource) {
      this.props.unsubscribe(query, source, this);
      this.props.subscribe(nextQuery, nextSource, this);
    }
    if (data !== nextData) {
      nextProps.updated(formatResults(nextProps.options, nextData || []));
    }
  }
}
_Query.propTypes = {
  options: React.PropTypes.object.isRequired,
  strictMatch: React.PropTypes.bool.isRequired,
  filter: React.PropTypes.object.isRequired,
  data: React.PropTypes.object.isRequired,
  updated: React.PropTypes.func.isRequired,
  subscribe: React.PropTypes.func.isRequired,
  unsubscribe: React.PropTypes.func.isRequired,
};
export const Query = connect(
  (state) => ({
    filter: state.filter,
    data: state.data,
  }),
  (dispatch) => ({
    subscribe: (query, source, object) => dispatch({
      type: 'SUBSCRIBE_QUERY', query, source, object,
    }),
    unsubscribe: (query, source, object) => dispatch({
      type: 'UNSUBSCRIBE_QUERY', query, source, object,
    }),
  })
)(_Query);
