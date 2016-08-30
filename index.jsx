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

function FormatMetric(metric) {
  var title = "";
  Object.keys(metric).forEach(function(key) {
    if (title == '') {
      title = '{';
    }
    if (key == "__name__") {
      title = metric[key] + title;
      return;
    }
    if (!title.endsWith('{')) {
      title = title + ',';
    }
    title = title + key + "=" + JSON.stringify(metric[key]);
  });
  if (title.endsWith('{')) {
    title = title.substr(0, title.length-1);
  } else if (title != '') {
    title = title + '}';
  }
  return title;
}

function FormatTemplate(template, props) {
  var r = /([^$]|^)\$\{([^}]*)\}/;
  var pieces = template.split(r);
  var result = "";
  for (var i = 0; i < pieces.length; i++) {
    if (i % 3 != 2) {
      result += pieces[i];
      continue;
    }
    var key = pieces[i];
    if (key == "") {
      result += "$";
    } else if (props.hasOwnProperty(key)) {
      result += props[key];
    } else {
      // TODO: proper error handling
      console.log("unknown key in tempate: ", key);
    }
  }
  return result;
}

function MatchFilter(matches, filter) {
  if (!matches) {
    return true;
  }
  var matcherHasKeys = Object.keys(filter).every(function(key) {
    return matches.hasOwnProperty(key);
  }.bind(this));
  if (!matcherHasKeys) {
    return false;
  }
  var matches = Object.keys(matches).every(function(key) {
    var r = new RegExp(matches[key]);
    var v = _(filter).has(key) ? filter[key] : "";
    return r.test(v);
  }.bind(this));
  return matches;
}

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

class RangePicker extends React.Component {
  constructor(props) {
    super(props);
    this._updateDuration = this._updateDuration.bind(this);
    this._updateEnd = this._updateEnd.bind(this);
  }
  _updateDuration(duration) {
    this.props.onChange({end: this.props.range.end, duration: duration});
  }
  _updateEnd(end) {
    this.props.onChange({end: end, duration: this.props.range.duration});
  }
  render() {
    return <div><DurationPicker value={this.props.range.duration} onChange={this._updateDuration} /><TimePicker value={this.props.range.end} step={this.props.range.duration} onChange={this._updateEnd} /></div>
  }
}
RangePicker.propTypes = {
  range: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func.isRequired,
}

class DurationPicker extends React.Component {
  static parseDuration(durationString) {
    if (!durationString) {
      return 0;
    }
    var [_, weeks, days, hours, minutes, seconds] = durationString.match(/^(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) || [];
    var res = parseInt(weeks || '0')
    res = res * 7 + parseInt(days || '0');
    res = res * 24 + parseInt(hours || '0');
    res = res * 60 + parseInt(minutes || '0');
    res = res * 60 + parseInt(seconds || '0');
    return res;
  }
  static formatDuration(seconds) {
    var week = 7*24*60*60;
    var day = 24*60*60;
    var hour = 60*60;
    var minute = 60;
    var res = "";
    if (seconds >= week) {
      var weeks = Math.floor(seconds / week);
      res = res + weeks.toString() + "w";
      seconds = seconds - weeks * week;
    }
    if (seconds >= day) {
      var days = Math.floor(seconds / day);
      res = res + days.toString() + "d";
      seconds = seconds - days * day;
    }
    if (seconds >= hour) {
      var hours = Math.floor(seconds / hour);
      res = res + hours.toString() + "h";
      seconds = seconds - hours * hour;
    }
    if (seconds >= minute) {
      var minutes = Math.floor(seconds / minute);
      res = res + minutes.toString() + "m";
      seconds = seconds - minutes * minute;
    }
    if (seconds > 0) {
      res = res + seconds.toString() + "s";
    }
    return res;
  }
  constructor(props) {
    super(props);
    var m = 60;
    var h = m*60;
    var d = h*24;
    var w = 7*d;
    this.steps = [10, 30, m, 5*m, 15*m, 30*m, h, 3*h, 6*h, 12*h, d, 3*d, w, 2*w, 4*w, 12*w, 53*w];
    this.state = {
      inputValue: DurationPicker.formatDuration(props.value),
      dirty: false
    }
    this._onIncreaseDuration = this._onIncreaseDuration.bind(this);
    this._onDecreaseDuration = this._onDecreaseDuration.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    var nextDuration = DurationPicker.formatDuration(nextProps.value)
    if (nextDuration != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextDuration, dirty: false });
    }
  }
  _onIncreaseDuration() {
    for (var i = 0; i < this.steps.length; i++) {
      if (this.steps[i] > this.props.value) {
        this.props.onChange(this.steps[i]);
        return;
      }
    }
    this.props.onChange(this.props.value * 2);
  }
  _onDecreaseDuration() {
    for (var i = this.steps.length; i > 0; i--) {
      if (this.steps[i-1] < this.props.value) {
        this.props.onChange(this.steps[i-1]);
        return;
      }
    }
  }
  _onFormSubmit(event) {
    event.preventDefault();
    var duration = DurationPicker.parseDuration(this.state.inputValue);
    if (duration != 0) {
      this.props.onChange(duration)
    }
  }
  _onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true });
  }
  render() {
    return (
      <form action="" onSubmit={this._onFormSubmit}>
        <button type="button" onClick={this._onDecreaseDuration}>&#8722;</button>
        <input type="text" value={this.state.inputValue} onChange={this._onInputChange} className={(DurationPicker.parseDuration(this.state.inputValue) == 0 ? "error" : "valid") + (this.state.dirty ? " dirty" : "")} />
        <button type="button" onClick={this._onIncreaseDuration}>+</button>
      </form>
    );
  }
}
DurationPicker.propTypes = {
  value: React.PropTypes.number.isRequired,
  onChange: React.PropTypes.func.isRequired,
}

class TimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: moment(this.props.value).format("YYYY-MM-DD HH:mm:ssZZ"),
      dirty: false,
    }
    this._onInputChange = this._onInputChange.bind(this);
    this._onPickNow = this._onPickNow.bind(this);
    this._onStepBack = this._onStepBack.bind(this);
    this._onStepForward = this._onStepForward.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
  }
  _parsedInput() {
    return moment(this.state.inputValue, moment.ISO_8601, true);
  }
  componentWillReceiveProps(nextProps) {
    var nextValue = moment(nextProps.value).format("YYYY-MM-DD HH:mm:ssZZ")
    if (nextValue != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextValue, dirty: false });
    }
  }
  _onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true});
  }
  _onPickNow() {
    this.props.onChange(new Date());
  }
  _onStepBack() {
    this.props.onChange(new Date(this.props.value.getTime() - this.props.step*1000));
  }
  _onStepForward() {
    this.props.onChange(new Date(this.props.value.getTime() + this.props.step*1000));
  }
  _onFormSubmit(event) {
    event.preventDefault();
    var value = this._parsedInput();
    if (value.isValid()) {
      this.props.onChange(value.toDate());
    }
  }
  render() {
    return (
      <form action="" onSubmit={this._onFormSubmit}>
        <button type="button" onClick={this._onStepBack}>-{DurationPicker.formatDuration(this.props.step)}</button>
        <input type="text" value={this.state.inputValue} onChange={this._onInputChange} className={(this._parsedInput().isValid() ? "valid" : "error") + (this.state.dirty ? " dirty" : "")}/>
        <button type="button" onClick={this._onStepForward}>+{DurationPicker.formatDuration(this.props.step)}</button>
        <button type="button" onClick={this._onPickNow}>now</button>
      </form>
    );
  }
}
TimePicker.propTypes = {
  value: React.PropTypes.object.isRequired,
  step: React.PropTypes.number.isRequired,
  onChange: React.PropTypes.func.isRequired,
}

class FilterSelectControl extends React.Component {
  constructor(props) {
    super(props);
  }
  _onSelect(label, value) {
    var filter = _.clone(this.props.filter);
    if (value) {
      filter[label] = value;
    } else {
      delete filter[label];
    }
    this.props.onChange(filter);
  }
  _removeLabel(label) {
    var filter = _.clone(this.props.filter);
    delete filter[label];
    this.props.onChange(filter);
  }
  render() {
    var selectorLabels = this.props.selectors.map(function(s) { return s.label; });
    var unknown = _.difference(_.keys(this.props.filter), selectorLabels);
    return (
      <ul>
        {this.props.selectors.map(function(selector) {
          var value = (
            _(this.props.filter).has(selector.label)
            ? this.props.filter[selector.label]
            : ""
          );
          return (
            <li key={selector.label}>
              <span>{selector.label}</span>
              <FilterSelector
                queries={selector.queries || []}
                time={this.props.time}
                filter={this.props.filter}
                value={value}
                options={selector.options}
                onChange={this._onSelect.bind(this, selector.label)} />
            </li>
          );
        }.bind(this))}
        {unknown.map(function(label) {
          return (
            <li key={label}>
              <span>{label}</span>
              <button type="button" onClick={this._removeLabel.bind(this, label)}>X</button>
            </li>
          );
        }.bind(this))}
      </ul>
    );
  }
}
FilterSelectControl.propTypes = {
  selectors: React.PropTypes.array.isRequired,
  filter: React.PropTypes.object.isRequired,
  time: React.PropTypes.number.isRequired,
  onChange: React.PropTypes.func.isRequired,
}

class FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this._onSelect = this._onSelect.bind(this);
    this.queries = null;
    this.state = {
      labels: [],
    }
  }
  componentWillMount() {
    this._setupQueries(this.props);
  }
  comopnentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.queries, nextProps.queries)) {
      this._setupQueries(nextProps);
    } else if (this.props.time != nextProps.time || !_.isEqual(this.props.filter, nextProps.filter)) {
      this.queries.updateData(nextProps.time, nextProps.filter);
    }
  }
  _setupQueries(props) {
    this.queries = new SelectorQuerySet(props.queries, function(labels) {
      this.setState({labels: labels});
    }.bind(this));
    if (props.time && props.filter) {
      this.queries.updateData(props.time, props.filter);
    }
  }
  _onSelect(event) {
    this.props.onChange(event.target.value);
  }
  render() {
    var value = this.props.value;
    var options = _.union(this.props.options, this.state.labels);
    if (!_(options).contains(value)) {
      options = [value].concat(options);
    }
    if (!_(options).contains("")) {
      options = [""].concat(options);
    }
    return (
      <select value={value} onChange={this._onSelect}>
        {options.map(function(option) {
          return <option key={option} value={option}>{option}</option>;
        }.bind(this))}
      </select>
    );
  }
}
FilterSelector.propTypes = {
  queries: React.PropTypes.array.isRequired,
  time: React.PropTypes.number.isRequired,
  filter: React.PropTypes.object.isRequired,
  value: React.PropTypes.string.isRequired,
  options: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired,
}

class SelectorQuerySet {
  constructor(queries, onData) {
    this.queries = queries.map(function(options, index) {
      return new SelectorQuery(
          options.label, options.query, options.match, this._onQueryData.bind(this, index));
    }.bind(this));
    this.labelsets = Array(this.queries.length);
    this.onData = onData.bind(undefined);
  }
  updateData(time, filter) {
    this.queries.forEach(function(query) {
      query.updateData(time, filter);
    });
  }
  _onQueryData(queryIndex, dataset) {
    this.labelsets[queryIndex] = dataset;
    var labels = _(this.labelsets).flatten(true);
    labels = _.filter(labels, _.identity);
    labels = _.sortBy(labels, _.identity);
    labels = _.uniq(labels, true);
    this.onData(labels);
  }
}

class SelectorQuery {
  constructor(label, query, match, onData) {
    this.label = label;
    this.query = query;
    this.match = match;
    this.onData = onData.bind(undefined);
    this.loading = {};
  }
  updateData(time, filter) {
    if (!MatchFilter(this.match, filter)) {
      this.onData([]);
      return;
    }
    var query = FormatTemplate(this.query, filter);
    if (this.loading.query == query && this.loading.time == time) {
      console.log("cached", query);
      return;
    }
    if (this.loading.req) {
      this.loading.req.abort();
    }
    console.log("loading", query);
    var req = $.get("http://localhost:9090/api/v1/query", {
      query: query,
      time: time,
    }).always(function() {
      this.loading.req = null;
    }.bind(this)).done(function(data) {
      this._handleResponse(data);
    }.bind(this));
    this.loading = {
      req: req,
      query: query,
      time: time,
    }
  }
  _handleResponse(response) {
    if (response.status != "success") {
      console.warn("selector query returned status", response.status);
      this.onData([]);
      return;
    }
    if (response.data.resultType != "vector") {
      console.warn("expected selector query to return a instant vector, got a", response.data.resultType);
      this.onData([]);
      return;
    }
    var values = response.data.result.map(function(result) {
      return result.metric[this.label];
    }.bind(this)).filter(_.identity);
    this.onData(values)
  }
}

class FilterControl extends React.Component {
  constructor(props) {
    super(props);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._addFilter = this._addFilter.bind(this);
    this._removeFilter = this._removeFilter.bind(this);
  }
  _onFilterChange(event) {
    var filter = Object.assign({}, this.props.filter);
    filter[event.target.name] = event.target.value;
    this.props.onChange(filter);
  }
  _addFilter(event) {
    event.preventDefault();
    var filter = Object.assign({}, this.props.filter);
    filter[event.target.name.value] = "";
    this.props.onChange(filter);
  }
  _removeFilter(event) {
    event.preventDefault();
    var filter = Object.assign({}, this.props.filter);
    delete filter[event.target.name];
    this.props.onChange(filter);
  }
  render() {
    return (
      <ul>
        {Object.keys(this.props.filter).map(function(name) {
          return (
            <li key={name}>
              <label htmlFor={"filter-" + name}>{name}</label>
              <input type="text" id={"filter-" + name} name={name} value={this.props.filter[name]} onChange={this._onFilterChange} />
              <button type="button" name={name} onClick={this._removeFilter}>X</button>
            </li>
          );
        }.bind(this))}
        <li>
          <form action="" onSubmit={this._addFilter}>
            <input name="name" />
          </form>
        </li>
      </ul>
    );
  }
}
FilterControl.propTypes = {
  filter: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func.isRequired,
}

ReactDOM.render(<App />, document.getElementById('content'));
