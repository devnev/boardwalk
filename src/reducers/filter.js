// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import querystring from 'querystring';
import { LOCATION_CHANGE } from 'react-router-redux';
import { filterPrefix } from './common.js';

export function filterReducer(state = {}, action) {
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

