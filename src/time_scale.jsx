// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import Plottable from 'plottable';

export default class TimeScaleStore {
  constructor() {
    this._range = {
      duration: 1*60*60,
      end: new Date(),
    }
    this._scale = new Plottable.Scales.Time();
    this._callbacks = new Plottable.Utils.CallbackSet();

    this._setScaleFromRange = this._setScaleFromRange.bind(this);
    this._setRangeFromScale = _.debounce(this._setRangeFromScale.bind(this), 100);
    this._scale.onUpdate(this._setRangeFromScale);

    this._setScaleFromRange();
  }
  _setScaleFromRange() {
    var range = this._range;
    var start = new Date(range.end.getTime() - range.duration*1000);
    this.scale([start, range.end]);
  }
  _setRangeFromScale() {
    var scale = this._scale;
    var end = new Date(Math.round(scale.domainMax().getTime()/1000)*1000);
    var start = new Date(Math.round(scale.domainMin().getTime()/1000)*1000);
    var range = {
      duration: Math.round((end.getTime() - start.getTime())/1000),
      end: end,
    }
    this.range(range);
  }
  range(range) {
    if (!range) {
      return this._range;
    } else if (!_.isEqual(range, this._range)) {
      this._range = range;
      this._setScaleFromRange();
    }
  }
  scale(domain) {
    if (!domain) {
      return this._scale;
    } else if (
        domain[0].getTime() !== this._scale.domainMin().getTime() ||
        domain[1].getTime() !== this._scale.domainMax().getTime()) {
      this._scale.domain([domain[0], domain[1]]);
      this._setRangeFromScale();
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
