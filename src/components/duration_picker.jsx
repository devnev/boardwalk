// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import { connect } from 'react-redux';
import { ParseDuration, FormatDuration } from '../utils.js';

const StrSteps = ['10s', '30s', '1m', '5m', '15m', '30m', '1h', '3h', '6h', '12h', '1d', '3d', '1w', '2w', '4w', '12w', '53w'];
const Steps = StrSteps.map(ParseDuration);

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
  componentWillReceiveProps(nextProps) {
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
export const DurationPicker = connect(
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

