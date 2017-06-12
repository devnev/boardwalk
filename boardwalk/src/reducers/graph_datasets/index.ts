import * as query_results from './query_results';
import * as subscriptions from './subscriptions';
import * as graph_queries from './graph_queries';
import * as datasets from './datasets';
import * as highlights from './highlights';
import * as series from './series';
import * as sequence from '../../sequence';
import * as filter from '../filter';
import * as config from '../config';
import * as hover from '../hover';

export interface ParentState {
  filter: filter.State;
  config: config.State;
  hover: hover.State;
}

export type GraphDatasetsState = {
  results: query_results.State;
  graphQueries: graph_queries.State;
  subscriptions: subscriptions.State;
  graphDatasets: datasets.State;
  graphHighlights: highlights.State;
  graphSeries: series.State;
};

export const makeReducer =
    <S extends ParentState>(parent: sequence.Reducer<S>): sequence.Reducer<S & GraphDatasetsState> => {
  type Stuff = {results: query_results.State, graphQueries: graph_queries.State};
  type S1 = S & Stuff;
  const r1: sequence.Reducer<S1> = sequence.sequenceReducers<{}, S, Stuff>(parent, {
    results: sequence.ignoringParent(query_results.reducer),
    graphQueries: sequence.ignoringParent(graph_queries.reducer),
  });

  type S2 = S1 & subscriptions.SubState;
  const r2: sequence.Reducer<S2> = subscriptions.makeReducer<S1>(r1);
  type S3 = S2 & datasets.SubState;
  const r3: sequence.Reducer<S3> = datasets.makeReducer(r2);
  type S4 = S3 & highlights.SubState;
  const r4: sequence.Reducer<S4> = highlights.makeReducer(r3);
  type S5 = S4 & series.SubState;
  const r5: sequence.Reducer<S5> = series.makeReducer(r4);

  return r5;
};

// export const reducer: redux.Reducer<State> = datasets.makeReducer(
//   redux.combineReducers<datasets.ParentState>({
//     graphs: graphs.reducer,
//     results: query_results.reducer,
//     subscriptions: subscriptions.reducer,
//     graphQueries: graph_queries.reducer,
//   }),
// );
//
// export function reducer(state: State|undefined, action: redux.Action): State {
//   const newState: State = {
//     graphs: graphs.reducer(state ? state.graphs : undefined, action),
//     results: query_results.reducer(state ? state.results : undefined, action),
//     subscriptions: subscriptions.reducer(state ? state.subscriptions : undefined, action),
//     graphQueries: graph_queries.reducer(state ? state.graphQueries : undefined, action),
//     graphDatasets: state ? state.graphDatasets : new Map<string, Plottable.Dataset[]>(),
//   }
//   if (state &&
//       state.graphs === newState.graphs &&
//       state.results === newState.results &&
//       state.subscriptions === newState.subscriptions &&
//       state.graphQueries === newState.graphQueries) {
//     return state;
//   }
//
//   for (let queryKey in newState.subscriptions.map.keys()) {
//     const changed = (
//       !state ||
//       state.results.data.get(queryKey) !== newState.results.data.get(queryKey) ||
//       state.subscriptions.map.get(queryKey) !== newState.subscriptions.map.get(queryKey));
//     if (!changed) {
//       continue;
//     }
//     newState.graphQueries.map.forEach((queries: graph_queries.GraphQuery[], graphKey: string) => {
//       const queryDatasets = queries.map((queryInfo, queryIndex) => {
//         const results = newState.results.data.get(queryInfo.queryKey);
//         if (!results) {
//           return;
//         }
//         const datasets = results.data.result.map(result => {
//           const data = result.values.map(value => ({
//             t: new Date(value[0] * 1000),
//             y: parseFloat(value[1]),
//           }));
//           const dataset = new Plottable.Dataset(data, {
//             title: fmt.FormatTemplate(queryInfo.titleTpl, result.metric),
//             metric: result.metric,
//             queryIndex: queryIndex,
//           })
//           return dataset;
//         })
//         return datasets;
//       })
//       const datasets = queryDatasets.reduce<Plottable.Dataset[]>(
//         (datasets, dataset) => (dataset ? datasets.concat(dataset) : datasets),
//         new Array<Plottable.Dataset>());
//       newState.graphDatasets.set(graphKey, datasets);
//     });
//   }
//
//   return newState;
// }
