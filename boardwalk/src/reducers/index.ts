import { combineReducers, Middleware } from 'redux';
import * as config from './config';
import * as filter from './filter';
import * as query_data from './query_data';
import * as range from './range';
import * as query_subscriptions from './query_subscriptions';

export const reducer = combineReducers({
  config: config.reducer,
  filter: filter.reducer,
  data: query_data.reducer,
  range: range.reducer,
  subscriptions: query_subscriptions.reducer,
});

export const middleware: Middleware[] = [
  query_data.queryRequestMiddleware,
  query_subscriptions.queryDispatchMiddleware,
];

export interface State {
  config: config.State;
  filter: filter.State;
  data: query_data.State;
  range: range.State;
  subscriptions: query_subscriptions.State;
}
