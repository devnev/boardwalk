// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as React from 'react';
import { MetricsPanelContainer as MetricsPanel } from './metrics_panel';
import { State } from '../reducers';
import { State as ExpandState } from '../reducers/expand';
import { key as graphKey } from '../reducers/graphs';
import * as config_types from '../types/config';

type MatchedExpandQuery = config_types.GraphQuery & config_types.SelectorGraph;

interface GraphPanelProps {
  consolePath: string;
  index: number;
  graphs: Map<string, config_types.Graph>;
  expanded: ExpandState;
  onExpandMetric: (panelIndex: number, queryIndex: number, metricLabels: {[label: string]: string}) => void;
  onSelectFilter: (filter: {[label: string]: string}) => void;
}

class GraphPanel extends React.Component<GraphPanelProps, {}> {
  _onSelectExpanded(query: MatchedExpandQuery, queryIndex: number, metricLabels: {[label: string]: string}): void {
      let filter = {};
      Object.keys(query.labels).forEach((labelName) => {
        filter[query.labels[labelName]] = metricLabels[labelName];
      });
      this.props.onSelectFilter(filter);
  }
  _getExpandedQuery(queries: config_types.GraphQuery[]): MatchedExpandQuery|undefined {
    if (this.props.expanded.panelIndex === undefined || this.props.expanded.queryIndex === undefined) {
      return;
    }
    if (this.props.expanded.panelIndex !== this.props.index) {
      return;
    }
    const query = queries[this.props.expanded.queryIndex];
    if (!query || !query.expanded) {
      return;
    }
    return {
      ...query.expanded,
      match: query.match,
    };
  }
  _expandedPanel(query: MatchedExpandQuery): React.ReactElement<{}> {
    const select = this._onSelectExpanded.bind(this, query);
    return (
      <MetricsPanel
        queries={[query]}
        graphHeight="700px"
        onSelectMetric={select}
      />
    );
  }
  _dataPanel(queries: config_types.GraphQuery[]): React.ReactElement<{}> {
    const expand = this.props.onExpandMetric.bind(null, this.props.index);
    return (
      <MetricsPanel
        queries={queries}
        graphHeight="300px"
        onSelectMetric={expand}
      />
    );
  }
  render(): React.ReactElement<{}>|null {
    const graph = this.props.graphs.get(graphKey(this.props.consolePath, this.props.index));
    if (!graph) {
      return null;
    }
    var expandedQuery = this._getExpandedQuery(graph.queries);
    if (expandedQuery) {
      return this._expandedPanel(expandedQuery);
    }
    return this._dataPanel(graph.queries);
  }
}

interface GraphPanelContainerProps {
  consolePath: string;
  index: number;
}

export const GraphPanelContainer: React.ComponentClass<GraphPanelContainerProps> = connect(
  (state: State) => ({
    graphs: state.graphs,
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
