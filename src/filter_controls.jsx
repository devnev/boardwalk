// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import _ from 'underscore';
import QuerySet from './selector_query.jsx';

function _get(obj, key, def) {
  return _.has(obj, key) ? obj[key] : def;
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
  }),
  undefined,
  {pure: false}
)(_FilterSelectControl);
export { FilterSelectControl as default };

class _FilterSelector extends React.Component {
  constructor(props) {
    super(props);
    this.queries = null;
    this.state = {
      values: [],
    };
  }
  componentDidMount() {
    this._setupQueries(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.queries, nextProps.queries)) {
      this._setupQueries(nextProps);
    }
  }
  _setupQueries(props) {
    this.queries = new QuerySet(props.queries, function(values) {
      this.setState({values: values});
    }.bind(this));
    _.defer(() => this._updateData());
  }
  _updateData() {
    this.queries.updateData(this.props.time, this.props.filter);
  }
  render() {
    const select = (event) => this.props.onSelect(this.props.label, event.target.value);
    const value = _get(this.props.filter, this.props.label, "");

    var options = _.union(this.props.options, this.state.values);
    if (!_(options).contains(value)) {
      options = [value].concat(options);
    }
    if (!_(options).contains("")) {
      options = [""].concat(options);
    }

    return (
      <select value={value} onChange={select}>
        {options.map(function(option) {
          return <option key={option} value={option}>{option}</option>;
        }.bind(this))}
      </select>
    );
  }
}
_FilterSelector.propTypes = {
  queries: React.PropTypes.array.isRequired,
  label: React.PropTypes.string.isRequired,
  options: React.PropTypes.array.isRequired,
  filter: React.PropTypes.object.isRequired,
  time: React.PropTypes.number.isRequired,
};
const FilterSelector = connect(
  (state) => ({
    time: Math.floor(state.range.end.getTime()/1000),
    filter: state.filter,
  }),
  (dispatch) => ({
    onSelect: (label, value) => dispatch({
      type: 'SET_FILTERS',
      filters: {[label]: value},
    }),
  }),
  undefined,
  {pure: false}
)(_FilterSelector);
