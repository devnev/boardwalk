// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import querystring from 'querystring';
import { LOCATION_CHANGE } from 'react-router-redux';

export function rangeReducer(state = {duration: null, end: null}, action) {
  switch (action.type) {
    case 'INITIALIZE': {
      // note reverse order of Object.assign - intentional
      return Object.assign({}, action.range, state);
    }
    case LOCATION_CHANGE: {
      if (!action.payload) {
        return {duration: 60*60, end: action.now};
      }
      let params = querystring.parse(action.payload.search);
      let range = Object.assign({}, state, {duration: 60*60, end: action.now});
      if (/^\d+$/.test(params['duration'])) {
        range.duration = Number(params['duration']);
      }
      if (/^\d+$/.test(params['end'])) {
        range.end = new Date(Number(params['end']*1000));
      }
      if (!_.isEqual(range, state)) {
        return range;
      }
      break;
    }
    case 'MODIFY_TIME_SCALE': {
      let {start, end} = action;
      let duration = Math.round((end.getTime() - start.getTime())/1000);
      let range = {duration, end};
      if (!_.isEqual(state, range)) {
        return range;
      }
      break;
    }
    case 'PICK_DURATION': {
      if (!_.isEqual(state.duration, action.duration)) {
        return Object.assign({}, state, { duration: action.duration });
      }
      break;
    }
    case 'PICK_END': {
      if (!_.isEqual(state.end, action.end)) {
        return Object.assign({}, state, { end: action.end });
      }
      break;
    }
  }
  return state;
}
