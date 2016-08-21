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
    this.updateRange = this.updateRange.bind(this);
    this.navigate = this.navigate.bind(this);
  }
  componentDidMount() {
    this.req = $.get("/config.json");
    this.req.done(function(data) { this.setState({config: data}); }.bind(this));
    window.addEventListener("hashchange", this.navigate);
    this.navigate();
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    window.removeEventListener("hashchange", this.navigate);
  }
  updateRange(range) {
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
  navigate() {
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
        <RangePicker range={this.state.range} onChange={this.updateRange} />
        <Console key={path} items={console.contents} range={this.state.range} onChangeRange={this.updateRange} />
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
    if (props.range) {
      this.setRange(props.range);
    }
    this.tScale.onUpdate(function() {
      this.props.onChangeRange({
        end: this.tScale.domainMax(),
        duration: Math.floor((this.tScale.domainMax().getTime() - this.tScale.domainMin().getTime())/1000),
      });
    }.bind(this));
  }
  setRange(range) {
    this.tScale.domain([new Date(range.end.getTime() - range.duration*1000), range.end]);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(this.props.items, nextProps.items)) {
      this.setRange(nextProps.range);
      return false;
    }
    return true;
  }
  render() {
    var items = this.props.items;
    var tScale = this.tScale;
    var focusPoint = this.focusPoint;
    return (
      <div>
        {items.map(function(item, index) {
          if (item.graph) {
            return <Graph key={index} options={item.graph} tScale={tScale} focusPoint={focusPoint} />;
          }
        })}
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
    this.updateNearest(data.pop());
  }
  updateNearest(targetDate) {
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
      var position = point.x / tAxis.width();
      var timeWidth = tScale.domainMax().getTime() - tScale.domainMin().getTime();
      this.props.focusPoint.data([new Date(tScale.domainMin().getTime() + timeWidth * position)]);
    }.bind(this));
    pointer.attachTo(panel);

    // binds
    this.redraw = this.redraw.bind(this);
    this.onParamsUpdate = _.debounce(this.onParamsUpdate.bind(this), 500);
  }
  redraw() {
    this.chart.redraw();
  }
  onParamsUpdate() {
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    var step = Math.floor((end - start) / 100).toString() + "s";
    if (this.loading && this.loading.req) {
      if (this.loading.start == start && this.loading.end == end && this.loading.step == step) {
        return;
      }
      this.loading.req.abort();
    }
    this.updateData();
  }
  updateData() {
    var start = Math.floor(this.props.tScale.domainMin().getTime()/1000);
    var end = Math.floor(this.props.tScale.domainMax().getTime()/1000);
    this.queries.forEach(function(query) {
      query.updateData(start, end);
    });
  }
  componentDidMount() {
    this.updateData();
    window.addEventListener("resize", this.redraw);
    this.props.tScale.onUpdate(this.onParamsUpdate);
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    window.removeEventListener("resize", this.redraw);
    this.props.tScale.offUpdate(this.onParamsUpdate);
  }
  render() {
    return <svg id={this.id} width="100%" height="300px" ref={(ref) => this.chart.renderTo(ref)} />
  }
}
Graph.propTypes = {
  tScale: React.PropTypes.object,
  options: React.PropTypes.object,
  focusPoint: React.PropTypes.object,
};

class RangePicker extends React.Component {
  constructor(props) {
    super(props);
    this.updateDuration = this.updateDuration.bind(this);
    this.updateEnd = this.updateEnd.bind(this);
  }
  updateDuration(duration) {
    this.props.onChange({end: this.props.range.end, duration: duration});
  }
  updateEnd(end) {
    this.props.onChange({end: end, duration: this.props.range.duration});
  }
  render() {
    return <div><DurationPicker value={this.props.range.duration} onChange={this.updateDuration} /><TimePicker value={this.props.range.end} step={this.props.range.duration} onChange={this.updateEnd} /></div>
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
    this.onIncreaseDuration = this.onIncreaseDuration.bind(this);
    this.onDecreaseDuration = this.onDecreaseDuration.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    var nextDuration = DurationPicker.formatDuration(nextProps.value)
    if (nextDuration != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextDuration, dirty: false });
    }
  }
  onIncreaseDuration() {
    for (var i = 0; i < this.steps.length; i++) {
      if (this.steps[i] > this.props.value) {
        this.props.onChange(this.steps[i]);
        return;
      }
    }
    this.props.onChange(this.props.value * 2);
  }
  onDecreaseDuration() {
    for (var i = this.steps.length; i > 0; i--) {
      if (this.steps[i-1] < this.props.value) {
        this.props.onChange(this.steps[i-1]);
        return;
      }
    }
  }
  onFormSubmit(event) {
    event.preventDefault();
    var duration = DurationPicker.parseDuration(this.state.inputValue);
    if (duration != 0) {
      this.props.onChange(duration)
    }
  }
  onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true });
  }
  render() {
    return (
      <form action="" onSubmit={this.onFormSubmit}>
        <button type="button" onClick={this.onDecreaseDuration}>&#8722;</button>
        <input type="text" value={this.state.inputValue} onChange={this.onInputChange} className={(DurationPicker.parseDuration(this.state.inputValue) == 0 ? "error" : "valid") + (this.state.dirty ? " dirty" : "")} />
        <button type="button" onClick={this.onIncreaseDuration}>+</button>
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
    this.onInputChange = this.onInputChange.bind(this);
    this.onPickNow = this.onPickNow.bind(this);
    this.onStepBack = this.onStepBack.bind(this);
    this.onStepForward = this.onStepForward.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }
  parsedInput() {
    return moment(this.state.inputValue, moment.ISO_8601, true);
  }
  componentWillReceiveProps(nextProps) {
    var nextValue = moment(nextProps.value).format("YYYY-MM-DD HH:mm:ssZZ")
    if (nextValue != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextValue, dirty: false });
    }
  }
  onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true});
  }
  onPickNow() {
    this.props.onChange(new Date());
  }
  onStepBack() {
    this.props.onChange(new Date(this.props.value.getTime() - this.props.step*1000));
  }
  onStepForward() {
    this.props.onChange(new Date(this.props.value.getTime() + this.props.step*1000));
  }
  onFormSubmit(event) {
    event.preventDefault();
    var value = this.parsedInput();
    if (value.isValid()) {
      this.props.onChange(value.toDate());
    }
  }
  render() {
    return (
      <form action="" onSubmit={this.onFormSubmit}>
        <button type="button" onClick={this.onStepBack}>-{DurationPicker.formatDuration(this.props.step)}</button>
        <input type="text" value={this.state.inputValue} onChange={this.onInputChange} className={(this.parsedInput().isValid() ? "valid" : "error") + (this.state.dirty ? " dirty" : "")}/>
        <button type="button" onClick={this.onStepForward}>+{DurationPicker.formatDuration(this.props.step)}</button>
        <button type="button" onClick={this.onPickNow}>now</button>
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
