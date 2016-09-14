// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import _ from 'underscore';
import React from 'react';
import { QuerySet } from './range_query.jsx';
import { SetupGraph } from './base_graph.jsx';

class _Graph extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.id = _.uniqueId('graph_');
    this.guideline = null;
    this.plot = null;
    this.highlight = null;
    this.graph = null;
    this.queries = null;

    // binds
    this._redraw = this._redraw.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this._setup();
    this._updateData = _.debounce(this._updateData.bind(this), 500);
  }
  componentDidMount() {
    window.addEventListener("resize", this._redraw);
    this._updateData();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlightTime, nextProps.highlightTime)) {
      this._updateHighlight(nextProps.highlightTime);
    }
    this._updateData();
  }
  shouldComponentUpdate(props, state) {
    return !_.isEqual(this.props.options, props.options);
  }
  render() {
    return <svg id={this.id} width="100%" height="300px" ref={(ref) => ref ? this.graph.renderTo(ref) : this.graph.detach()} />;
  }
  _redraw() {
    if (this.graph) {
      this.graph.redraw();
    }
  }
  _updateData() {
    var end = Math.floor(this.props.range.end.getTime()/1000);
    var start = end - this.props.range.duration;
    this.queries.updateData(start, end, this.props.filter);
  }
  _updateHighlight(targetTime) {
    this.guideline.value(targetTime);
    this.captions.target(targetTime);
  }
  _onSelect(time, point, nearest) {
    var metadata = nearest.dataset.metadata();
    this.props.expandMetric(metadata.queryIndex, metadata.metric);
  }
  _setup() {
    var components = SetupGraph(this.context.timeScale, this.context.colorScale, this.props.onHoverTime, this._onSelect);
    this.guideline = components.guideline;
    this.plot = components.dataplot;
    this.highlight = components.highlight;
    this.graph = components.graph;
    this.captions = components.captions;

    // the data
    this.captions.dataset.onUpdate(function(dataset) {
      this.props.onUpdateValues(dataset.data());
    }.bind(this));
    this.queries = new QuerySet(this.props.options.queries, function(datasets) {
      this.plot.datasets(datasets);
      this.captions.setSources(datasets);
    }.bind(this));
  }
}
_Graph.propTypes = {
  options: React.PropTypes.object.isRequired,
  range: React.PropTypes.object.isRequired,
  filter: React.PropTypes.object.isRequired,
  expandMetric: React.PropTypes.func.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
};
_Graph.contextTypes = {
  timeScale: React.PropTypes.object.isRequired,
  colorScale: React.PropTypes.object.isRequired,
};
export const Graph = connect(
  (state) => ({
    range: state.range,
    highlightTime: state.hover.time,
    filter: state.filter,
  }),
  (dispatch) => ({
    onHoverTime: (time, point) => dispatch({
      type: 'HOVER',
      time: time,
      point: point,
    }),
  })
)(_Graph);
export { Graph as default };
