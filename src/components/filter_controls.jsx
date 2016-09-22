// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import _ from 'underscore';
import { QuerySet } from './query_set.jsx';

function _get(obj, key, def) {
  return _.has(obj, key) ? obj[key] : def;
}

function labelsFromResults(results) {
  var labels = _.map(results, (result) => (result.metric[result.queryOptions.label]));
  labels = _.filter(labels, _.identity);
  labels = _.sortBy(labels, _.identity);
  labels = _.uniq(labels, true);
  return labels;
}

class _FilterSelectControl extends React.Component {
  render() {
    var selectorLabels = this.props.selectors.map(function(s) { return s.label; });
    var unknown = _.difference(_.keys(this.props.filter), selectorLabels);
    return (
      <ul>
        {this.props.selectors.map(function(selector) {
          return (
            <li key={selector.label}>
              <span>{selector.label}</span>
              <FilterSelector
                queries={selector.queries || []}
                label={selector.label}
                options={selector.options} />
            </li>
          );
        }.bind(this))}
        {unknown.map(function(label) {
          const clear = this.props.onRemoveFilter.bind(null, label);
          return (
            <li key={label}>
              <span>{label}</span>
              <span>{this.props.filter[label]}</span>
              <button type="button" onClick={clear}>X</button>
            </li>
          );
        }.bind(this))}
      </ul>
    );
  }
}
_FilterSelectControl.propTypes = {
  selectors: React.PropTypes.array.isRequired,
  filter: React.PropTypes.object.isRequired,
  onRemoveFilter: React.PropTypes.func.isRequired,
};
export const FilterSelectControl = connect(
  (state) => ({
    selectors: state.config.consoles[state.console].selectors,
    filter: state.filter,
  }),
  (dispatch) => ({
    onRemoveFilter: (name) => dispatch({
      type: 'SET_FILTERS',
      filters: {[name]: null},
    }),
  })
)(_FilterSelectControl);

class _FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: [],
    };
    this._onData = this._onData.bind(this);
  }
  _onData(results) {
    const labels = labelsFromResults(results);
    this.setState({
      ...this.state,
      labels,
    });
  }
  render() {
    const select = (value) => this.props.onSelect(this.props.label, value);
    const value = _get(this.props.filter, this.props.label, "");
    const options = _.union(this.props.options, this.state.labels);
    return (
      <div>
        <QuerySet queries={this.props.queries} strictMatch={false} onQueryData={this._onData} />
        <Selector value={value} options={options} onSelect={select} />
      </div>
    );
  }
}
_FilterSelector.propTypes = {
  queries: React.PropTypes.array.isRequired,
  label: React.PropTypes.string.isRequired,
  options: React.PropTypes.array.isRequired,
  filter: React.PropTypes.object.isRequired,
  onSelect: React.PropTypes.func.isRequired,
};
const FilterSelector = connect(
  (state) => ({
    filter: state.filter,
  }),
  (dispatch) => ({
    onSelect: (label, value) => dispatch({
      type: 'SET_FILTERS',
      filters: {[label]: value},
    }),
  }),
  null,
  {pure: false}
)(_FilterSelector);

class Selector extends React.Component {
  render() {
    const select = (event) => this.props.onSelect(event.target.value);

    var options = this.props.options;
    if (!_(options).contains(this.props.value)) {
      options = [this.props.value].concat(options);
    }
    if (!_(options).contains("")) {
      options = [""].concat(options);
    }

    return (
      <select value={this.props.value} onChange={select}>
        {options.map(function(option) {
          return <option key={option} value={option}>{option}</option>;
        }.bind(this))}
      </select>
    );
  }
}
Selector.propTypes = {
  options: React.PropTypes.array.isRequired,
  value: React.PropTypes.string.isRequired,
  onSelect: React.PropTypes.func.isRequired,
};
