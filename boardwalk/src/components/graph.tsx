// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as _ from 'underscore';
import * as React from 'react';
import * as Plottable from 'plottable';
import { SetupGraph, GraphInfo } from './base_graph';
import * as types from './types';

interface GraphProps {
  datasets: Plottable.Dataset[];
  onSelectMetric: (queryIndex: number, metricLabels: {[label: string]: string}) => void;
  highlights: types.SeriesHighlight[];
  highlightTime: Date;
  onHoverTime: () => void; // TODO: type
  height: string;
}

interface GraphContext {
  timeScale: Plottable.Scales.Time;
  colorScale: Plottable.Scales.Color;
}

class Graph extends React.Component<GraphProps, {}> {
  id: string;
  components: GraphInfo;

  constructor(props: GraphProps, context: GraphContext) {
    super(props, context);

    // binds
    this._redraw = this._redraw.bind(this);
    this._onSelect = this._onSelect.bind(this);

    // init data
    this.id = _.uniqueId('graph_');
    this.components = SetupGraph(context.timeScale, context.colorScale, props.onHoverTime, this._onSelect);
    this.components.highlight.datasets([new Plottable.Dataset()]);
    this._receiveProps(null, this.props);
  }
  componentDidMount() {
    window.addEventListener('resize', this._redraw);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._redraw);
  }
  componentWillReceiveProps(nextProps: GraphProps) {
    this._receiveProps(this.props, nextProps);
  }
  shouldComponentUpdate(props: GraphProps, state: {}) {
    return false;
  }
  render(): JSX.Element {
    return (
      <div
        id={this.id}
        style={{width: '100%', height: this.props.height}}
        ref={(ref) => ref ? this.components.graph.renderTo(ref) : this.components.graph.detach()}
      />
    );
  }
  _redraw() {
    if (this.components.graph) {
      this.components.graph.redraw();
    }
  }
  _onSelect(time: Date, point: Plottable.Point, nearest: Plottable.Plots.IPlotEntity) {
    if (!nearest) {
      return;
    }
    var metadata = nearest.dataset.metadata();
    this.props.onSelectMetric(metadata.queryIndex, metadata.metric);
  }
  _receiveProps(old: GraphProps|null, props: GraphProps) {
    if (!old || old.datasets !== props.datasets) {
      this.components.dataplot.datasets(props.datasets);
    }
    this.components.highlight.datasets()[0].data(props.highlights);
    this.components.guideline.value(props.highlightTime);
  }
}

interface GraphContainerProps {
  datasets: Plottable.Dataset[];
  onSelectMetric: (queryIndex: number, metricLabels: {[label: string]: string}) => void;
  highlights: types.SeriesHighlight[];
  height: string;
}

export const GraphContainer: React.ComponentClass<GraphContainerProps> = connect(
  (state) => ({
    highlightTime: state.hover.time,
  }),
  (dispatch) => ({
    onHoverTime: (time, point) => dispatch({
      type: 'HOVER',
      time: time,
      point: point,
    }),
  })
)(Graph);
