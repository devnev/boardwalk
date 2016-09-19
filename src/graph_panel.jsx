// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import { MetricsPanel } from './metrics_panel.jsx';

class _GraphPanel extends React.Component {
  _getExpandedQuery() {
    if (this.props.expanded.panelIndex !== this.props.index) {
      return;
    }
    var query = this.props.graph.queries[this.props.expanded.queryIndex];
    if (!query || !query.expanded) {
      return;
    }
    var options = query.expanded;
    options.match = query.match;
    return options;
  }
  _expandedPanel(query) {
    const select = (queryIndex, metricLabels) => {
      let filter = {};
      Object.keys(query.labels).forEach((labelName) => {
        filter[query.labels[labelName]] = metricLabels[labelName];
      });
      this.props.onSelectFilter(filter);
    };
    return (
      <MetricsPanel
        queries={[query]}
        graphHeight="700px"
        onSelectMetric={select} />
    );
  }
  _dataPanel() {
    const expand = this.props.onExpandMetric.bind(null, this.props.index);
    return (
      <MetricsPanel
        queries={this.props.graph.queries} 
        graphHeight="300px"
        onSelectMetric={expand} />
    );
  }
  render() {
    var expandedQuery = this._getExpandedQuery();
    if (expandedQuery) {
      return this._expandedPanel(expandedQuery);
    }
    return this._dataPanel();
  }
}
_GraphPanel.propTypes = {
  index: React.PropTypes.number.isRequired,
  graph: React.PropTypes.object.isRequired,
  expanded: React.PropTypes.object.isRequired,
  onExpandMetric: React.PropTypes.func.isRequired,
};
export const GraphPanel = connect(
  (state) => ({
    expanded: state.expanded,
  }),
  (dispatch) => ({
    onExpandMetric: (panelIndex, queryIndex, metricLabels) => dispatch({
      type: 'EXPAND_METRIC', panelIndex, queryIndex, metricLabels,
    }),
    onSelectFilter: (filter) => dispatch({
      type: 'SET_FILTERS',
      filters: filter
    }),
  })
)(_GraphPanel);
