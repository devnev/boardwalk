import * as _ from 'underscore';
import * as redux from 'redux';
import * as datasets from './datasets';
import * as Plottable from 'plottable';
import * as sequence from '../../sequence';
import * as hover from '../hover';

export interface Metadata {
  title: string;
  metric: {[label: string]: string};
  queryIndex: number;
}

export interface Point {
    t: Date;
    y: number;
}

export type SeriesValue = Metadata & {
    value: string;
};

export interface ParentState {
  graphDatasets: datasets.State;
  hover: hover.State;
}

export interface State {
  values: Map<string, SeriesValue[]>;
}

export interface SubState {
  graphSeries: State;
}

export const initialState = (): State => ({
  values: new Map<string, SeriesValue[]>(),
});

export const makeReducer =
  <S extends ParentState>(parent: sequence.Reducer<S>): sequence.Reducer<S & SubState> =>
    sequence.sequenceReducers(parent, {graphSeries: subReducer});

const calculateSeries = (datasets: Plottable.Dataset[], highlight: Date): SeriesValue[] => {
  const series = new Array<SeriesValue>();
  datasets.forEach((dataset: Plottable.Dataset): void => {
    const data = dataset.data() as Point[];
    if (data.length === 0 || data[0].t > highlight) {
      series.push({...dataset.metadata() as Metadata, value: ''});
      return;
    }
    let index = _.sortedIndex<{t: Date}, Date>(data, {t: highlight}, (d => d.t));
    if (!(index < data.length && data[index].t === highlight)) {
      index -= 1;
    }
    let point = data[index];
    series.push({
      ...dataset.metadata() as Metadata, value: point.y.toString(),
    });
  });
  return series;
};

export function subReducer(
    parent: ParentState, newParent: ParentState, state: State|undefined, action: redux.Action): State {
  if (parent === newParent && state) {
    return state;
  }

  // hover removed, clear state
  if (newParent.hover.time === undefined) {
    if (state && state.values.size === 0) {
      return state;
    }
    return initialState();
  }
  const target = newParent.hover.time;

  // hover changed, recompute
  if (!state || !parent.hover.time || newParent.hover.time.getTime() !== parent.hover.time.getTime()) {
    const newState = initialState();
    newParent.graphDatasets.datasets.forEach((datasets: Plottable.Dataset[], graphKey: string) => {
      newState.values.set(graphKey, calculateSeries(datasets, target));
    });
    return newState;
  }

  const newState = initialState();
  let changed = false;
  newParent.graphDatasets.datasets.forEach((datasets: Plottable.Dataset[], graphKey: string) => {
    const oldData = parent.graphDatasets.datasets.get(graphKey);
    const oldHighlight = state.values.get(graphKey);
    if (oldData === datasets && oldHighlight) {
      newState.values.set(graphKey, oldHighlight);
      return;
    }
    changed = true;
    newState.values.set(graphKey, calculateSeries(datasets, target));
  });
  return changed ? newState : state;
}
