// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import Plottable from 'plottable';
import HashURIStore from './hash_uri.jsx';
import TimeScaleStore from './time_scale.jsx';
import FilterStore from './filter.jsx';

var hashURI = new HashURIStore();
var timeScale = new TimeScaleStore();
var filter = new FilterStore();
const filterPrefix = "filter.";

class Dispatcher {
  constructor() {
    _.bindAll(this, '_updateFilterFromURI', '_updateFilterFromURI', '_updateURIFromTimeScale', '_updateURIFromFilter');
  }
  enable() {
    hashURI.onUpdate(this._updateTimeScaleFromURI, true);
    hashURI.onUpdate(this._updateFilterFromURI, true);
    timeScale.onUpdate(this._updateURIFromTimeScale);
    filter.onUpdate(this._updateURIFromFilter);
    window.addEventListener("hashchange", hashURI.parseHash);
  }
  _updateTimeScaleFromURI() {
    var duration = timeScale.range().duration;
    if (/^\d+$/.test(hashURI.first('duration'))) {
      duration = Number(hashURI.first('duration'));
    }
    var end = timeScale.range().end;
    if (/^\d+$/.test(hashURI.first('end'))) {
      end = new Date(Number(hashURI.first('end')*1000));
    }
    timeScale.range({duration: duration, end: end});
  }
  _updateFilterFromURI() {
    var params = hashURI.params();
    var newFilter = {};
    _.each(params, function(values, key) {
      if (key.startsWith(filterPrefix)) {
        newFilter[key.substr(filterPrefix.length)] = values[0];
      }
    });
    filter._reset(newFilter);
  }
  _updateURIFromTimeScale() {
    var uri = hashURI.formatWith({
      duration: timeScale.range().duration,
      end: Math.round(timeScale.range().end.getTime()/1000),
    });
    window.location.hash = '#' + uri;
  }
  _updateURIFromFilter() {
    var params = {};
    _.each(filter.filter(), function(value, key) {
      params[filterPrefix+key] = value;
    });
    var oldParams = hashURI.params();
    _.each(oldParams, function(values, key) {
      if (key.startsWith(filterPrefix) && !_.has(params, key)) {
        params[key] = null;
      }
    });
    var uri = hashURI.formatWith(params);
    window.location.hash = "#" + uri;
  }
}
var dispatcher = new Dispatcher();

export var ExpandedMetric = {
  console: null,
  graphIndex: null,
  queryIndex: null,
  metricLabels: null,
  _callbacks: new Plottable.Utils.CallbackSet(),
  onUpdate: function onUpdate(callback) {
    this._callbacks.add(callback);
  },
  offUpdate: function offUpdate(callback) {
    this._callbacks.delete(callback);
  },
};
export function ExpandMetric(console, graphIndex, queryIndex, metricLabels) {
  _.assign(ExpandedMetric, {
    console: console,
    graphIndex: graphIndex,
    queryIndex: queryIndex,
    metricLabels: metricLabels,
  });
  ExpandedMetric._callbacks.callCallbacks(ExpandedMetric);
}
export function CollapseExpansion() {
  _.assign(ExpandedMetric, {
    console: null,
    graphIndex: null,
    queryIndex: null,
    metricLabels: null,
  });
  ExpandedMetric._callbacks.callCallbacks(ExpandedMetric);
}

export var ColorScale = new Plottable.Scales.Color();
export { dispatcher as Dispatcher };
export { hashURI as HashURI };
export { timeScale as TimeScale };
export { filter as Filter };
export function PickDuration(duration) {
  var uri = hashURI.formatWith({duration: duration});
  window.location.hash = '#' + uri;
}
export function PickEnd(end) {
  var uri = hashURI.formatWith({end: Math.floor(end.getTime()/1000)});
  window.location.hash = '#' + uri;
}
export function SetFilter(name, value) {
  var newParams = {};
  newParams[filterPrefix+name] = (value ? value : null);
  var uri = hashURI.formatWith(newParams);
  window.location.hash = '#' + uri;
  CollapseExpansion();
}
