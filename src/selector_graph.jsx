// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import React from 'react';
import { SetupGraph } from './base_graph.jsx';
import { TimeScale, Filter } from './dispatch.jsx';
import { QuerySet } from './range_query.jsx';

export default class SelectGraph extends React.Component {
  constructor(props) {
    super(props);
    this._hovered = this._hovered.bind(this);
    this._selected = this._selected.bind(this);
    this._redraw = this._redraw.bind(this);
    this._updateNow = this._update.bind(this);
    this._update = _.debounce(this._updateNow);
    this.components = SetupGraph(this._hovered, this._selected);
    this.components.captions.dataset.onUpdate(function(dataset) {
      this.props.onUpdateValues(dataset.data());
    }.bind(this));
    this.queries = new QuerySet([this.props.query], function(datasets) {
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
    TimeScale.onUpdate(this._update);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
    TimeScale.offUpdate(this._update);
  }
  _update() {
    var start = Math.floor(TimeScale.scale().domainMin().getTime()/1000);
    var end = Math.floor(TimeScale.scale().domainMax().getTime()/1000);
    this.queries.updateData(start, end, Filter.filter());
  }
  _redraw() {
    this.components.graph.redraw();
  }
  _hovered(time) {
    this.components.guideline.value(time);
    this.components.captions.target(time);
  }
  _selected(time, point, nearest) {
    this.props.onSelect(nearest.dataset);
  }
}
SelectGraph.PropTypes = {
  query: React.PropTypes.string.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  onUpdateValues: React.PropTypes.func.isRequired,
};
