// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import * as _ from 'underscore';
import { connect } from 'react-redux';
import * as React from 'react';
import * as Plottable from 'plottable';
import { QuerySet, QueryOptions, QueryResult } from './query_set';
import { QueryKey } from './query_key';
import { GraphContainer } from './graph';
import * as types from './types';

function computeHighlights(
    datasets: Plottable.Dataset[],
    target: Date): {points: types.SeriesHighlight[], series: types.SeriesValue[]} {
  if (!target) {
    return {
      points: [],
      series: datasets.map((dataset) => ({
        ...dataset.metadata() as types.Metadata, value: '',
      })),
    };
  }

  let points = new Array<types.SeriesHighlight>();
  let series = new Array<types.SeriesValue>();
  datasets.forEach((dataset: Plottable.Dataset) => {
    var data = dataset.data() as types.Point[];
    if (data.length === 0 || data[0].t > target) {
      series.push({...dataset.metadata() as types.Metadata, value: ''});
      return;
    }
    var index = _.sortedIndex<{t: Date}, Date>(data, {t: target}, _.property('t'));
    if (!(index < data.length && data[index].t === target)) {
      index -= 1;
    }
    var point = data[index];
    points.push({...dataset.metadata() as types.Metadata, ...point});
    series.push({...dataset.metadata() as types.Metadata, value: point.y});
  });
  return {
    points: points,
    series: series,
  };
}

function datasetsFromResults(results: QueryResult[]) {
  return results.map((result: QueryResult) => {
    var dataset = _.map(result.values, (value) => {
      return {
        t: new Date(value[0] * 1000),
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

interface MetricsPanelProps {
  highlightTime: Date;
  queries: QueryOptions[];
  onSelectMetric: (queryIndex: number, metricLabels: {[label: string]: string}) => void;
  graphHeight: string;
}

interface MetricsPanelState {
  datasets: Plottable.Dataset[];
  points: types.SeriesHighlight[];
  series: types.SeriesValue[];
}

class MetricsPanel extends React.Component<MetricsPanelProps, MetricsPanelState> {
  constructor(props: MetricsPanelProps) {
    super(props);
    this.state = {
      datasets: [],
      points: [],
      series: [],
    };
    this._onData = this._onData.bind(this);
  }
  _onData(results: QueryResult[]): void {
    const datasets = datasetsFromResults(results);
    this.setState({
      ...this.state,
      datasets,
      ...computeHighlights(datasets, this.props.highlightTime),
    });
  }
  componentWillReceiveProps(nextProps: MetricsPanelProps) {
    this.setState({
      ...this.state,
      ...computeHighlights(this.state.datasets, nextProps.highlightTime),
    });
  }
  render() {
    return (
      <div>
        <QuerySet queries={this.props.queries} strictMatch={true} onQueryData={this._onData} />
        <GraphContainer
          datasets={this.state.datasets}
          highlights={this.state.points}
          onSelectMetric={this.props.onSelectMetric}
          height={this.props.graphHeight}
        />
        <QueryKey series={this.state.series} onSelectMetric={this.props.onSelectMetric} />
      </div>
    );
  }
}

interface MetricsPanelContainerProps {
  queries: QueryOptions[];
  onSelectMetric: (queryIndex: number, metricLabels: {[label: string]: string}) => void;
  graphHeight: string;
}

export const MetricsPanelContainer: React.ComponentClass<MetricsPanelContainerProps> = connect(
  (state) => ({
    highlightTime: state.hover.time,
  }),
  null,
  null,
  {pure: false}
)(MetricsPanel);
