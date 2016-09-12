// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import React from 'react';
import { QuerySet } from './range_query.jsx';
import { TimeScale, Filter } from './dispatch.jsx';
import { SetupGraph } from './base_graph.jsx';

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.id = _.uniqueId('graph_');
    this.guideline = null;
    this.plot = null;
    this.highlight = null;
    this.graph = null;
    this.queries = null;

    // binds
    this._redraw = this._redraw.bind(this);
    this._onParamsUpdate = _.debounce(this._onParamsUpdate.bind(this), 500);
  }
  componentDidMount() {
    window.addEventListener("resize", this._redraw);
    TimeScale.onUpdate(this._onParamsUpdate);
    Filter.onUpdate(this._onParamsUpdate);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
    TimeScale.offUpdate(this._onParamsUpdate);
    Filter.offUpdate(this._onParamsUpdate);
    this.graph.destroy();
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.highlightTime, nextProps.highlightTime)) {
      this._updateHighlight(nextProps.highlightTime);
    }
  }
  shouldComponentUpdate(props, state) {  // eslint-disable-line no-unused-vars
    return !_.isEqual(this.props.options, props.options);
  }
  render() {
    this._setup();
    return <svg id={this.id} width="100%" height="300px" ref={(ref) => this.graph.renderTo(ref)} />;
  }
  _timeForPoint(tAxis, point) {
    var position = point.x / tAxis.width();
    var timeWidth = TimeScale.scale().domainMax().getTime() - TimeScale.scale().domainMin().getTime();
    return new Date(TimeScale.scale().domainMin().getTime() + timeWidth * position);
  }
  _redraw() {
    if (this.graph) {
      this.graph.redraw();
    }
  }
  _onParamsUpdate() {
    this._updateData();
  }
  _updateData() {
    var start = Math.floor(TimeScale.scale().domainMin().getTime()/1000);
    var end = Math.floor(TimeScale.scale().domainMax().getTime()/1000);
    this.queries.updateData(start, end, Filter.filter());
  }
  _updateHighlight(targetTime) {
    this.guideline.value(targetTime);
    this.captions.target(targetTime);
  }
  _setup() {
    var components = SetupGraph(this.props.onHoverTime, this.props.onSelectTime);
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
    _.defer(() => this._updateData());
    _.defer(() => this._updateHighlight(this.props.highlightTime));
  }
}
Graph.propTypes = {
  options: React.PropTypes.object.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
  onSelectTime: React.PropTypes.func.isRequired,
};
