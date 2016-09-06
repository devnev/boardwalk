// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import moment from 'moment';
import { PickDuration, PickEnd, TimeScale } from './dispatch.jsx';

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

export default class RangePicker extends React.Component {
  render() {
    return <div><DurationPicker /><TimePicker /></div>;
  }
}
RangePicker.propTypes = {};

class DurationPicker extends React.Component {
  constructor(props) {
    super(props);
    var m = 60;
    var h = m*60;
    var d = h*24;
    var w = 7*d;
    this.steps = [10, 30, m, 5*m, 15*m, 30*m, h, 3*h, 6*h, 12*h, d, 3*d, w, 2*w, 4*w, 12*w, 53*w];
    this.state = {
      inputValue: FormatDuration(TimeScale.range().duration),
      dirty: false
    };
    this._onIncreaseDuration = this._onIncreaseDuration.bind(this);
    this._onDecreaseDuration = this._onDecreaseDuration.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._updateState = this._updateState.bind(this);
  }
  componentWillMount() {
    TimeScale.onUpdate(this._updateState);
  }
  componentWillUnmount() {
    TimeScale.offUpdate(this._updateState);
  }
  _updateState() {
    var nextDuration = FormatDuration(TimeScale.range().duration);
    if (nextDuration != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextDuration, dirty: false });
    }
  }
  _onIncreaseDuration() {
    for (var i = 0; i < this.steps.length; i++) {
      if (this.steps[i] > TimeScale.range().duration) {
        PickDuration(this.steps[i]);
        return;
      }
    }
    PickDuration(TimeScale.range().duration * 2);
  }
  _onDecreaseDuration() {
    for (var i = this.steps.length; i > 0; i--) {
      if (this.steps[i-1] < TimeScale.range().duration) {
        PickDuration(this.steps[i-1]);
        return;
      }
    }
  }
  _onFormSubmit(event) {
    event.preventDefault();
    var duration = ParseDuration(this.state.inputValue);
    if (duration != 0) {
      PickDuration(duration);
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
DurationPicker.propTypes = {};

class TimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: moment(TimeScale.range().end).format("YYYY-MM-DD HH:mm:ssZZ"),
      dirty: false,
    };
    this._onInputChange = this._onInputChange.bind(this);
    this._onPickNow = this._onPickNow.bind(this);
    this._onStepBack = this._onStepBack.bind(this);
    this._onStepForward = this._onStepForward.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
    this._updateState = this._updateState.bind(this);
  }
  componentWillMount() {
    TimeScale.onUpdate(this._updateState);
  }
  componentWillUnmount() {
    TimeScale.offUpdate(this._updateState);
  }
  _parsedInput() {
    return moment(this.state.inputValue, moment.ISO_8601, true);
  }
  _updateState() {
    var nextValue = moment(TimeScale.range().end).format("YYYY-MM-DD HH:mm:ssZZ");
    if (nextValue != this.state.inputValue || this.state.dirty) {
      this.setState({ inputValue: nextValue, dirty: false });
    } else {
      this.setState(this.state);
    }
  }
  _onInputChange(event) {
    this.setState({inputValue: event.target.value, dirty: true});
  }
  _onPickNow() {
    PickEnd(new Date());
  }
  _onStepBack() {
    PickEnd(new Date(TimeScale.range().end.getTime() - TimeScale.range().duration*1000));
  }
  _onStepForward() {
    PickEnd(new Date(TimeScale.range().end.getTime() + TimeScale.range().duration*1000));
  }
  _onFormSubmit(event) {
    event.preventDefault();
    var value = this._parsedInput();
    if (value.isValid()) {
      PickEnd(value.toDate());
    }
  }
  render() {
    return (
      <form action="" onSubmit={this._onFormSubmit}>
        <button type="button" onClick={this._onStepBack}>-{FormatDuration(TimeScale.range().duration)}</button>
        <input type="text" value={this.state.inputValue} onChange={this._onInputChange} className={(this._parsedInput().isValid() ? "valid" : "error") + (this.state.dirty ? " dirty" : "")}/>
        <button type="button" onClick={this._onStepForward}>+{FormatDuration(TimeScale.range().duration)}</button>
        <button type="button" onClick={this._onPickNow}>now</button>
      </form>
    );
  }
}
TimePicker.propTypes = {};
