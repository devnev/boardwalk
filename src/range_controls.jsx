// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import moment from 'moment';

function ParseDuration(durationString) {
  if (!durationString) {
    return 0;
  }
  var [weeks, days, hours, minutes, seconds] = (durationString.match(/^(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) || []).slice(1);
  var res = parseInt(weeks || '0');
  res = res * 7 + parseInt(days || '0');
  res = res * 24 + parseInt(hours || '0');
  res = res * 60 + parseInt(minutes || '0');
  res = res * 60 + parseInt(seconds || '0');
  return res;
}

function FormatDuration(seconds) {
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

const StrSteps = ['10s', '30s', '1m', '5m', '15m', '30m', '1h', '3h', '6h', '12h', '1d', '3d', '1w', '2w', '4w', '12w', '53w'];
const Steps = StrSteps.map(ParseDuration);

export default class RangePicker extends React.Component {
  render() {
    return <div><DurationPicker /><TimePicker /></div>;
  }
}
RangePicker.propTypes = {};

class _DurationPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: FormatDuration(this.props.duration),
      dirty: false
    };
    this._onIncreaseDuration = this._onIncreaseDuration.bind(this);
    this._onDecreaseDuration = this._onDecreaseDuration.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
  }
  willReceiveProps(nextProps) {
    var nextDuration = FormatDuration(nextProps.duration);
    this.setState({ inputValue: nextDuration, dirty: false });
  }
  _onIncreaseDuration() {
    for (var i = 0; i < Steps.length; i++) {
      if (Steps[i] > this.props.duration) {
        this.props.pickDuration(Steps[i]);
        return;
      }
    }
    this.props.pickDuration(this.props.duration * 2);
  }
  _onDecreaseDuration() {
    for (var i = Steps.length; i > 0; i--) {
      if (Steps[i-1] < this.props.duration) {
        this.props.pickDuration(Steps[i-1]);
        return;
      }
    }
  }
  _onFormSubmit(event) {
    event.preventDefault();
    var duration = ParseDuration(this.state.inputValue);
    if (duration != 0) {
      this.props.pickDuration(duration);
    }
  }
  _onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true });
  }
  render() {
    return (
      <form action="" onSubmit={this._onFormSubmit}>
        <button type="button" onClick={this._onDecreaseDuration}>&#8722;</button>
        <input type="text" value={this.state.inputValue} onChange={this._onInputChange} className={(ParseDuration(this.state.inputValue) == 0 ? "error" : "valid") + (this.state.dirty ? " dirty" : "")} />
        <button type="button" onClick={this._onIncreaseDuration}>+</button>
      </form>
    );
  }
}
_DurationPicker.propTypes = {
  duration: React.PropTypes.number.isRequired,
  pickDuration: React.PropTypes.func.isRequired,
};
const DurationPicker = connect(
  (state) => ({
    duration: state.range.duration,
  }),
  (dispatch) => ({
    pickDuration: (duration) => dispatch({
      type: 'PICK_DURATION',
      duration: duration,
    }),
  })
)(_DurationPicker);

const timeFormat = "YYYY-MM-DD HH:mm:ssZZ";

class _TimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: moment(this.props.end).format(timeFormat),
      dirty: false,
    };
    this._onInputChange = this._onInputChange.bind(this);
    this._onStepBack = this._onStepBack.bind(this);
    this._onStepForward = this._onStepForward.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    var nextValue = moment(nextProps.end).format(timeFormat);
    if (nextValue != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextValue, dirty: false });
    }
  }
  _parsedInput() {
    return moment(this.state.inputValue, moment.ISO_8601, true);
  }
  _onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true});
  }
  _onStepBack() {
    this.props.pickEnd(new Date(this.props.end.getTime() - this.props.step*1000));
  }
  _onStepForward() {
    this.props.pickEnd(new Date(this.props.end.getTime() + this.props.step*1000));
  }
  _onFormSubmit(event) {
    event.preventDefault();
    var value = this._parsedInput();
    if (value.isValid()) {
      this.props.pickEnd(value.toDate());
    }
  }
  render() {
    return (
      <form action="" onSubmit={this._onFormSubmit}>
        <button type="button" onClick={this._onStepBack}>-{FormatDuration(this.props.step)}</button>
        <input type="text" value={this.state.inputValue} onChange={this._onInputChange} className={(this._parsedInput().isValid() ? "valid" : "error") + (this.state.dirty ? " dirty" : "")}/>
        <button type="button" onClick={this._onStepForward}>+{FormatDuration(this.props.step)}</button>
        <button type="button" onClick={this.props.pickNow}>now</button>
      </form>
    );
  }
}
_TimePicker.propTypes = {
  end: React.PropTypes.object.isRequired,
  step: React.PropTypes.number.isRequired,
  pickNow: React.PropTypes.func.isRequired,
  pickEnd: React.PropTypes.func.isRequired,
};
const TimePicker = connect(
  (state) => ({
    end: state.range.end,
    step: state.range.duration,
  }),
  (dispatch) => ({
    pickNow: () => dispatch({
      type: 'PICK_END',
      end: new Date(),
    }),
    pickEnd: (end) => dispatch({
      type: 'PICK_END',
      end: end,
    }),
  })
)(_TimePicker);
