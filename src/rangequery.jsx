import _ from 'underscore';
import $ from 'jquery';
import Plottable from 'plottable';
import { FormatMetric, FormatTemplate, MatchFilter } from './utils.jsx';

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
    this.loading = {};
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
    var query = FormatTemplate(this.options.query, filter);
    var step = Math.floor((end - start) / 200).toString() + "s";
    if (this.loading) {
      if (this.loading.query == query && this.loading.start == start && this.loading.end == end) {
        console.log("cached", query);
        return;
      }
      if (this.loading.req) {
        this.loading.req.abort();
      }
    }
    console.log("loading", query);
    var req = $.get("http://localhost:9090/api/v1/query_range", {
      query: query,
      start: start,
      end: end,
      step: step,
    }).always(function() {
      this.loading.req = null;
    }.bind(this)).done(function(data) {
      this._updateDatasets(data.data.result);
    }.bind(this));
    this.loading = {
      req: req,
      query: query,
      start: start,
      end: end,
    }
  }
}
