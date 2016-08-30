import React from 'react';
import _ from 'underscore';
import $ from 'jquery';
import moment from 'moment';
import { FormatTemplate, MatchFilter } from './utils.jsx';

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

export { RangePicker, FilterSelectControl, FilterControl };
