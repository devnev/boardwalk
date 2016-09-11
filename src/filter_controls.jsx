// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import _ from 'underscore';
import QuerySet from './selector_query.jsx';
import { Filter, SetFilter } from './dispatch.jsx';
import { SetSubState } from './utils.jsx';

export default class FilterSelectControl extends React.Component {
  constructor(props) {
    super(props);
    this._update = this._update.bind(this);
  }
  componentWillMount() {
    Filter.onUpdate(this._update);
  }
  componentWillUnmount() {
    Filter.offUpdate(this._update);
  }
  _update() {
    this.setState(this.state);
  }
  render() {
    var selectorLabels = this.props.selectors.map(function(s) { return s.label; });
    var unknown = _.difference(_.keys(Filter.filter()), selectorLabels);
    return (
      <ul>
        {this.props.selectors.map(function(selector) {
          return (
            <li key={selector.label}>
              <span>{selector.label}</span>
              <FilterSelector
                queries={selector.queries || []}
                time={this.props.time}
                label={selector.label}
                options={selector.options} />
            </li>
          );
        }.bind(this))}
        {unknown.map(function(label) {
          return (
            <li key={label}>
              <span>{label}</span>
              <button type="button" onClick={SetFilter.bind(undefined, label, "")}>X</button>
            </li>
          );
        }.bind(this))}
      </ul>
    );
  }
}
FilterSelectControl.propTypes = {
  selectors: React.PropTypes.array.isRequired,
  time: React.PropTypes.number.isRequired,
};

class FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this.queries = null;
    this.state = {
      value: Filter.value(props.label),
      values: [],
    };
    this._onSelect = this._onSelect.bind(this);
    this._updateData = this._updateData.bind(this);
    this._updateValue = this._updateValue.bind(this);
  }
  componentWillMount() {
    this._setupQueries(this.props);
    Filter.onUpdate(this._updateValue);
  }
  componentWillUnmount() {
    Filter.offUpdate(this._updateValue);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.queries, nextProps.queries)) {
      this._setupQueries(nextProps);
    }
  }
  _setupQueries(props) {
    this.queries = new QuerySet(props.queries, function(values) {
      SetSubState(this, {values: values});
    }.bind(this));
  }
  _updateValue() {
    SetSubState(this, {value: Filter.value(this.props.label)});
  }
  _updateData() {
    this.queries.updateData(this.props.time, Filter.filter());
  }
  _onSelect(event) {
    SetFilter(this.props.label, event.target.value);
  }
  render() {
    this._updateData();
    var options = _.union(this.props.options, this.state.values);
    if (!_(options).contains(this.state.value)) {
      options = [this.state.value].concat(options);
    }
    if (!_(options).contains("")) {
      options = [""].concat(options);
    }
    return (
      <select value={this.state.value} onChange={this._onSelect}>
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
  label: React.PropTypes.string.isRequired,
  options: React.PropTypes.array.isRequired,
};
