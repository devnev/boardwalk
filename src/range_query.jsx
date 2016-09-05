// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import $ from 'jquery';
import Plottable from 'plottable';
import { FormatMetric, FormatTemplate, MatchFilter } from './utils.jsx';

function _get(obj, key, def) {
  return _.has(obj, key) ? obj[key] : def;
}

class QueryStore {
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
var store = new QueryStore();

export default class QuerySet {
  constructor(queries, onData) {
    this.queries = queries.map(function(query, index) {
      return new RangeQuery(query, this._onQueryData.bind(this, index));
    }.bind(this));
    this.datasets = Array(this.queries.length);
    this.onData = onData.bind(undefined);
  }
  updateData(start, end, filter) {
    this.queries.forEach(function(query) {
      query.updateData(start, end, filter);
    }.bind(this));
  }
  _onQueryData(queryIndex, datasets) {
    this.datasets[queryIndex] = datasets;
    var datasets = _.flatten(this.datasets, true).filter(function(d) { return d; });
    this.onData(datasets);
  }
}

class RangeQuery {
  constructor(options, onData) {
    this.options = options;
    this.onData = onData.bind(undefined);
  }
  _updateDatasets(results) {
    var datasets = results.map(function(result) {
      var title = (
        this.options.title ?
        FormatTemplate(this.options.title, result.metric) :
        FormatMetric(result.metric)
      );
      var dataset = _.map(result.values, function(value) {
        return {
          t: new Date(value[0]*1000),
          y: parseFloat(value[1]),
        };
      }.bind(this));
      return new Plottable.Dataset(dataset, {title: title});
    }.bind(this));
    this.onData(datasets);
  }
  updateData(start, end, filter) {
    if (!MatchFilter(this.options.match, filter)) {
      this._updateDatasets([]);
      return;
    }

    var source = FormatTemplate(this.options.source, filter);
    var query = FormatTemplate(this.options.query, filter);
    var request = store.load(source, query, start, end);
    request.then(function(data) {
      this._updateDatasets(data);
    }.bind(this));
  }
}
