import * as _ from 'underscore';

export function StrictMatchFilter(matcher: {[label: string]: string}, filter: {[label: string]: string}): boolean {
  if (!matcher) {
    return false;
  }
  var matcherHasKeys = Object.keys(filter).every((key: string): boolean => {
    return matcher.hasOwnProperty(key);
  });
  if (!matcherHasKeys) {
    return false;
  }
  var matches = Object.keys(matcher).every((key: string): boolean => {
    var r = new RegExp(matcher[key]);
    var v = _(filter).has(key) ? filter[key] : '';
    return r.test(v);
  });
  return matches;
}

export function MatchFilter(matcher: {[label: string]: string}, filter: {[label: string]: string}): boolean {
  if (!matcher) {
    return true;
  }
  var matches = Object.keys(matcher).every((key: string): boolean => {
    var r = new RegExp(matcher[key]);
    var v = _(filter).has(key) ? filter[key] : '';
    return r.test(v);
  });
  return matches;
}
