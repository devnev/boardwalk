// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { combineReducers } from 'redux';
import { queryDataReducer, queryRequestMiddleware } from './reducers/query_data.jsx';
import { querySubscriptionsReducer, queryDispatchMiddleware } from './reducers/query_subscriptions.jsx';
import { consoleReducer } from './reducers/console.js';
import { configReducer } from './reducers/config.js';
import { rangeReducer } from './reducers/range.js';
import { expandedReducer } from './reducers/expanded.js';
import { hoverReducer } from './reducers/hover.js';
import { filterReducer } from './reducers/filter.js';
import { routerReducer } from './reducers/router.js';

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
  data: queryDataReducer,
  queries: querySubscriptionsReducer,
});

export const middlewares = [
  actionTimeMiddleware,
  queryRequestMiddleware,
  queryDispatchMiddleware({
    getRange: (state) => state.range,
    getData: (state) => state.data,
    getSubs: (state) => state.queries,
  })
];
