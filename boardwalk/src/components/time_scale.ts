// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import * as _ from 'underscore';
import * as Plottable from 'plottable';
import * as time_actions from '../actions/time';
import * as redux from 'redux';
import * as range from '../reducers/range';

export const scale = new Plottable.Scales.Time();

function scaleDomainFromRange(range: {duration: number, end: Date}): {min: Date, max: Date} {
  const max = range.end;
  const min = new Date(range.end.getTime() - range.duration * 1000);
  return {min, max};
}

function createSetRangeAction(domain: {min: Date, max: Date}): time_actions.ModifyTimeScaleAction {
  return {
    type: time_actions.MODIFY_TIME_SCALE,
    start: domain.min,
    end: domain.max,
  };
}

export function syncScaleWithStore(store: redux.Store<{range: range.State}>) {
  const getDomain = scaleDomainFromRange;
  const createAction = createSetRangeAction;
  let dirty = false;

  const unsub = store.subscribe(() => {
    if (dirty) {
      return;
    }
    const range = store.getState().range;
    if (!range.duration || !range.end) {
      return;
    }
    const domain = getDomain({duration: range.duration, end: range.end});
    if (domain.min.getTime() === scale.domainMin().getTime() &&
        domain.max.getTime() === scale.domainMax().getTime()) {
      return;
    }
    scale.domain([domain.min, domain.max]);
  });

  const dispatchScaleChange = _.debounce(() => {
    const end = new Date(Math.round(scale.domainMax().getTime() / 1000) * 1000);
    const start = new Date(Math.round(scale.domainMin().getTime() / 1000) * 1000);
    dirty = false;
    store.dispatch(createAction({min: start, max: end}));
  }, 500);  //tslint:disable-line

  const onUpdate = () => {
    const range = store.getState().range;
    if (!range.duration || !range.end) {
      return;
    }
    const storeDomain = scaleDomainFromRange({duration: range.duration, end: range.end});
    if (storeDomain.min.getTime() === scale.domainMin().getTime() &&
        storeDomain.max.getTime() === scale.domainMax().getTime()) {
      return;
    }
    dirty = true;
    dispatchScaleChange();
  };

  scale.onUpdate(onUpdate);
  return () => {
    unsub();
    scale.offUpdate(onUpdate);
  };
}
