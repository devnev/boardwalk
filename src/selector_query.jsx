// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import $ from 'jquery';
import { FormatTemplate, MatchFilter } from './utils.jsx';

export default class SelectorQuerySet {
  constructor(queries, onData) {
    this.queries = queries.map(function(options, index) {
      return new SelectorQuery(options, this._onQueryData.bind(this, index));
    }.bind(this));
    this.labelsets = Array(this.queries.length);
    this.onData = onData.bind(undefined);
  }
  updateData(time, filter) {
    this.queries.forEach(function(query) {
      query.updateData(time, filter);
    });
  }
  _onQueryData(queryIndex, dataset) {
    this.labelsets[queryIndex] = dataset;
    var labels = _(this.labelsets).flatten(true);
    labels = _.filter(labels, _.identity);
    labels = _.sortBy(labels, _.identity);
    labels = _.uniq(labels, true);
    this.onData(labels);
  }
}

class SelectorQuery {
  constructor(options, onData) {
    this.options = options;
    this.onData = onData.bind(undefined);
    this.loading = {};
  }
  updateData(time, filter) {
    if (!MatchFilter(this.options.match, filter)) {
      this.onData([]);
      return;
    }
    var source = FormatTemplate(this.options.source, filter);
    var query = FormatTemplate(this.options.query, filter);
    if (this.loading.query == query && this.loading.time == time) {
      console.log("cached", query);
      return;
    }
    if (this.loading.req) {
      this.loading.req.abort();
    }
    console.log("loading", query);
    var req = $.get(source, {
      query: query,
      time: time,
    }).always(function() {
      this.loading.req = null;
    }.bind(this)).done(function(data) {
      this._handleResponse(data);
    }.bind(this));
    this.loading = {
      req: req,
      source: source,
      query: query,
      time: time,
    };
  }
  _handleResponse(response) {
    if (response.status != "success") {
      console.warn("selector query returned status", response.status);
      this.onData([]);
      return;
    }
    if (response.data.resultType != "vector") {
      console.warn("expected selector query to return a instant vector, got a", response.data.resultType);
      this.onData([]);
      return;
    }
    var values = response.data.result.map(function(result) {
      return result.metric[this.options.label];
    }.bind(this)).filter(_.identity);
    this.onData(values);
  }
}
