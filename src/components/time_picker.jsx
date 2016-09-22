// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { FormatDuration } from '../utils.js';

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
export const TimePicker = connect(
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
