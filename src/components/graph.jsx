// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import _ from 'underscore';
import React from 'react';
import Plottable from 'plottable';
import { SetupGraph } from '../base_graph.js';

class _Graph extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.id = _.uniqueId('graph_');
    this.guideline = null;
    this.plot = null;
    this.highlight = null;
    this.graph = null;

    // binds
    this._redraw = this._redraw.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._setup();
    this._receiveProps(null, this.props);
  }
  componentDidMount() {
    window.addEventListener("resize", this._redraw);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
  }
  componentWillReceiveProps(nextProps) {
    this._receiveProps(this.props, nextProps);
  }
  shouldComponentUpdate(props, state) {
    return false;
  }
  render() {
    return (
      <svg id={this.id} width="100%" height={this.props.height} ref={(ref) => ref ? this.graph.renderTo(ref) : this.graph.detach()} />
    );
  }
  _redraw() {
    if (this.graph) {
      this.graph.redraw();
    }
  }
  _onSelect(time, point, nearest) {
    if (!nearest) {
      return;
    }
    var metadata = nearest.dataset.metadata();
    this.props.onSelectMetric(metadata.queryIndex, metadata.metric);
  }
  _setup() {
    var components = SetupGraph(this.context.timeScale, this.context.colorScale, this.props.onHoverTime, this._onSelect);
    this.guideline = components.guideline;
    this.plot = components.dataplot;
    this.highlight = components.highlight;
    this.highlight.datasets([new Plottable.Dataset()]);
    this.graph = components.graph;
  }
  _receiveProps(old, props) {
    if (!old || old.datasets !== props.datasets) {
      this.plot.datasets(props.datasets);
    }
    this.highlight.datasets()[0].data(props.highlights);
    this.guideline.value(props.highlightTime);
  }
}
_Graph.propTypes = {
  datasets: React.PropTypes.array.isRequired,
  onSelectMetric: React.PropTypes.func.isRequired,
  highlights: React.PropTypes.array.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
  height: React.PropTypes.string.isRequired,
};
_Graph.contextTypes = {
  timeScale: React.PropTypes.object.isRequired,
  colorScale: React.PropTypes.object.isRequired,
};
export const Graph = connect(
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
)(_Graph);
