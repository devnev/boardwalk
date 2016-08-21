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
  }
  componentDidMount() {
    this.req = $.get("/config.json");
    this.req.done(function(data) { this.setState({config: data}); }.bind(this));
  }
  componentWillUnmount() {
    this.req.abort();
  }
  updateRange(range) {
    this.setState({
      config: this.state.config,
      console: this.state.console,
      range: range
    });
  }
  render() {
    if (this.state.config) {
      return (
        <div>
          <RangePicker range={this.state.range} onChange={this.updateRange} />
          <Console items={this.state.config.items} range={this.state.range} />
        </div>
      );
    }
    return <p>Loading config...</p>
  }
}

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.tScale = new Plottable.Scales.Time();
    this.focusPoint = new Plottable.Dataset();
    if (props.range) {
      this.setRange(props.range);
    }
  }
  setRange(range) {
    this.tScale.domainMax(range.end);
    this.tScale.domainMin(new Date(range.end.getTime() - range.duration*1000));
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (_.isEqual(this.props.items, nextProps.items)) {
      this.setRange(nextProps.range);
      return false;
    }
  }
  render() {
    this.setRange(this.props.range);
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

class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.id = _.uniqueId('graph_');
    this.dataset = new Plottable.Dataset();

    var tScale = this.props.tScale;
    var tAxis = new Plottable.Axes.Time(tScale, "bottom");
    var yScale = new Plottable.Scales.Linear();
    yScale.domainMin(0);
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");

    var plot = new Plottable.Plots.Line();
    plot.x(function(d) { return d.t; }, tScale);
    plot.y(function(d) { return d.y; }, yScale);
    plot.addDataset(this.dataset);

    var guideline = new Plottable.Components.GuideLineLayer(
        Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(tScale);
    var nearestPointData = new Plottable.Dataset();
    var nearestPoint = new Plottable.Plots.Scatter();
    nearestPoint.x(function(d) { return d.t; }, tScale);
    nearestPoint.y(function(d) { return d.y; }, yScale);
    nearestPoint.size(10);
    nearestPoint.addDataset(nearestPointData);

    var pointer = new Plottable.Interactions.Pointer();
    pointer.onPointerMove(function(point) {
      var position = point.x / tAxis.width();
      var timeWidth = tScale.domainMax().getTime() - tScale.domainMin().getTime();
      this.props.focusPoint.data([tScale.domainMin().getTime() + timeWidth * position]);
    }.bind(this));
    pointer.attachTo(plot);
    this.props.focusPoint.onUpdate(function(dataset) {
      var data = dataset.data();
      if (!data || !data.length) {
        return;
      }
      var date = new Date(data[0])
      guideline.value(date);
      for (var i = this.dataset.data().length-1; i >= 0; i--) {
        var value = this.dataset.data()[i];
        if (value.t <= date) {
          nearestPointData.data([value]);
          return;
        }
      }
      nearestPointData.data([]);
    }.bind(this));

    var panZoom = new Plottable.Interactions.PanZoom(tScale, null);
    panZoom.attachTo(plot);

    var panel = new Plottable.Components.Group([plot, guideline, nearestPoint]);
    this.chart = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);
    this.redraw = this.redraw.bind(this);
    this.onParamsUpdate = this.onParamsUpdate.bind(this);
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
    var step = Math.floor((end - start) / 100).toString() + "s";
    this.loading = {
      req: $.get("http://localhost:9090/api/v1/query_range", {
        "query": this.props.options.query, "start": start, "end": end, "step": step}),
      start: start,
      end: end,
      step: step
    }
    this.loading.req.done(function(data) {
      this.req = null;
      this.dataset.data(_.map(data.data.result[0].values, function(v) {
        return {t: new Date(v[0]*1000), y: parseFloat(v[1])};
      }));
    }.bind(this));
  }
  componentDidMount() {
    this.updateData();
    window.addEventListener("resize", this.redraw);
    this.props.tScale.onUpdate(this.onParamsUpdate);
  }
  componentWillUnmount() {
    this.req.abort();
    window.removeEventListener("resize", this.redraw);
    this.props.tScale.offUpdate(this.onParamsUpdate);
  }
  render() {
    return <svg id={this.id} width="100%" height="300px" ref={(ref) => this.chart.renderTo(ref)} />
  }
}

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
    return <div><DurationPicker value={this.props.range.duration} onChange={this.updateDuration} /><TimePicker value={this.props.range.end} onChange={this.updateEnd} /></div>
  }
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

class TimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: moment(this.props.value).format("YYYY-MM-DD HH:mm:ssZZ"),
      dirty: false,
    }
    this.onInputChange = this.onInputChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onPickNow = this.onPickNow.bind(this);
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
  onFormSubmit(event) {
    event.preventDefault();
    var value = moment(this.state.inputValue);
    if (value.isValid()) {
      this.props.onChange(value.toDate());
    }
  }
  render() {
    return (
      <form action="" onSubmit={this.onFormSubmit}>
        <input type="text" value={this.state.inputValue} onChange={this.onInputChange} className={(moment(this.state.inputValue).isValid() ? "valid" : "error") + (this.state.dirty ? " dirty" : "")}/>
        <button type="button" onClick={this.onPickNow}>now</button>
      </form>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('content'));
