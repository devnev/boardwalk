// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import querystring from 'querystring';
import { combineReducers } from 'redux';
import { LOCATION_CHANGE } from 'react-router-redux';

const filterPrefix = "filter.";

function consoleReducer(state = "", action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      if (!action.payload) {
        return '';
      }
      let {pathname} = action.payload;
      return pathname.replace(/\/+$/, "");
    }
    case 'SELECT_CONSOLE': {
      return action.console;
    }
  }
  return state;
}

function configReducer(state = null, action) {
  switch (action.type) {
    case 'RECEIVE_CONFIG': {
      return action.config;
    }
  }
  return state;
}

function rangeReducer(state = {duration: null, end: null}, action) {
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

function filterReducer(state = {}, action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      if (!action.payload) {
        return {};
      }
      let params = querystring.parse(action.payload.search);
      let filter = {};
      _.each(params, (values, key) => {
        if (key.startsWith(filterPrefix)) {
          let v = Array.isArray(values) ? values[values.length-1] : values;
          filter[key.substr(filterPrefix.length)] = v;
        }
      });
      if (!_.isEqual(state, filter)) {
        return filter;
      }
      break;
    }
    case 'SET_FILTERS': {
      let filters = Object.assign({}, state);
      _.each(action.filters, (value, name) => {
        if (value) {
          filters[name] = value;
        } else {
          delete filters[name];
        }
      });
      if (!_.isEqual(filters, state)) {
        return filters;
      }
      break;
    }
  }
  return state;
}

function hoverReducer(state, action) {
  switch (action.type) {
    case 'HOVER':
      return {time: action.time};
  }
  return state ? state : {time: action.now};
}

const initialExpandedState = { panelIndex: null, queryIndex: null, metricLabels: null };

function expandedReducer(state = initialExpandedState, action) {
  switch (action.type) {
    case 'SELECT_CONSOLE': {
      return Object.assign({}, initialExpandedState);
    }
    case 'SET_FILTERS': {
      return Object.assign({}, initialExpandedState);
    }
    case 'EXPAND_METRIC': {
      return {
        panelIndex: action.panelIndex,
        queryIndex: action.queryIndex,
        metricLabels: action.metricLabels,
      };
    }
    case 'COLLAPSE_METRIC': {
      return Object.assign({}, initialExpandedState);
    }
  }
  return state;
}

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

function routerReducer(state = { locationBeforeTransitions: null }, action) {
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

export const actionTimeMiddleware = store => next => action => {
  if (action) {
    action.now = new Date();
  }
  return next(action);
};

export const reducer = combineReducers({
  console: consoleReducer,
  config: configReducer,
  range: rangeReducer,
  expanded: expandedReducer,
  hover: hoverReducer,
  filter: filterReducer,
  routing: routerReducer,
});
