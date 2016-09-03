// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import Plottable from 'plottable';

export default class FilterStore {
  constructor() {
    this._filter = {};
    this._callbacks = new Plottable.Utils.CallbackSet();
  }
  filter() {
    return this._filter;
  }
  has(key) {
    return _.has(this._filter, key);
  }
  value(key) {
    return this.has(key) ? this._filter[key] : "";
  }
  _reset(filter) {
    var cleaned = _.clone(filter);
    Object.keys(cleaned).forEach(function(v, k) {
      if (!v) {
        delete cleaned[k];
      }
    });
    if (!_.isEqual(this._filter, cleaned)) {
      this._filter = cleaned;
      this._callbacks.callCallbacks(this);
    }
  }
  onUpdate(callback, immediate) {
    this._callbacks.add(callback);
    if (immediate) {
      callback(this);
    }
    return this;
  }
  offUpdate(callback) {
    this._callbacks.delete(callback);
    return this;
  }
}
