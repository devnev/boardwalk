import createHistory from 'history/createBrowserHistory';
import * as redux from 'redux';
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
// import * as graph_queries from './graph_queries';
import * as graph_datasets from './graph_datasets';
import * as sequence from '../sequence';
import * as query_results from './graph_datasets/query_results';

export const history = createHistory();

export interface State extends graph_datasets.GraphDatasetsState {
  config: config.State;
  filter: filter.State;
  data: query_data.State;
  range: range.State;
  // subscriptions: query_subscriptions.State;
  router: RouterState;
  consolePath: console_path.State;
  consoles: consoles.State;
  expanded: expand.State;
  hover: hover.State;
  graphs: graphs.State;
  // graphQueries: graph_queries.State;
  // graphDatasets: graph_datasets.GraphDatasetsState;
  results: query_results.State;
}

export const reducer = ((): sequence.Reducer<State> => {
  // interface Stage1 {
  //   config: config.State;
  //   filter: filter.State;
  //   data: query_data.State;
  //   range: range.State;
  //   // subscriptions: query_subscriptions.State;
  //   router: RouterState;
  //   consolePath: console_path.State;
  //   consoles: consoles.State;
  //   expanded: expand.State;
  //   hover: hover.State;
  //   graphs: graphs.State;
  //   // graphQueries: graph_queries.State;
  // }
  const baseReducer = sequence.combineReducers({
    config: config.reducer,
    filter: filter.reducer,
    data: query_data.reducer,
    range: range.reducer,
    // subscriptions: query_subscriptions.reducer,
    router: routerReducer,
    consolePath: console_path.reducer,
    consoles: consoles.reducer,
    expanded: expand.reducer,
    hover: hover.reducer,
    graphs: graphs.reducer,
    // graphQueries: graph_queries.reducer,
  });
  return graph_datasets.makeReducer(baseReducer);
  // return combineReducers<State>({
  //   config: config.reducer,
  //   filter: filter.reducer,
  //   data: query_data.reducer,
  //   range: range.reducer,
  //   subscriptions: query_subscriptions.reducer,
  //   router: routerReducer,
  //   consolePath: console_path.reducer,
  //   consoles: consoles.reducer,
  //   expanded: expand.reducer,
  //   hover: hover.reducer,
  //   graphs: graphs.reducer,
  //   graphQueries: graph_queries.reducer,
  //   graphDatasets: graph_datasets.reducer,
  // });
})();

export const middleware: redux.Middleware[] = [
  query_data.queryRequestMiddleware,
  query_subscriptions.queryDispatchMiddleware,
  config.middleware,
  routerMiddleware(history),
  router.locationMiddleware(history),
];
