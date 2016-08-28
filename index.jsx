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
        <Console key={path} items={console.contents} range={this.state.range} onChangeRange={this._updateRange} />
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
    this.focusPoint = new Plottable.Dataset();
    this.selected = false;
    if (props.range) {
      this._setRange(props.range);
    }
    this.tScale.onUpdate(function() {
      this.props.onChangeRange({
        end: this.tScale.domainMax(),
        duration: Math.floor((this.tScale.domainMax().getTime() - this.tScale.domainMin().getTime())/1000),
      });
    }.bind(this));
    this._setFocusTime = this._setFocusTime.bind(this);
    this._setSelectedTime = this._setSelectedTime.bind(this);
  }
  _setRange(range) {
    this.tScale.domain([new Date(range.end.getTime() - range.duration*1000), range.end]);
  }
  _setFocusTime(focusedTime) {
    if (!this.selected) {
      this.focusPoint.data([focusedTime]);
    }
  }
  _setSelectedTime(selectedTime) {
    this.selected = !this.selected;
    this.focusPoint.data([selectedTime]);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props.items, nextProps.items);
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
                onFocusTime={this._setFocusTime}
                onSelectTime={this._setSelectedTime}
                focusPoint={this.focusPoint} />
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
          onFocusTime={this.props.onFocusTime}
          onSelectTime={this.props.onSelectTime}
          onUpdateValues={this._setLegend}
          focusPoint={this.props.focusPoint} />
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
  focusPoint: React.PropTypes.object.isRequired,
  onFocusTime: React.PropTypes.func.isRequired,
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

class Plot {
  constructor(metric, tScale, yScale, cScale) {
    this.dataset = new Plottable.Dataset();
    this.nearest = new Plottable.Dataset();
    this.metric = metric;
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
    }.bind(this));
    if (title.endsWith('{')) {
      title = title.substr(0, title.length-1);
    } else if (title != '') {
      title = title + '}';
    }
    this.title = title;

    var plot = new Plottable.Plots.Line();
    plot.x(function(d) { return d.t; }, tScale);
    plot.y(function(d) { return d.y; }, yScale);
    plot.addDataset(this.dataset);
    plot.attr("stroke", cScale.scale(title));

    var nearestPoint = new Plottable.Plots.Scatter();
    nearestPoint.x(function(d) { return d.t; }, tScale);
    nearestPoint.y(function(d) { return d.y; }, yScale);
    nearestPoint.size(10);
    nearestPoint.addDataset(this.nearest);
    nearestPoint.attr("fill", cScale.scale(title));

    this.component = new Plottable.Components.Group([plot, nearestPoint]);
  }
  updateNearest(targetTime) {
    if (!targetTime) {
      this.nearest.data([]);
      return;
    }
    for (var i = this.dataset.data().length-1; i >= 0; i--) {
      var value = this.dataset.data()[i];
      if (value.t <= targetTime) {
        this.nearest.data([value]);
        return value.y;
      }
    }
    this.nearest.data([]);
  }
}

class Query {
  constructor(query, tScale, yScale, cScale) {
    this.tScale = tScale;
    this.yScale = yScale;
    this.cScale = cScale;
    this.query = query;
    this.plots = [];
    this.loading = {};
    this.component = new Plottable.Components.Group([]);
  }
  updateNearest(targetTime) {
    var values = [];
    this.plots.forEach(function(plot) {
      values.push([plot.title, plot.updateNearest(targetTime)]);
    }.bind(this));
    return values;
  }
  _addPlot(metric) {
    var plot = new Plot(metric, this.tScale, this.yScale, this.cScale);
    this.plots.push(plot);
    this.component.append(plot.component);
    return plot;
  }
  _updatePlots(results) {
    results.forEach(function(result) {
      var plot;
      var found = this.plots.some(function(existingPlot) {
        if (!_.isEqual(existingPlot.metric, result.metric)) {
          return false;
        }
        plot = existingPlot;
        return true;
      });
      if (!found) {
        plot = this._addPlot(result.metric);
      }
      plot.dataset.data(_.map(result.values, function(v) {
        return {t: new Date(v[0]*1000), y: parseFloat(v[1])};
      }));
    }.bind(this));
    this.plots.filter(function(plot) {
      var found = results.some(function(result) {
        return _.isEqual(result.metric, plot.metric);
      }.bind(this));
      if (!found) {
        this.component.remove(plot.plot);
      }
      return found;
    }.bind(this));
  }
  updateData(start, end) {
    if (this.loading && this.loading.req) {
      if (this.loading.start == start && this.loading.end == end) {
        return;
      }
      this.loading.req.abort();
    }
    var step = Math.floor((end - start) / 100).toString() + "s";
    this.loading = {
      req: $.get("http://localhost:9090/api/v1/query_range", {
        query: this.query, start: start, end: end, step: step}),
      start: start,
      end: end,
    }
    this.loading.req.done(function(data) {
      this.req = null;
      this._updatePlots(data.data.result);
    }.bind(this));
  }
}

class QuerySet {
  constructor(queries, tScale, yScale, cScale, focusPoint) {
    this.queries = queries.map(function(query) {
      return new Query(query, tScale, yScale, cScale, focusPoint);
    }.bind(this));
    this.component = new Plottable.Components.Group(
      this.queries.map(function(query) {
        return query.component;
      }.bind(this))
    );
  }
  updateData(start, end) {
    this.queries.forEach(function(query) {
      query.updateData(start, end);
    }.bind(this));
  }
  updateNearest(targetTime) {
    return this.queries.map(function(query) {
      return query.updateNearest(targetTime);
    }.bind(this));
  }
}

class Legend extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(function(item, index) {
          var title = item[0];
          var value = item[1];
          var colorStyle = {color: this.props.cScale.scale(title)};
          return (<li key={title+index}>
            <span style={colorStyle}>&#x25cf;</span>
            <span>{title}</span>
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

    // binds
    this._redraw = this._redraw.bind(this);
    this._onParamsUpdate = _.debounce(this._onParamsUpdate.bind(this), 500);
  }
  shouldComponentUpdate(props, state) {
    return (
      this.props.tScale != props.tScale ||
      this.props.cScale != props.cScale ||
      !_.isEqual(this.props.options, props.options)
    );
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
  _updateData() {
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    this.queries.updateData(start, end)
  }
  componentDidMount() {
    this._updateData();
    window.addEventListener("resize", this._redraw);
    this.props.tScale.onUpdate(this._onParamsUpdate);
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    window.removeEventListener("resize", this._redraw);
    this.props.tScale.offUpdate(this._onParamsUpdate);
  }
  render() {
    // axes and scales
    var tAxis = new Plottable.Axes.Time(this.props.tScale, "bottom");
    tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
    var yScale = new Plottable.Scales.Linear();
    yScale.domainMin(0);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    yAxis.formatter(Plottable.Formatters.siSuffix());

    // the chart
    this.queries = new QuerySet(
      this.props.options.queries, this.props.tScale, yScale, this.props.cScale, this.props.focusPoint);

    var guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(this.props.tScale);
    this.props.focusPoint.onUpdate(function(dataset) {
      var data = [undefined].concat(dataset.data());
      var targetTime = data.pop()
      guideline.value(targetTime);
      var nearestValues = this.queries.updateNearest(targetTime);
      this.props.onUpdateValues(_.flatten(nearestValues, true));
    }.bind(this));

    var panel = new Plottable.Components.Group([guideline, this.queries.component]);
    this.chart = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

    // interactions
    var panZoom = new Plottable.Interactions.PanZoom(this.props.tScale, null);
    panZoom.attachTo(panel);
    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(point) {
      this.props.onFocusTime(this._timeForPoint(tAxis, point));
    }.bind(this));
    pointer.onPointerExit(function() {
      this.props.onFocusTime(this.props.tScale.domainMax());
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
  focusPoint: React.PropTypes.object.isRequired,
  onFocusTime: React.PropTypes.func.isRequired,
  onSelectTime: React.PropTypes.func.isRequired,
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

class FilterControl extends React.Component {
  constructor(props) {
    super(props);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._addFilter = this._addFilter.bind(this);
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
  render() {
    return (
      <ul>
        {Object.keys(this.props.filter).map(function(name) {
          return (
            <li key={name}>
              <label htmlFor={"filter-" + name}>{name}</label>
              <input type="text" id={"filter-" + name} name={name} value={this.props.filter[name]} onChange={this._onFilterChange} />
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
