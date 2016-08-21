class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      console: "/",
      range: {
        end: new Date(),
        duration: 1*60*60
      }
    };
    this._updateRange = this._updateRange.bind(this);
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
    this.setState({
      config: this.state.config,
      console: this.state.console,
      range: range
    });
  }
  _navigate() {
    var path = window.location.hash.substr(1);
    var paramsStart = path.indexOf("?");
    if (paramsStart != -1) {
      path = path.substr(0, paramsStart);
    }
    this.setState({config: this.state.config, console: path, range: this.state.range});
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
  consoles: React.PropTypes.object,
};

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.tScale = new Plottable.Scales.Time();
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
    if (_.isEqual(this.props.items, nextProps.items)) {
      this._setRange(nextProps.range);
      return false;
    }
    return true;
  }
  render() {
    return (
      <div>
        {this.props.items.map(function(item, index) {
          if (item.graph) {
            return <Graph key={index} options={item.graph} tScale={this.tScale} onFocusTime={this._setFocusTime} onSelectTime={this._setSelectedTime} focusPoint={this.focusPoint} />;
          }
        }.bind(this))}
      </div>
    );
  }
}
Console.propTypes = {
  range: React.PropTypes.object,
  items: React.PropTypes.array,
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

class Query {
  constructor(query, tScale, yScale, focusPoint) {
    this.query = query;
    this.dataset = new Plottable.Dataset();
    this.nearest = new Plottable.Dataset();

    var plot = new Plottable.Plots.Line();
    plot.x(function(d) { return d.t; }, tScale);
    plot.y(function(d) { return d.y; }, yScale);
    plot.addDataset(this.dataset);

    var nearestPoint = new Plottable.Plots.Scatter();
    nearestPoint.x(function(d) { return d.t; }, tScale);
    nearestPoint.y(function(d) { return d.y; }, yScale);
    nearestPoint.size(10);
    nearestPoint.addDataset(this.nearest);

    this._onFocusPointChanged = this._onFocusPointChanged.bind(this);
    focusPoint.onUpdate(this._onFocusPointChanged);

    this.components = new Plottable.Components.Group([plot, nearestPoint]);
    this.loading = {};
  }
  _onFocusPointChanged(dataset) {
    var data = [undefined].concat(dataset.data());
    this._updateNearest(data.pop());
  }
  _updateNearest(targetDate) {
    if (!targetDate) {
      this.nearest.data([]);
      return;
    }
    for (var i = this.dataset.data().length-1; i >= 0; i--) {
      var value = this.dataset.data()[i];
      if (value.t <= targetDate) {
        this.nearest.data([value]);
        return;
      }
    }
    this.nearest.data([]);
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
      if (!data.data.result || !data.data.result.length) {
        this.dataset.data([]);
        return;
      }
      this.dataset.data(_.map(data.data.result[0].values, function(v) {
        return {t: new Date(v[0]*1000), y: parseFloat(v[1])};
      }));
    }.bind(this));
  }
}

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.id = _.uniqueId('graph_');

    // axes and scales
    var tScale = this.props.tScale;
    var tAxis = new Plottable.Axes.Time(tScale, "bottom");
    tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
    var yScale = new Plottable.Scales.Linear();
    yScale.domainMin(0);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    yAxis.formatter(Plottable.Formatters.siSuffix());

    // the chart
    this.queries = [];
    this.props.options.queries.forEach(function(query) {
      this.queries.push(new Query(query, tScale, yScale, this.props.focusPoint));
    }.bind(this));

    var guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(tScale);
    this.props.focusPoint.onUpdate(function(dataset) {
      var data = [undefined].concat(dataset.data());
      guideline.value(data.pop());
    }.bind(this));

    var panel = new Plottable.Components.Group([guideline].concat(
      this.queries.map(function(query) { return query.components; })
    ));
    this.chart = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

    // interactions
    var panZoom = new Plottable.Interactions.PanZoom(tScale, null);
    panZoom.attachTo(panel);
    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(point) {
      this.props.onFocusTime(this._timeForPoint(point));
    }.bind(this));
    pointer.onPointerExit(function() {
      this.props.onFocusTime(tScale.domainMax());
    }.bind(this));
    pointer.attachTo(panel);
    var click = new Plottable.Interactions.Click();
    click.onClick(function(point) {
      this.props.onSelectTime(this._timeForPoint(point));
    }.bind(this));
    click.attachTo(panel);

    // binds
    this._redraw = this._redraw.bind(this);
    this._onParamsUpdate = _.debounce(this._onParamsUpdate.bind(this), 500);
  }
  _timeForPoint(point) {
    var position = point.x / tAxis.width();
    var timeWidth = tScale.domainMax().getTime() - tScale.domainMin().getTime();
    return new Date(tScale.domainMin().getTime() + timeWidth * position);
  }
  _redraw() {
    this.chart.redraw();
  }
  _onParamsUpdate() {
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    var step = Math.floor((end - start) / 100).toString() + "s";
    if (this.loading && this.loading.req) {
      if (this.loading.start == start && this.loading.end == end && this.loading.step == step) {
        return;
      }
      this.loading.req.abort();
    }
    this._updateData();
  }
  _updateData() {
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    this.queries.forEach(function(query) {
      query.updateData(start, end);
    });
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
    return <svg id={this.id} width="100%" height="300px" ref={(ref) => this.chart.renderTo(ref)} />
  }
}
Graph.propTypes = {
  tScale: React.PropTypes.object,
  options: React.PropTypes.object,
  focusPoint: React.PropTypes.object,
  onFocusTime: React.PropTypes.func,
  onSelectTime: React.PropTypes.func,
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
  range: React.PropTypes.object,
  onChange: React.PropTypes.func,
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
  value: React.PropTypes.number,
  onChange: React.PropTypes.func,
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
  value: React.PropTypes.object,
  step: React.PropTypes.number,
  onChange: React.PropTypes.func,
}

ReactDOM.render(<App />, document.getElementById('content'));
