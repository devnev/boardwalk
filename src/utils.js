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
      console.log("unknown key", key, "in temlpate", template);
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

export function TimeForPoint(tAxis, tScale, point) {
  var position = point.x / tAxis.width();
  var timeWidth = tScale.domainMax().getTime() - tScale.domainMin().getTime();
  return new Date(tScale.domainMin().getTime() + timeWidth * position);
}

export function ParseDuration(durationString) {
  if (!durationString) {
    return 0;
  }
  var [weeks, days, hours, minutes, seconds] = (durationString.match(/^(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) || []).slice(1);
  var res = parseInt(weeks || '0');
  res = res * 7 + parseInt(days || '0');
  res = res * 24 + parseInt(hours || '0');
  res = res * 60 + parseInt(minutes || '0');
  res = res * 60 + parseInt(seconds || '0');
  return res;
}

export function FormatDuration(seconds) {
  var week = 7*24*60*60;
  var day = 24*60*60;
  var hour = 60*60;
  var minute = 60;
  var res = "";
  if (seconds >= week) {
    var weeks = Math.floor(seconds / week);
    res = res + weeks.toString() + "w";
    seconds = seconds - weeks * week;
  }
  if (seconds >= day) {
    var days = Math.floor(seconds / day);
    res = res + days.toString() + "d";
    seconds = seconds - days * day;
  }
  if (seconds >= hour) {
    var hours = Math.floor(seconds / hour);
    res = res + hours.toString() + "h";
    seconds = seconds - hours * hour;
  }
  if (seconds >= minute) {
    var minutes = Math.floor(seconds / minute);
    res = res + minutes.toString() + "m";
    seconds = seconds - minutes * minute;
  }
  if (seconds > 0) {
    res = res + seconds.toString() + "s";
  }
  return res;
}
