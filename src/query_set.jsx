// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import React from 'react';
import Plottable from 'plottable';
import { connect } from 'react-redux';
import { FormatMetric, FormatTemplate, StrictMatchFilter } from './utils.jsx';

const formatDatasets = (options, data) => {
  return data.map((result) => {
    var title = (
      options.title ?
        FormatTemplate(options.title, result.metric) :
        FormatMetric(result.metric)
    );
    var dataset = _.map(result.values, (value) => {
      return {
        t: new Date(value[0]*1000),
        y: parseFloat(value[1]),
      };
    });
    return new Plottable.Dataset(dataset, {title: title, metric: result.metric});
  });
};

export class QuerySet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {datasets: new Array(this.props.queries.length)};
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.queries !== nextProps.queries) {
      this.setState({datasts: new Array(nextProps.queries.length)});
    }
  }
  render() {
    const queries = this.props.queries.map((queryOptions, index) => (
      <Query
        key={index}
        options={queryOptions}
        updated={(datasets) => this._onQueryData(index, datasets)} />
    ));
    return <div>{queries}</div>;
  }
  _onQueryData(queryIndex, queryDatasets) {
    if (_.isEmpty(queryDatasets)) {
      const oldDatasets = this.state.datasets[queryIndex];
      if (!oldDatasets || _.isEmpty(oldDatasets)) {
        return;
      }
    }
    _.each(queryDatasets, function(dataset) {
      dataset.metadata().queryIndex = queryIndex;
    });
    this.state.datasets[queryIndex] = queryDatasets;
    var datasets = _.flatten(this.state.datasets, true).filter(function(d) { return d; });
    this.props.onQueryData(datasets);
  }
}
QuerySet.propTypes = {
  queries: React.PropTypes.array.isRequired,
  onQueryData: React.PropTypes.func.isRequired,
};

class _Query extends React.Component {
  render() {
    return false;
  }
  componentDidMount() {
    if (StrictMatchFilter(this.props.options.match, this.props.filter)) {
      const source = FormatTemplate(this.props.options.source, this.props.filter);
      const query = FormatTemplate(this.props.options.query, this.props.filter);
      this.props.subscribe(query, source, this);
      const data = this.props.data.get(query, source, {}).data;
      if (data) {
        this.props.updated(formatDatasets(this.props.options, data));
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    let data = null;
    let query = null;
    let source = null;
    if (StrictMatchFilter(this.props.options.match, this.props.filter)) {
      source = FormatTemplate(this.props.options.source, this.props.filter);
      query = FormatTemplate(this.props.options.query, this.props.filter);
      data = this.props.data.get(query, source, {}).data;
    }
    let nextData = null;
    let nextQuery = null;
    let nextSource = null;
    if (StrictMatchFilter(nextProps.options.match, nextProps.filter)) {
      nextSource = FormatTemplate(nextProps.options.source, nextProps.filter);
      nextQuery = FormatTemplate(nextProps.options.query, nextProps.filter);
      nextData = nextProps.data.get(query, source, {}).data;
    }
    if (query !== nextQuery || source !== nextSource) {
      this.props.unsubscribe(query, source, this);
      this.props.subscribe(nextQuery, nextSource, this);
    }
    if (data !== nextData) {
      nextProps.updated(formatDatasets(nextProps.options, nextData || []));
    }
  }
}
_Query.propTypes = {
  options: React.PropTypes.object.isRequired,
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
