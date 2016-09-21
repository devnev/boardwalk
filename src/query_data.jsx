// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import $ from 'jquery';

const _get = (obj, key, def) => (
  _.has(obj, key) ? obj[key] : def
);

const queryKey = (query, source) => {
  return source + '?query=' + query;
};

export const queryRequestMiddleware = ({ dispatch }) => (next) => (action) => {
  switch (action.type) {
    case 'LOAD_QUERY': {
      const step = Math.floor((action.end.getTime()/1000 - action.start.getTime()/1000) / 200);
      const request = $.get(action.source, {
        query: action.query,
        start: Math.round(action.start.getTime()/1000),
        end: Math.round(action.end.getTime()/1000),
        step: step.toString() + "s",
      });
      request.then((data) => dispatch({
        ...action,
        type: 'QUERY_DATA',
        request: request,
        data: data.data.result,
      }));
      return next({...action, request: request});
    }
    default: {
      return next(action);
    }
  }
};

function _getData(query, source, def) {
  const key = queryKey(query, source);
  return _.has(this, key) ? this[key] : def;
}

export const queryDataReducer = (state = {get: _getData}, action) => {
  switch (action.type) {
    case 'SUBSCRIBE_QUERY': {
      const key = queryKey(action.query, action.source);
      if (!_get(state, key)) {
        return {
          ...state,
          [key]: {
            query: action.query,
            source: action.source,
            start: null,
            end: null,
            request: null,
            data: null,
          },
        };
      }
      break;
    }
    case 'LOAD_QUERY': {
      const key = queryKey(action.query, action.source);
      const request = _get(state, key, {}).request;
      if (request && request !== action.request) {
        request.abort();
      }
      return {
        ...state,
        [key]: {
          ..._get(state, key, {data: null}),
          query: action.query,
          source: action.source,
          start: action.start,
          end: action.end,
          request: action.request,
        },
      };
    }
    case 'QUERY_DATA': {
      const key = queryKey(action.query, action.source);
      const entry = _get(state, key, {});
      return {
        ...state,
        [key]: {
          query: action.query,
          source: action.source,
          start: action.start,
          end: action.end,
          request: action.request === entry.request ? null : entry.request,
          data: action.data,
        },
      };
    }
  }
  return state;
};
