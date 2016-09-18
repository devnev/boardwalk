// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import _ from 'underscore';
import React from 'react';
import { SetupGraph } from './base_graph.jsx';
import { RangeQuerySet } from './range_query.jsx';

function _get(obj, key, def) {
  return _.has(obj, key) ? obj[key] : def;
}

class _SelectGraph extends React.Component {
  constructor(props, context) {
    super(props, context);
    this._hovered = this._hovered.bind(this);
    this._selected = this._selected.bind(this);
    this._redraw = this._redraw.bind(this);
    this._updateNow = this._update.bind(this);
    this._update = _.debounce(this._updateNow);
    this.components = SetupGraph(this.context.timeScale, this.context.colorScale, this._hovered, this._selected);
    this.components.captions.dataset.onUpdate(function(dataset) {
      this.props.onUpdateValues(dataset.data());
    }.bind(this));
    this.queries = new RangeQuerySet([this.props.query], this.context.queryStore, function(datasets) {
      this.components.dataplot.datasets(datasets);
      this.components.captions.setSources(datasets);
    }.bind(this));
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    _.defer(this._updateNow);
    return <svg id={this.id} width="100%" height="700px" ref={(ref) => this.components.graph.renderTo(ref)} />;
  }
  componentDidMount() {
    window.addEventListener("resize", this._redraw);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
  }
  _update() {
    var start = Math.round(this.props.range.end.getTime()/1000 - this.props.range.duration);
    var end = Math.round(this.props.range.end.getTime()/1000);
    this.queries.updateData(start, end, this.props.filter);
  }
  _redraw() {
    this.components.graph.redraw();
  }
  _hovered(time) {
    this.components.guideline.value(time);
    this.components.captions.target(time);
  }
  _selected(time, point, nearest) {
    var metric = nearest.dataset.metadata().metric;
    var filters = {};
    _.each(this.props.query.labels, function(selectorName, labelName) {
      filters[selectorName] = _get(metric, labelName);
    });
    this.props.onSelectFilters(filters);
  }
}
_SelectGraph.PropTypes = {
  range: React.PropTypes.object.isRequired,
  filter: React.PropTypes.object.isRequired,
  query: React.PropTypes.string.isRequired,
  onUpdateValues: React.PropTypes.func.isRequired,
  onSelectFilters: React.PropTypes.func.isRequired,
};
_SelectGraph.contextTypes = {
  timeScale: React.PropTypes.object.isRequired,
  colorScale: React.PropTypes.object.isRequired,
  queryStore: React.PropTypes.object.isRequired,
};
export const SelectorGraph = connect(
  (state) => ({
    range: state.range,
    filter: state.filter,
  }),
  (dispatch) => ({
    onSelectFilters: (filters) => dispatch({
      type: 'SET_FILTERS',
      filters: filters,
    }),
  }),
  undefined,
  {pure: false}
)(_SelectGraph);
export { SelectorGraph as default };
