// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';

export function FormatMetric(metric) {
  var title = "";
  Object.keys(metric).forEach(function(key) {
    if (title === '') {
      title = '{';
    }
    if (key === "__name__") {
      title = metric[key] + title;
      return;
    }
    if (!title.endsWith('{')) {
      title = title + ',';
    }
    title = title + key + "=" + JSON.stringify(metric[key]);
  });
  if (title.endsWith('{')) {
    title = title.substr(0, title.length-1);
  } else if (title !== '') {
    title = title + '}';
  }
  return title;
}

export function FormatTemplate(template, props) {
  var r = /([^$]|^)\$\{([^}]*)\}/;
  var pieces = template.split(r);
  var result = "";
  for (var i = 0; i < pieces.length; i++) {
    if (i % 3 != 2) {
      result += pieces[i];
      continue;
    }
    var key = pieces[i];
    if (key === "") {
      result += "$";
    } else if (props.hasOwnProperty(key)) {
      result += props[key];
    } else {
      // TODO: proper error handling
      console.log("unknown key in tempate: ", key);
    }
  }
  return result;
}

export function StrictMatchFilter(matcher, filter) {
  if (!matcher) {
    return false;
  }
  var matcherHasKeys = Object.keys(filter).every(function(key) {
    return matcher.hasOwnProperty(key);
  }.bind(this));
  if (!matcherHasKeys) {
    return false;
  }
  var matches = Object.keys(matcher).every(function(key) {
    var r = new RegExp(matcher[key]);
    var v = _(filter).has(key) ? filter[key] : "";
    return r.test(v);
  }.bind(this));
  return matches;
}

export function MatchFilter(matcher, filter) {
  if (!matcher) {
    return true;
  }
  var matches = Object.keys(matcher).every(function(key) {
    var r = new RegExp(matcher[key]);
    var v = _(filter).has(key) ? filter[key] : "";
    return r.test(v);
  }.bind(this));
  return matches;
}


export function SetSubState(component, values) {
  var same = true;
  var state = _.clone(component.state);
  for (var key in values) {
    if (!_.has(values, key)) {
      continue;
    }
    if (_.has(component.state, key)) {
      if (component.state[key] === values[key]) {
        continue;
      } else if (_.isEqual(component.state[key], values[key])) {
        continue;
      }
    }
    same = false;
    state[key] = values[key];
  }
  if (!same) {
    component.setState(state);
  }
}

export function TimeForPoint(tAxis, tScale, point) {
  var position = point.x / tAxis.width();
  var timeWidth = tScale.domainMax().getTime() - tScale.domainMin().getTime();
  return new Date(tScale.domainMin().getTime() + timeWidth * position);
}
