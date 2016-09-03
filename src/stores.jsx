// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import HashURIStore from './hash_uri.jsx';
import TimeScaleStore from './time_scale.jsx';
import FilterStore from './filter.jsx';

var hashURI = new HashURIStore();
var timeScale = new TimeScaleStore();
var filter = new FilterStore();
const filterPrefix = "filter.";

hashURI.onUpdate(function() {
  var duration = timeScale.range().duration;
  if (/^\d+$/.test(hashURI.first('duration'))) {
    duration = Number(hashURI.first('duration'));
  }
  var end = timeScale.range().end;
  if (/^\d+$/.test(hashURI.first('end'))) {
    end = new Date(Number(hashURI.first('end')*1000));
  }
  timeScale.range({duration: duration, end: end});
}, true);
hashURI.onUpdate(function() {
  var params = hashURI.params();
  var newFilter = {};
  _.each(params, function(values, key) {
    if (key.startsWith(filterPrefix)) {
      newFilter[key.substr(filterPrefix.length)] = values[0];
    } else {
    }
  });
  filter._reset(newFilter);
}, true)
timeScale.onUpdate(function() {
  var uri = hashURI.formatWith({
    duration: timeScale.range().duration,
    end: Math.round(timeScale.range().end.getTime()/1000),
  });
});
filter.onUpdate(function() {
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
});
window.addEventListener("hashchange", hashURI.parseHash);

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
}
