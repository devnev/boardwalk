// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import querystring from 'querystring';
import { LOCATION_CHANGE } from 'react-router-redux';
import { filterPrefix } from './common.js';

function setQueryParams(routerState, params) {
  let qs = parseQueryParams(routerState.locationBeforeTransitions);
  let modified = Object.assign({}, qs, params);
  Object.keys(modified).forEach((k) => {
    if (modified[k] === undefined) {
      delete modified[k];
    }
  });
  if (_.isEqual(qs, modified)) {
    return routerState;
  }
  let oldLocation = routerState.locationBeforeTransitions || { pathname: '', hash: '' };
  let location = Object.assign({}, oldLocation, {
    search: '?' + querystring.stringify(modified),
    action: 'push',
  });
  return Object.assign({}, routerState, {
    locationBeforeTransitions: location
  });
}

function parseQueryParams(location) {
  let qs = (location || {}).search || '';
  qs = (qs && qs[0] === '?') ? qs.substr(1) : qs;
  return querystring.parse(qs);
}

export function routerReducer(state = { locationBeforeTransitions: null }, action) {
  switch (action.type) {
    case 'INITIALIZE': {
      let {end, duration} = action.range;
      let qs = parseQueryParams(state.locationBeforeTransitions);
      return setQueryParams(state, {
        duration: qs.duration || duration,
        end: qs.end || Math.round(end.getTime()/1000),
      });
    }
    case LOCATION_CHANGE: {
      return Object.assign({}, state, { locationBeforeTransitions: action.payload });
    }
    case 'SELECT_CONSOLE': {
      return {
        ...state,
        locationBeforeTransitions: {
          ...state.locationBeforeTransitions,
          pathname: action.console,
        },
      };
    }
    case 'MODIFY_TIME_SCALE': {
      let {start, end} = action;
      let duration = Math.round((end.getTime() - start.getTime())/1000);
      return setQueryParams(state, {duration, end: Math.round(end.getTime()/1000)});
    }
    case 'PICK_DURATION': {
      return setQueryParams(state, {duration: action.duration});
    }
    case 'PICK_END': {
      return setQueryParams(state, {end: Math.round(action.end.getTime()/1000)});
    }
    case 'SET_FILTERS': {
      let filters = action.filters;
      let qsFilters = {};
      _.each(filters, (value, name) => {
        var key = filterPrefix + name;
        if (value) {
          qsFilters[key] = value;
        } else {
          qsFilters[key] = undefined;
        }
      });
      return setQueryParams(state, qsFilters);
    }
  }
  return state;
}

