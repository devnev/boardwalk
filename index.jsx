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
      filter: {},
    };
    this._updateRange = this._updateRange.bind(this);
    this._updateFilter = this._updateFilter.bind(this);
    this._navigate = this._navigate.bind(this);
  }
  componentDidMount() {
    this.req = $.get("/config.json");
    this.req.done(function(data) { this.setState({config: data}); }.bind(this));
    window.addEventListener("hashchange", this._navigate);
    this._navigate();
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    window.removeEventListener("hashchange", this._navigate);
  }
  _updateRange(range) {
    if (range.end.getTime() == this.state.range.end.getTime() &&
        range.duration == this.state.range.duration) {
      return;
    }
    var state = Object.assign({}, this.state);
    state.range = range;
    this.setState(state);
  }
  _updateFilter(filter) {
    var state = Object.assign({}, this.state);
    state.filter = filter;
    this.setState(state);
  }
  _navigate() {
    var path = window.location.hash.substr(1);
    var paramsStart = path.indexOf("?");
    if (paramsStart != -1) {
      path = path.substr(0, paramsStart);
    }
    var state = Object.assign({}, this.state);
    state.console = path;
    this.setState(state);
  }
  render() {
    if (!this.state.config) {
      return <p>Loading config...</p>
    }
    var path = this.state.console.replace(/\/+$/, "");
    var console = this.state.config[path];
    if (!console) {
      return <p>Console not found.</p>
    }
    return (
      <div>
        <ConsoleNav consoles={this.state.config} />
        <h1>{console.title}</h1>
        <RangePicker range={this.state.range} onChange={this._updateRange} />
        <FilterControl filter={this.state.filter} onChange={this._updateFilter} />
        <FilterSelectControl selectors={console.selectors} filter={this.state.filter} onChange={this._updateFilter} />
        <Console key={path} items={console.contents} range={this.state.range} filter={this.state.filter} onChangeRange={this._updateRange} />
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
    this.tScale = new Plottable.Scales.Time();
    this.cScale = new Plottable.Scales.Color();
    this.hoverPoint = new Plottable.Dataset();
    this.selected = false;
    this.hovered = false;
    if (props.range) {
      this._setRange(props.range);
    }
    this.tScale.onUpdate(function() {
      this.props.onChangeRange({
        end: this.tScale.domainMax(),
        duration: Math.floor((this.tScale.domainMax().getTime() - this.tScale.domainMin().getTime())/1000),
      });
    }.bind(this));
    this._setHoverTime = this._setHoverTime.bind(this);
    this._setSelectedTime = this._setSelectedTime.bind(this);
  }
  _setRange(range) {
    this.tScale.domain([new Date(range.end.getTime() - range.duration*1000), range.end]);
    if (!this.selected && !this.hovered) {
      this.hoverPoint.data([this.tScale.domainMax()]);
    }
  }
  _setHoverTime(hoveredTime) {
    this.hovered = !!hoveredTime;
    if (this.selected) {
      return;
    }
    if (!hoveredTime) {
      this.hoverPoint.data([this.tScale.domainMax()]);
      return;
    }
    this.hoverPoint.data([hoveredTime]);
  }
  _setSelectedTime(selectedTime) {
    this.selected = !this.selected;
    this.hoverPoint.data([selectedTime]);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.range, nextProps.range)) {
      this._setRange(nextProps.range);
    }
  }
  render() {
    return (
      <div>
        {this.props.items.map(function(item, index) {
          if (item.graph) {
            return (
              <GraphPanel 
                key={index}
                options={item.graph}
                tScale={this.tScale}
                cScale={this.cScale}
                onHoverTime={this._setHoverTime}
                onSelectTime={this._setSelectedTime}
                hoverPoint={this.hoverPoint}
                filter={this.props.filter} />
            );
          }
        }.bind(this))}
      </div>
    );
  }
}
Console.propTypes = {
  range: React.PropTypes.object.isRequired,
  items: React.PropTypes.array.isRequired,
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
          options={this.props.options}
          tScale={this.props.tScale}
          cScale={this.props.cScale}
          onHoverTime={this.props.onHoverTime}
          onSelectTime={this.props.onSelectTime}
          onUpdateValues={this._setLegend}
          hoverPoint={this.props.hoverPoint}
          filter={this.props.filter} />
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
  hoverPoint: React.PropTypes.object.isRequired,
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

class Query {
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
  _matchFilter(filter) {
    if (!this.options.match) {
      return true;
    }
    var matcherHasKeys = Object.keys(filter).every(function(key) {
      return this.options.match.hasOwnProperty(key);
    }.bind(this));
    if (!matcherHasKeys) {
      return false;
    }
    var matches = Object.keys(this.options.match).every(function(key) {
      var r = new RegExp(this.options.match[key]);
      var v = filter.hasOwnProperty(key) ? filter[key] : "";
      return r.test(v);
    }.bind(this));
    return matches;
  }
  updateData(start, end, filter) {
    if (!this._matchFilter(filter)) {
      this._updateDatasets([]);
      return;
    }
    var query = FormatTemplate(this.options.query, filter);
    var step = Math.floor((end - start) / 200).toString() + "s";
    if (this.loading && this.loading.req) {
      if (this.loading.query == query && this.loading.start == start && this.loading.end == end) {
        console.log("cached", query);
        return;
      }
      this.loading.req.abort();
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
      for (var i = data.length-1; i >= 0; i--) {
        var point = data[i];
        if (point.t <= targetTime) {
          points.push(_({caption: dataset.metadata().title}).assign(point));
          values.push({caption: dataset.metadata().title, value: point.y});
          return;
        }
      }
      values.push({caption: dataset.metadata().title, value: ""});
    }.bind(this));
    this.nearest.data(points);
    this.dataset.data(values);
    this._target = targetTime;
  }
  setSources(datasets) {
    this.sources = datasets || [];
    this.target(this._target);
  }
}

class QuerySet {
  constructor(queries, tScale, yScale, cScale) {
    this.queries = queries.map(function(query, index) {
      return new Query(query, this._onQueryData.bind(this, index));
    }.bind(this));
    this.captioner = new QueryCaptions();
    this.captions = this.captioner.dataset;
    this.datasets = Array(this.queries.length);

    this.plot = new Plottable.Plots.Line();
    this.plot.x(function(d) { return d.t; }, tScale);
    this.plot.y(function(d) { return d.y; }, yScale);
    this.plot.attr("stroke", function(d, i, dataset) { return dataset.metadata().title; }, cScale);

    this.points = new Plottable.Plots.Scatter();
    this.points.x(function(d) { return d.t; }, tScale);
    this.points.y(function(d) { return d.y; }, yScale);
    this.points.attr("fill", function(d) { return d.caption; }, cScale);
    this.points.size(10);
    this.points.autorangeMode("none");
    this.points.datasets([this.captioner.nearest]);

    this.component = new Plottable.Components.Group([this.plot, this.points]);
  }
  updateData(start, end, filter) {
    this.queries.forEach(function(query) {
      query.updateData(start, end, filter);
    }.bind(this));
  }
  _onQueryData(queryIndex, datasets) {
    this.datasets[queryIndex] = datasets;
    var datasets = _.flatten(this.datasets, true).filter(function(d) { return d; });
    this.captioner.setSources(datasets);
    this.plot.datasets(datasets);
  }
  updateNearest(targetTime) {
    this.captioner.target(targetTime);
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
    this.chart = null;
    this.queries = null;
    this.yScale = new Plottable.Scales.Linear();
    this.yScale.domainMin(0);

    // binds
    this._redraw = this._redraw.bind(this);
    this._onParamsUpdate = _.debounce(this._onParamsUpdate.bind(this), 500);
    this._updateHovered = this._updateHovered.bind(this);
    this._onUpdateCaptions = this._onUpdateCaptions.bind(this);
  }
  shouldComponentUpdate(props, state) {
    return (
      this.props.tScale != props.tScale ||
      this.props.cScale != props.cScale ||
      !_.isEqual(this.props.options, props.options)
    );
  }
  componentWillReceiveProps(props) {
    if (!_.isEqual(this.props.filter, props.filter)) {
      this._onParamsUpdate();
    }
  }
  _timeForPoint(tAxis, point) {
    var position = point.x / tAxis.width();
    var timeWidth = this.props.tScale.domainMax().getTime() - this.props.tScale.domainMin().getTime();
    return new Date(this.props.tScale.domainMin().getTime() + timeWidth * position);
  }
  _redraw() {
    if (this.chart) {
      this.chart.redraw();
    }
  }
  _onParamsUpdate() {
    this._updateData();
  }
  _onUpdateCaptions(dataset) {
    this.props.onUpdateValues(dataset.data());
  }
  _updateData() {
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    this.queries.updateData(start, end, this.props.filter);
  }
  _updateHovered() {
    var targetTime = [undefined].concat(this.props.hoverPoint.data()).pop();
    this.guideline.value(targetTime);
    this.queries.updateNearest(targetTime);
  }
  componentWillMount() {
    this.queries = new QuerySet(
      this.props.options.queries, this.props.tScale, this.yScale, this.props.cScale);
  }
  componentDidMount() {
    this._updateData();
    this._updateHovered();
    window.addEventListener("resize", this._redraw);
    this.props.tScale.onUpdate(this._onParamsUpdate);
    this.props.hoverPoint.onUpdate(this._updateHovered);
    this.queries.captions.onUpdate(this._onUpdateCaptions);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._redraw);
    this.props.tScale.offUpdate(this._onParamsUpdate);
    this.props.hoverPoint.offUpdate(this._updateHovered);
    this.queries.captions.offUpdate(this._onUpdateCaptions);
  }
  render() {
    // axes and scales
    var tAxis = new Plottable.Axes.Time(this.props.tScale, "bottom");
    tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
    var yAxis = new Plottable.Axes.Numeric(this.yScale, "left");
    yAxis.formatter(Plottable.Formatters.siSuffix());
    yAxis.usesTextWidthApproximation(true);

    // the chart
    this.guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(this.props.tScale);
    var panel = new Plottable.Components.Group([this.guideline, this.queries.component]);
    this.chart = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

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

    return <svg id={this.id} width="100%" height="300px" ref={(ref) => this.chart.renderTo(ref)} />
  }
}
Graph.propTypes = {
  tScale: React.PropTypes.object.isRequired,
  cScale: React.PropTypes.object.isRequired,
  options: React.PropTypes.object.isRequired,
  hoverPoint: React.PropTypes.object.isRequired,
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
              <FilterSelector
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
  onChange: React.PropTypes.func.isRequired,
}

class FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this._onSelect = this._onSelect.bind(this);
  }
  _onSelect(event) {
    this.props.onChange(event.target.value);
  }
  render() {
    var value = this.props.value;
    var options = this.props.options;
    if (!_(options).contains(value)) {
      options = [value].concat(options);
    }
    if (!_(options).contains("")) {
      options = [""].concat(options);
    }
    return (
      <select defaultValue={value} onChange={this._onSelect}>
        {options.map(function(option) {
          return <option key={option} value={option}>{option}</option>;
        }.bind(this))}
      </select>
    );
  }
}
FilterSelector.propTypes = {
  value: React.PropTypes.string.isRequired,
  options: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired,
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
