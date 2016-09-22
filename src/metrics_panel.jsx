// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import { connect } from 'react-redux';
import React from 'react';
import Plottable from 'plottable';
import { QuerySet } from './query_set.jsx';
import { QueryKey } from './query_key.jsx';
import { Graph } from './graph.jsx';

function computeHighlights(datasets, target) {
  if (!target) {
    return {
      points: [],
      series: datasets.map((dataset) => ({
        ...dataset.metadata(), value: "",
      })),
    };
  }

  let points = [];
  let series = [];
  datasets.forEach((dataset) => {
    var data = dataset.data();
    if (data.length == 0 || data[0].t > target) {
      series.push({...dataset.metadata().title, value: ""});
      return;
    }
    var index = _.sortedIndex(data, {t: target}, 't');
    if (!(index < data.length && data[index].t === target)) {
      index -= 1;
    }
    var point = data[index];
    points.push({...dataset.metadata(), ...point});
    series.push({...dataset.metadata(), value: point.y});
  });
  return {
    points: points,
    series: series,
  };
}

function datasetsFromResults(results) {
  return results.map((result) => {
    var dataset = _.map(result.values, (value) => {
      return {
        t: new Date(value[0]*1000),
        y: parseFloat(value[1]),
      };
    });
    return new Plottable.Dataset(dataset, {
      title: result.title,
      metric: result.metric,
      queryIndex: result.queryIndex,
    });
  });
}

class _MetricsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datasets: [],
      points: [],
      series: [],
    };
    this._onData = this._onData.bind(this);
  }
  _onData(results) {
    const datasets = datasetsFromResults(results);
    this.setState({
      ...this.state,
      datasets,
      ...computeHighlights(datasets, this.props.highlightTime),
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.state,
      ...computeHighlights(this.state.datasets, nextProps.highlightTime),
    });
  }
  render() {
    return (
      <div>
        <QuerySet queries={this.props.queries} strictMatch={true} onQueryData={this._onData} />
        <Graph datasets={this.state.datasets} highlights={this.state.points} onSelectMetric={this.props.onSelectMetric} height={this.props.graphHeight} />
        <QueryKey series={this.state.series} onSelectMetric={this.props.onSelectMetric} />
      </div>
    );
  }
}
_MetricsPanel.propTypes = {
  queries: React.PropTypes.array.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  graphHeight: React.PropTypes.string.isRequired,
  onSelectMetric: React.PropTypes.func.isRequired,
};
export const MetricsPanel = connect(
  (state) => ({
    highlightTime: state.hover.time,
  }),
  null,
  null,
  {pure: false}
)(_MetricsPanel);
