// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import { connect } from 'react-redux';
import { RangeQuerySet } from './range_query.jsx';

class _QuerySet extends React.Component {
  componentDidMount() {
    this._setupQueries(this.props.queries);
    this._updateData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.queries !== nextProps.queries) {
      this._setupQueries(nextProps.queries);
    }
    this._updateData(nextProps);
  }
  _setupQueries(queries) {
    this.queries = new RangeQuerySet(queries, this.context.queryStore, (datasets) => this.props.onQueryData(datasets));
  }
  _updateData(props) {
    const end = Math.round(props.range.end.getTime()/1000);
    const start = end - props.range.duration;
    this.queries.updateData(start, end, props.filter);
  }
  render() {
    return false;
  }
}
_QuerySet.propTypes = {
  queries: React.PropTypes.array.isRequired,
  onQueryData: React.PropTypes.func.isRequired,
  range: React.PropTypes.object.isRequired,
  filter: React.PropTypes.object.isRequired,
};
_QuerySet.contextTypes = {
  queryStore: React.PropTypes.object.isRequired,
};
export const QuerySet = connect(
  (state) => ({
    range: state.range,
    filter: state.filter,
  })
)(_QuerySet);
