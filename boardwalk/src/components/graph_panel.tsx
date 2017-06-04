// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as React from 'react';
import { MetricsPanelContainer as MetricsPanel } from './metrics_panel';

export interface GraphQuery {
  title: string;
  query: string;
  source: string;
  match: {[label: string]: string};
  expanded?: ExpandQuery;
}

export interface ExpandQuery {
  title: string;
  query: string;
  source: string;
  labels: {[label: string]: string};
}

type MatchedExpandQuery = ExpandQuery & {
  match: {[label: string]: string};
};

interface GraphPanelProps {
  index: number;
  graph: {
    queries: GraphQuery[];
  };
  expanded: {
    panelIndex: number;
    queryIndex: number;
  };
  onExpandMetric: (panelIndex: number, queryIndex: number, metricLabels: {[label: string]: string}) => void;
  onSelectFilter: (filter: {[label: string]: string}) => void;
}

class GraphPanel extends React.Component<GraphPanelProps, {}> {
  _getExpandedQuery() {
    if (this.props.expanded.panelIndex !== this.props.index) {
      return;
    }
    var query = this.props.graph.queries[this.props.expanded.queryIndex];
    if (!query || !query.expanded) {
      return;
    }
    return {
      ...query.expanded,
      match: query.match,
    };
  }
  _expandedPanel(query: MatchedExpandQuery) {
    const select = (queryIndex: number, metricLabels: {[label: string]: string}) => {
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
        onSelectMetric={select}
      />
    );
  }
  _dataPanel() {
    const expand = this.props.onExpandMetric.bind(null, this.props.index);
    return (
      <MetricsPanel
        queries={this.props.graph.queries}
        graphHeight="300px"
        onSelectMetric={expand}
      />
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

interface GraphPanelContainerProps {
  index: number;
  graph: {
    queries: GraphQuery[];
  };
}

export const GraphPanelContainer: React.ComponentClass<GraphPanelContainerProps> = connect(
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
)(GraphPanel);
