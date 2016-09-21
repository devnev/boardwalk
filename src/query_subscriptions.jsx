// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';

const _get = (obj, key, def) => (
  _.has(obj, key) ? obj[key] : def
);

const queryKey = (query, source) => {
  return source + '?query=' + query;
};

const reload = (entries, range, dispatch) => {
  const end = range.end;
  const start = new Date(end.getTime() - range.duration*1000);
  _.each(entries, (entry) => {
    if (entry.objects.length > 0) {
      dispatch({
        type: 'LOAD_QUERY',
        query: entry.query,
        source: entry.source,
        start: start,
        end: end,
      });
    }
  });
}

export const queryDispatchMiddleware = ({getRange, getData, getSubs}) => ({ getState, dispatch }) => (next) => (action) => {
  switch (action.type) {
    case 'SUBSCRIBE_QUERY': {
      let result = next(action);
      let key = queryKey(action.query, action.source);
      let range = getRange(getState());
      let end = range.end;
      let start = new Date(end.getTime() - range.duration*1000);
      let entry = _get(getData(getState()), key);
      if (entry &&
          entry.start &&
          entry.end &&
          entry.source === action.source &&
          entry.query === action.query &&
          entry.start.getTime() === start.getTime() &&
          entry.end.getTime() === end.getTime()) {
        return result;
      }
      dispatch({
        type: 'LOAD_QUERY',
        query: action.query,
        source: action.source,
        start: start,
        end: range.end,
      });
      return result;
    }
    case 'MODIFY_TIME_SCALE': {
      const result = next(action);
      reload(getSubs(getState()), getRange(getState()), dispatch);
      return result;
    }
    case 'PICK_DURATION': {
      const result = next(action);
      reload(getSubs(getState()), getRange(getState()), dispatch);
      return result
    }
    case 'PICK_END': {
      const result = next(action);
      reload(getSubs(getState()), getRange(getState()), dispatch);
      return result
    }
    default: {
      return next(action);
    }
  }
};

export const querySubscriptionsReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SUBSCRIBE_QUERY': {
      const key = queryKey(action.query, action.source);
      const oldEntry = _get(state, key, {objects: []});
      if (oldEntry.objects.indexOf(action.object) >= 0) {
        break;
      }
      let entry = {
        ...oldEntry,
        key: key,
        query: action.query,
        source: action.source,
        objects: [].concat(oldEntry.objects, [action.object]),
      };
      return {
        ...state,
        [key]: entry,
      };
    }
    case 'UNSUBSCRIBE_QUERY': {
      const key = queryKey(action.query, action.source);
      const oldEntry = _get(state, key);
      if (!oldEntry) {
        break;
      }
      const index = oldEntry.objects.indexOf(action.object);
      if (index < 0) {
        break;
      }
      return {
        ...state,
        [key]: {
          ...oldEntry,
          objects: oldEntry.objects.splice(index, 1),
        },
      };
    }
  }
  return state;
};
