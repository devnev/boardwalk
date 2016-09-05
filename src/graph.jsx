// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import React from 'react';
import Plottable from 'plottable';
import QuerySet from './range_query.jsx';
import { TimeScale, Filter } from './dispatch.jsx';

export default class GraphPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      legend: [],
    };
    this._setLegend = this._setLegend.bind(this);
  }
  _setLegend(legend) {
    if (!_.isEqual(this.state.legend, legend)) {
      this.setState({legend: legend});
    }
  }
  render() {
    return (
      <div>
        <Graph
          {...this.props}
          onUpdateValues={this._setLegend} />
        <Legend
          items={this.state.legend}
          cScale={this.props.cScale} />
      </div>
    );
  }
}
GraphPanel.propTypes = {
  cScale: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
  onSelectTime: React.PropTypes.func.isRequired,
};

// Copied from Plottable.Axes.Time's default configuration, changing clocks from 12h with 24h.
var DEFAULT_TIME_AXIS_CONFIGURATIONS = [
  [
      { interval: Plottable.TimeInterval.second, step: 1, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 5, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 10, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 15, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 30, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 1, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 5, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 10, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 15, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 30, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 1, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 3, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 6, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 12, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%a %e") },
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%B %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%e") },
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%B %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%B") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%b") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 3, formatter: Plottable.Formatters.time("%b") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 6, formatter: Plottable.Formatters.time("%b") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 5, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 25, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 50, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 100, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 200, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 500, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1000, formatter: Plottable.Formatters.time("%Y") },
  ],
];

class QueryCaptions {
  constructor() {
    this.nearest = new Plottable.Dataset();
    this.dataset = new Plottable.Dataset();
    this.sources = [];
  }
  target(targetTime) {
    if (!targetTime) {
      this.nearest.data([]);
      this.dataset.data(this.sources.map(function(dataset) {
        return {caption: dataset.metadata().title, value: ""};
      }));
      this._target = undefined;
      return;
    }

    var points = [];
    var values = [];
    this.sources.forEach(function(dataset) {
      var data = dataset.data();
      if (data.length == 0 || data[0].t > targetTime) {
        values.push({caption: dataset.metadata().title, value: ""});
        return;
      }
      var index = _.sortedIndex(data, {t: targetTime}, 't');
      if (!(index < data.length && data[index].t === targetTime)) {
        index -= 1;
      }
      var point = data[index];
      points.push(_({caption: dataset.metadata().title}).assign(point));
      values.push({caption: dataset.metadata().title, value: point.y});
    }.bind(this));
    _.defer(function() {
      this.nearest.data(points);
      this.dataset.data(values);
    }.bind(this));
    this._target = targetTime;
  }
  setSources(datasets) {
    this.sources = datasets || [];
    this.target(this._target);
  }
}

function NewDataPlot(tScale, yScale, cScale) {
  var plot = new Plottable.Plots.Line();
  plot.x(function(d) { return d.t; }, tScale);
  plot.y(function(d) { return d.y; }, yScale);
  plot.attr("stroke", function(d, i, dataset) { return dataset.metadata().title; }, cScale);
  return plot;
}

function NewHighlightPlot(tScale, yScale, cScale) {
  var plot = new Plottable.Plots.Scatter();
  plot.x(function(d) { return d.t; }, tScale);
  plot.y(function(d) { return d.y; }, yScale);
  plot.attr("fill", function(d) { return d.caption; }, cScale);
  plot.size(10);
  plot.autorangeMode("none");
  return plot;
}

class Legend extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(function(item, index) {
          var caption = item.caption;
          var value = item.value;
          var colorStyle = {color: this.props.cScale.scale(caption)};
          return (<li key={caption+index}>
            <span style={colorStyle}>&#x25cf;</span>
            <span>{caption}</span>
            <span>{value}</span>
          </li>);
        }.bind(this))}
      </ul>
    );
  }
}
Legend.propTypes = {
  items: React.PropTypes.array.isRequired,
  cScale: React.PropTypes.object.isRequired,
}

class Graph extends React.Component {
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
  shouldComponentUpdate(props, state) {
    return (
      this.props.cScale !== props.cScale ||
      !_.isEqual(this.props.options, props.options)
    );
  }
  render() {
    this._setup();
    return <svg id={this.id} width="100%" height="300px" ref={(ref) => this.graph.renderTo(ref)} />
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
    // axes and scales
    var tAxis = new Plottable.Axes.Time(TimeScale.scale(), "bottom");
    tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
    var yScale = new Plottable.Scales.Linear();
    yScale.domainMin(0);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    yAxis.formatter(Plottable.Formatters.siSuffix());
    yAxis.usesTextWidthApproximation(true);

    // the graph
    this.guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(TimeScale.scale());
    this.plot = NewDataPlot(TimeScale.scale(), yScale, this.props.cScale);
    this.highlight = NewHighlightPlot(TimeScale.scale(), yScale, this.props.cScale);
    var panel = new Plottable.Components.Group([this.guideline, this.plot, this.highlight]);
    this.graph = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

    // interactions
    var panZoom = new Plottable.Interactions.PanZoom(TimeScale.scale(), null);
    panZoom.attachTo(panel);
    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(point) {
      this.props.onHoverTime(this._timeForPoint(tAxis, point));
    }.bind(this));
    pointer.onPointerExit(function() {
      this.props.onHoverTime();
    }.bind(this));
    pointer.attachTo(panel);
    var click = new Plottable.Interactions.DoubleClick();
    click.onDoubleClick(function(point) {
      this.props.onSelectTime(this._timeForPoint(tAxis, point));
    }.bind(this));
    click.attachTo(panel);

    // the data
    this.captions = new QueryCaptions();
    this.captions.dataset.onUpdate(function(dataset) {
      this.props.onUpdateValues(dataset.data());
    }.bind(this));
    this.highlight.datasets([this.captions.nearest]);
    this.queries = new QuerySet(this.props.options.queries, function(datasets) {
      this.plot.datasets(datasets);
      this.captions.setSources(datasets);
    }.bind(this));
    this._updateData();
    this._updateHighlight(this.props.highlightTime);
  }
}
Graph.propTypes = {
  cScale: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
  onSelectTime: React.PropTypes.func.isRequired,
};

