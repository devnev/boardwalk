// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import $ from 'jquery';
import React from 'react';

function _get(obj, key, def) {
  return _.has(obj, key) ? obj[key] : def;
}

export class QueryStore {
  constructor() {
    this._store = {};
  }
  load(source, query, start, end) {
    var key = source + '?query=' + query;
    var entry = _get(this._store, key);
    if (entry) {
      if (entry.source == source &&
          entry.query == query &&
          entry.start == start &&
          entry.end == end) {
        console.log("cached", query);
        return entry.promise;
      }
      if (entry.request) {
        entry.request.abort();
        entry.request = null;
      }
    }

    console.log("loading", query);
    var step = Math.floor((end - start) / 200).toString() + "s";
    var request = $.get(source, {
      query: query,
      start: start,
      end: end,
      step: step,
    });
    entry = this._store[key] = {
      request: request,
      query: query,
      source: source,
      start: start,
      end: end,
      promise: null,
    };
    entry.promise = request
      .then(function(data) {
        if (entry.request === request) {
          entry.data = data.data.result;
        }
        return data.data.result;
      })
      .always(function() {
        if (entry.request === request) {
          entry.request = null;
        }
      });
    return entry.promise;
  }
}

export class Provider extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.store = new QueryStore();
  }
  getChildContext() {
    return {
      queryStore: this.store,
    };
  }
  render() {
    return React.Children.only(this.props.children);
  }
}
Provider.childContextTypes = {
  queryStore: React.PropTypes.object.isRequired,
};
