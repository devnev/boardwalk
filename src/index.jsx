import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import $ from 'jquery';
import Plottable from 'plottable';
import { RangePicker, FilterSelectControl, FilterControl } from './controls.jsx';
import { FormatMetric, FormatTemplate, MatchFilter } from './utils.jsx';

function SetSubState(component, values) {
  var same = true;
  for (var key in values) {
    if (!_.has(values, key)) {
      continue;
    }
    if (!_.has(component.state, key)) {
      same = false;
      break;
    }
    if (component.state[key] !== values[key]) {
      same = false;
      break;
    }
    if (!_.isEqual(component.state[key], values[key])) {
      same = false;
      break;
    }
  }
  if (!same) {
    var state = _.clone(component.state);
    component.setState(_.assign(state, values));
  }
}

function ParseHashURI(hash) {
  var hashURI = hash;
  if (hash.substr(0, 1) === "#") {
    hashURI = hash.substr(1);
  }
  var qmarkPos = hashURI.indexOf("?");
  if (qmarkPos == -1) {
    return {path: decodeURIComponent(hashURI), params: {}};
  }
  var path = decodeURIComponent(hashURI.substr(0, qmarkPos));
  var paramsParts = hashURI.substr(paramsStart + 1).split("&");
  var params = {};
  for (var i = 0; i < paramsParts.length; i++) {
    var paramStr = paramsParts[i];
    var eqPos = paramStr.indexOf("=");
    var name = paramStr;
    var value = "";
    if (eqPos != -1) {
      name = paramStr.substr(0, eqPos);
      value = paramStr.substr(eqPos + 1);
    }
    name = decodeURIComponent(name);
    value = decodeURIComponent(value);
    if (!_.has(params, name)) {
      params[name] = [];
    }
    params[name].push(value);
  }
  return {path: path, params: params};
}

class HashURIStore {
  constructor() {
    this._path = "";
    this._params = {};
    this._callbacks = new Plottable.Utils.CallbackSet();
    this._parseHash = this._parseHash.bind(this);
    window.addEventListener("hashchange", this._parseHash);
    this._parseHash();
  }
  _parseHash() {
    var uri = ParseHashURI(window.location.hash);
    this._path = uri.path;
    this._params = uri.params;
    this._callbacks.callCallbacks(this);
  }
  onUpdate(callback, immediate) {
    this._callbacks.add(callback);
    if (immediate) {
      callback(this);
    }
    return this;
  }
  offUpdate(callback) {
    this._callbacks.delete(callback);
    return this;
  }
  path() {
    return this._path;
  }
  has(name) {
    return _.has(this.params, name);
  }
  first(name) {
    if (!this.has(name)) {
      return;
    }
    return this._params[name][0];
  }
  params(name) {
    if (!this.has(name)) {
      return;
    }
    return this._params[name];
  }
}

var hashURI = new HashURIStore();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      console: "/",
      range: {
        end: new Date(),
        duration: 1*60*60
      },
      tScale: new Plottable.Scales.Time(),
      filter: {},
    };
    this._updateRange = this._updateRange.bind(this);
    this._updateFilter = this._updateFilter.bind(this);
    this._navigate = this._navigate.bind(this);
  }
  componentWillMount() {
    hashURI.onUpdate(this._navigate, true);
    this.req = $.get("/config.json");
    this.req.done(function(data) { SetSubState(this, {config: data}); }.bind(this));
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    hashURI.offUpdate(this._navigate);
  }
  componentWillUpdate(nextProps, nextState) {
    if (nextState.tScale !== this.state.tScale) {
      if (this.state.tScale) {
        this.state.tScale.offUpdate(this._setRangeFromScale);
      }
      if (nextState.tScale) {
        nextState.tScale.onUpdate(this._setRangeFromScale);
      }
    }
  }
  _setRangeFromScale() {
    var range = {
      end: this.state.tScale.domainMax(),
      duration: Math.floor((this.state.tScale.domainMax().getTime() - this.state.tScale.domainMin().getTime())/1000),
    };
    this._updateRange(range);
  }
  _setScaleFromRange() {
    var range = this.state.range;
    var start = new Date(range.end.getTime() - range.duration*1000);
    if (start.getTime() !== this.state.tScale.domainMin().getTime() ||
        range.end.getTime() !== this.state.tScale.domainMax().getTime()) {
      this.state.tScale.domain([start, range.end]);
    }
  }
  _updateRange(range) {
    SetSubState(this, {range: range});
  }
  _updateFilter(filter) {
    SetSubState(this, {filter: filter});
  }
  _navigate(hashURI) {
    SetSubState(this, {console: hashURI.path().replace(/\/+$/, "")});
  }
  render() {
    this._setScaleFromRange();
    if (!this.state.config) {
      return <p>Loading config...</p>
    }
    var console = this.state.config[this.state.console];
    if (!console) {
      console = {
        title: "Console Not Found",
        selectors: [],
        contents: [],
      };
    }
    return (
      <div>
        <ConsoleNav consoles={this.state.config} />
        <h1>{console.title}</h1>
        <RangePicker
          range={this.state.range}
          onChange={this._updateRange} />
        <FilterControl
          filter={this.state.filter}
          onChange={this._updateFilter} />
        <FilterSelectControl
          selectors={console.selectors}
          filter={this.state.filter}
          time={this.state.range.end.getTime()/1000}
          onChange={this._updateFilter} />
        <Console
          key={this.state.console}
          items={console.contents}
          filter={this.state.filter}
          tScale={this.state.tScale} />
      </div>
    );
  }
}
App.propTypes = {};

class ConsoleNav extends React.Component {
  render() {
    return (
      <nav><ul>
        {Object.keys(this.props.consoles || {}).map(function(path) {
          var console = this.props.consoles[path];
          return <li key={path}><a href={"#" + path}>{console.title}</a></li>;
        }.bind(this))}
      </ul></nav>
    );
  }
}
ConsoleNav.propTypes = {
  consoles: React.PropTypes.object.isRequired,
};

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cScale: new Plottable.Scales.Color(),
      hoveredTime: null,
      selectedTime: null,
    }
    this._setHoverTime = this._setHoverTime.bind(this);
    this._setSelectedTime = this._setSelectedTime.bind(this);
  }
  _setHoverTime(hoveredTime) {
    SetSubState(this, {hoveredTime: hoveredTime});
  }
  _setSelectedTime(selectedTime) {
    SetSubState(this, {
      selectedTime: this.state.selectedTime ? null : selectedTime,
    });
  }
  render() {
    var targetTime = this.state.selectedTime;
    if (!targetTime) {
      targetTime = this.state.hoveredTime;
    }
    if (!targetTime) {
      targetTime = this.props.tScale.domainMax();
    }
    return (
      <div>
        {this.props.items.map(function(item, index) {
          if (item.graph) {
            return (
              <GraphPanel 
                key={index}
                options={item.graph}
                tScale={this.props.tScale}
                cScale={this.state.cScale}
                onHoverTime={this._setHoverTime}
                onSelectTime={this._setSelectedTime}
                highlightTime={targetTime}
                filter={this.props.filter} />
            );
          }
        }.bind(this))}
      </div>
    );
  }
}
Console.propTypes = {
  items: React.PropTypes.array.isRequired,
  filter: React.PropTypes.object.isRequired,
  tScale: React.PropTypes.object.isRequired,
};

class GraphPanel extends React.Component {
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
  tScale: React.PropTypes.object.isRequired,
  cScale: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
  onSelectTime: React.PropTypes.func.isRequired,
  filter: React.PropTypes.object.isRequired,
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

class RangeQuery {
  constructor(options, onData) {
    this.options = options;
    this.onData = onData.bind(undefined);
    this.loading = {};
  }
  _updateDatasets(results) {
    var datasets = results.map(function(result) {
      var title = (
        this.options.title ?
        FormatTemplate(this.options.title, result.metric) :
        FormatMetric(result.metric)
      );
      var dataset = _.map(result.values, function(value) {
        return {
          t: new Date(value[0]*1000),
          y: parseFloat(value[1]),
        };
      }.bind(this));
      return new Plottable.Dataset(dataset, {title: title});
    }.bind(this));
    this.onData(datasets);
  }
  updateData(start, end, filter) {
    if (!MatchFilter(this.options.match, filter)) {
      this._updateDatasets([]);
      return;
    }
    var query = FormatTemplate(this.options.query, filter);
    var step = Math.floor((end - start) / 200).toString() + "s";
    if (this.loading) {
      if (this.loading.query == query && this.loading.start == start && this.loading.end == end) {
        console.log("cached", query);
        return;
      }
      if (this.loading.req) {
        this.loading.req.abort();
      }
    }
    console.log("loading", query);
    var req = $.get("http://localhost:9090/api/v1/query_range", {
      query: query,
      start: start,
      end: end,
      step: step,
    }).always(function() {
      this.loading.req = null;
    }.bind(this)).done(function(data) {
      this._updateDatasets(data.data.result);
    }.bind(this));
    this.loading = {
      req: req,
      query: query,
      start: start,
      end: end,
    }
  }
}

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

class QuerySet {
  constructor(queries, onData) {
    this.queries = queries.map(function(query, index) {
      return new RangeQuery(query, this._onQueryData.bind(this, index));
    }.bind(this));
    this.datasets = Array(this.queries.length);
    this.onData = onData.bind(undefined);
  }
  updateData(start, end, filter) {
    this.queries.forEach(function(query) {
      query.updateData(start, end, filter);
    }.bind(this));
  }
  _onQueryData(queryIndex, datasets) {
    this.datasets[queryIndex] = datasets;
    var datasets = _.flatten(this.datasets, true).filter(function(d) { return d; });
    this.onData(datasets);
  }
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
    this.props.tScale.onUpdate(this._onParamsUpdate);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
    this.props.tScale.offUpdate(this._onParamsUpdate);
    this.graph.destroy();
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.filter, nextProps.filter)) {
      this._onParamsUpdate();
    }
    if (!_.isEqual(this.props.highlightTime, nextProps.highlightTime)) {
      this._updateHighlight(nextProps.highlightTime);
    }
    if (nextProps.tScale !== this.props.tScale) {
      this.props.tScale.offUpdate(this._onParamsUpdate);
      nextProps.tScale.onUpdate(this._onParamsUpdate);
    }
  }
  shouldComponentUpdate(props, state) {
    return (
      this.props.tScale !== props.tScale ||
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
    var timeWidth = this.props.tScale.domainMax().getTime() - this.props.tScale.domainMin().getTime();
    return new Date(this.props.tScale.domainMin().getTime() + timeWidth * position);
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
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    this.queries.updateData(start, end, this.props.filter);
  }
  _updateHighlight(targetTime) {
    this.guideline.value(targetTime);
    this.captions.target(targetTime);
  }
  _setup() {
    // axes and scales
    var tAxis = new Plottable.Axes.Time(this.props.tScale, "bottom");
    tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
    var yScale = new Plottable.Scales.Linear();
    yScale.domainMin(0);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    yAxis.formatter(Plottable.Formatters.siSuffix());
    yAxis.usesTextWidthApproximation(true);

    // the graph
    this.guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(this.props.tScale);
    this.plot = NewDataPlot(this.props.tScale, yScale, this.props.cScale);
    this.highlight = NewHighlightPlot(this.props.tScale, yScale, this.props.cScale);
    var panel = new Plottable.Components.Group([this.guideline, this.plot, this.highlight]);
    this.graph = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

    // interactions
    var panZoom = new Plottable.Interactions.PanZoom(this.props.tScale, null);
    panZoom.attachTo(panel);
    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(point) {
      this.props.onHoverTime(this._timeForPoint(tAxis, point));
    }.bind(this));
    pointer.onPointerExit(function() {
      this.props.onHoverTime();
    }.bind(this));
    pointer.attachTo(panel);
    var click = new Plottable.Interactions.Click();
    click.onClick(function(point) {
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
  tScale: React.PropTypes.object.isRequired,
  cScale: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
  onHoverTime: React.PropTypes.func.isRequired,
  onSelectTime: React.PropTypes.func.isRequired,
  filter: React.PropTypes.object.isRequired,
};

ReactDOM.render(<App />, document.getElementById('content'));
