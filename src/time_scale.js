// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import Plottable from 'plottable';

export const scale = new Plottable.Scales.Time();

function scaleDomainFromRange(range) {
  const max = range.end;
  const min = new Date(range.end.getTime() - range.duration*1000);
  return {min, max};
}

function createSetRangeAction(domain) {
  return {
    type: 'MODIFY_TIME_SCALE',
    start: domain.min,
    end: domain.max,
  };
}

export function syncScaleWithStore(store, options = {}) {
  const getDomain = options.scaleDomainFromRange || scaleDomainFromRange;
  const createAction = options.createSetRangeAction || createSetRangeAction;
  let dirty = false;
  const unsub = store.subscribe(() => {
    if (dirty) {
      return;
    }
    const domain = getDomain(store.getState().range);
    if (domain.min.getTime() === scale.domainMin().getTime() &&
        domain.max.getTime() === scale.domainMax().getTime()) {
      return;
    }
    scale.domain([domain.min, domain.max]);
  });
  const dispatchScaleChange = _.debounce(() => {
    const end = new Date(Math.round(scale.domainMax().getTime()/1000)*1000);
    const start = new Date(Math.round(scale.domainMin().getTime()/1000)*1000);
    dirty = false;
    store.dispatch(createAction({min: start, max: end}));
  }, 500);
  const onUpdate = () => {
    const storeDomain = scaleDomainFromRange(store.getState().range);
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
