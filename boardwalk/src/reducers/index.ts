import { combineReducers, Middleware } from 'redux';
import createHistory from 'history/createBrowserHistory';
import { routerReducer, routerMiddleware, RouterState } from 'react-router-redux';
import * as config from './config';
import * as filter from './filter';
import * as query_data from './query_data';
import * as range from './range';
import * as query_subscriptions from './query_subscriptions';

export const history = createHistory();

export const reducer = combineReducers({
  config: config.reducer,
  filter: filter.reducer,
  data: query_data.reducer,
  range: range.reducer,
  subscriptions: query_subscriptions.reducer,
  router: routerReducer,
});

export const middleware: Middleware[] = [
  query_data.queryRequestMiddleware,
  query_subscriptions.queryDispatchMiddleware,
  routerMiddleware(history),
];

export interface State {
  config: config.State;
  filter: filter.State;
  data: query_data.State;
  range: range.State;
  subscriptions: query_subscriptions.State;
  router: RouterState;
}
