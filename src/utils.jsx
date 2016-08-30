import _ from 'underscore';

export function FormatMetric(metric) {
  var title = "";
  Object.keys(metric).forEach(function(key) {
    if (title == '') {
      title = '{';
    }
    if (key == "__name__") {
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
  } else if (title != '') {
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
    if (key == "") {
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

export function MatchFilter(matches, filter) {
  if (!matches) {
    return true;
  }
  var matcherHasKeys = Object.keys(filter).every(function(key) {
    return matches.hasOwnProperty(key);
  }.bind(this));
  if (!matcherHasKeys) {
    return false;
  }
  var matches = Object.keys(matches).every(function(key) {
    var r = new RegExp(matches[key]);
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
