// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import { connect } from 'react-redux';
import React from 'react';
import { QuerySet } from './query_set.jsx';
import { QueryKey } from './query_key.jsx';
import { Graph } from './graph.jsx';

function computeHighlights(datasets, target) {
  if (!target) {
    return {
      nearest: [],
      captions: datasets.map((dataset) => ({
        caption: dataset.metadata().title,
        value: "",
      })),
    };
  }

  let points = [];
  let values = [];
  datasets.forEach((dataset) => {
    var data = dataset.data();
    if (data.length == 0 || data[0].t > target) {
      values.push({caption: dataset.metadata().title, value: ""});
      return;
    }
    var index = _.sortedIndex(data, {t: target}, 't');
    if (!(index < data.length && data[index].t === target)) {
      index -= 1;
    }
    var point = data[index];
    points.push(Object.assign({caption: dataset.metadata().title}, point));
    values.push({caption: dataset.metadata().title, value: point.y});
  });
  return {
    nearest: points,
    captions: values,
  };
}

class _MetricsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datasets: [],
      nearest: [],
      captions: [],
    };
    this._onData = this._onData.bind(this);
  }
  _onData(datasets) {
    this.setState({...this.state, datasets, ...computeHighlights(datasets, this.props.highlightTime)});
  }
  componentWillReceiveProps(nextProps) {
    this.setState({...this.state, ...computeHighlights(this.state.datasets, nextProps.highlightTime)});
  }
  render() {
    return (
      <div>
        <QuerySet queries={this.props.queries} onQueryData={this._onData} />
        <Graph datasets={this.state.datasets} highlights={this.state.nearest} onSelectMetric={this.props.onSelectMetric} height={this.props.graphHeight} />
        <QueryKey items={this.state.captions} onSelectMetric={this.props.onSelectMetric} />
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
