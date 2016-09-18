// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import Plottable from 'plottable';
import { FormatMetric, FormatTemplate, StrictMatchFilter } from './utils.jsx';

export class RangeQuerySet {
  constructor(queries, store, onData) {
    this.queries = queries.map(function(query, index) {
      return new RangeQuery(query, store, this._onQueryData.bind(this, index));
    }.bind(this));
    this.datasets = Array(this.queries.length);
    this.onData = onData.bind(undefined);
  }
  updateData(start, end, filter) {
    this.queries.forEach(function(query) {
      query.updateData(start, end, filter);
    }.bind(this));
  }
  _onQueryData(queryIndex, queryDatasets) {
    _.each(queryDatasets, function(dataset) {
      dataset.metadata().queryIndex = queryIndex;
    });
    this.datasets[queryIndex] = queryDatasets;
    var datasets = _.flatten(this.datasets, true).filter(function(d) { return d; });
    this.onData(datasets);
  }
}

export class RangeQuery {
  constructor(options, store, onData) {
    this.options = options;
    this.store = store;
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
      return new Plottable.Dataset(dataset, {title: title, metric: result.metric});
    }.bind(this));
    this.onData(datasets);
  }
  updateData(start, end, filter) {
    if (!StrictMatchFilter(this.options.match, filter)) {
      this._updateDatasets([]);
      return;
    }

    var source = FormatTemplate(this.options.source, filter);
    var query = FormatTemplate(this.options.query, filter);
    var request = this.store.load(source, query, start, end);
    request.then(function(data) {
      this._updateDatasets(data);
    }.bind(this));
  }
}
