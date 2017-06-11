import * as redux from 'redux';
import * as query_results from './query_results';
import * as subscriptions from './subscriptions';
import * as graph_queries from './graph_queries';
import * as Plottable from 'plottable';
import * as fmt from '../../fmt';
import * as sequence from '../../sequence';

export interface ParentState {
  results: query_results.State;
  subscriptions: subscriptions.SubState;
  graphQueries: graph_queries.State;
}

export interface State {
  datasets: Map<string, Plottable.Dataset[]>;
}

export type SubState = { graphDatasets: State };

export const makeReducer =
  <S extends ParentState>(parent: sequence.Reducer<S>): sequence.Reducer<S & SubState> =>
    sequence.sequenceReducers(parent, {graphDatasets: reducer});

export function reducer(
    parent: ParentState, newParent: ParentState, state: State|undefined, action: redux.Action): State {
  const newState = {
    datasets: state ? state.datasets : new Map<string, Plottable.Dataset[]>(),
  };
  for (const queryKey of Array.from(newParent.subscriptions.map.keys())) {
    const changed = (
      !state ||
      parent.results.data.get(queryKey) !== newParent.results.data.get(queryKey) ||
      parent.subscriptions.map.get(queryKey) !== newParent.subscriptions.map.get(queryKey));
    if (!changed) {
      continue;
    }
    newParent.graphQueries.map.forEach((queries: graph_queries.GraphQuery[], graphKey: string) => {
      const queryDatasets = queries.map((queryInfo, queryIndex) => {
        const results = newParent.results.data.get(queryInfo.queryKey);
        if (!results) {
          return;
        }
        const datasets = results.data.result.map(result => {
          const data = result.values.map(value => ({
            t: new Date(value[0] * 1000),
            y: parseFloat(value[1]),
          }));
          const dataset = new Plottable.Dataset(data, {
            title: fmt.FormatTemplate(queryInfo.titleTpl, result.metric),
            metric: result.metric,
            queryIndex: queryIndex,
          });
          return dataset;
        });
        return datasets;
      });
      const datasets = queryDatasets.reduce<Plottable.Dataset[]>(
        (results, dataset) => (dataset ? results.concat(dataset) : results),
        new Array<Plottable.Dataset>());
      newState.datasets.set(graphKey, datasets);
    });
  }

  return newState;
}
