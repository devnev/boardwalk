// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import _ from 'underscore';
import $ from 'jquery';
import QuerySet from './selectorquery.jsx';

export default class FilterSelectControl extends React.Component {
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
    this.queries = new QuerySet(props.queries, function(labels) {
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
