import { combineReducers, Middleware } from 'redux';
import createHistory from 'history/createBrowserHistory';
import { routerReducer, routerMiddleware, RouterState } from 'react-router-redux';
import * as config from './config';
import * as filter from './filter';
import * as query_data from './query_data';
import * as range from './range';
import * as query_subscriptions from './query_subscriptions';
import * as console_path from './console_path';
import * as consoles from './consoles';
import * as expand from './expand';
import * as router from './router';
import * as hover from './hover';
import * as graphs from './graphs';

export const history = createHistory();

export interface State {
  config: config.State;
  filter: filter.State;
  data: query_data.State;
  range: range.State;
  subscriptions: query_subscriptions.State;
  router: RouterState;
  consolePath: console_path.State;
  consoles: consoles.State;
  expanded: expand.State;
  hover: hover.State;
  graphs: graphs.State;
}

export const reducer = combineReducers<State>({
  config: config.reducer,
  filter: filter.reducer,
  data: query_data.reducer,
  range: range.reducer,
  subscriptions: query_subscriptions.reducer,
  router: routerReducer,
  consolePath: console_path.reducer,
  consoles: consoles.reducer,
  expanded: expand.reducer,
  hover: hover.reducer,
  graphs: graphs.reducer,
});

export const middleware: Middleware[] = [
  query_data.queryRequestMiddleware,
  query_subscriptions.queryDispatchMiddleware,
  routerMiddleware(history),
  router.locationMiddleware(history),
];
