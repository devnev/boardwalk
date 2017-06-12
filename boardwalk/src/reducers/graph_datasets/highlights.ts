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

export type SeriesHighlight = Metadata & Point;

export type SeriesValue = Metadata & {
    value: string|number;
};

export interface ParentState {
  graphDatasets: datasets.State;
  hover: hover.State;
}

export interface State {
  datasets: Map<string, SeriesHighlight[]>;
}

export const initialState = (): State => ({
  datasets: new Map<string, SeriesHighlight[]>(),
});

export const makeReducer =
  <S extends ParentState>(parent: sequence.Reducer<S>): sequence.Reducer<S & {graphHighlights: State}> =>
    sequence.sequenceReducers(parent, {graphHighlights: subReducer});

const calculateHeighlights = (datasets: Plottable.Dataset[], highlight: Date): SeriesHighlight[] => {
  const points = new Array<SeriesHighlight>();
  datasets.forEach((dataset: Plottable.Dataset): void => {
    const data = dataset.data() as Point[];
    if (data.length === 0 || data[0].t > highlight) {
      return;
    }
    let index = _.sortedIndex<{t: Date}, Date>(data, {t: highlight}, (d => d.t));
    if (!(index < data.length && data[index].t === highlight)) {
      index -= 1;
    }
    let point = data[index];
    points.push({
      ...dataset.metadata() as Metadata,
      ...point,
    });
  });
  return points;
};

export function subReducer(
    parent: ParentState, newParent: ParentState, state: State|undefined, action: redux.Action): State {
  if (parent === newParent && state) {
    return state;
  }

  // hover removed, clear state
  if (newParent.hover.time === undefined) {
    if (state && state.datasets.size === 0) {
      return state;
    }
    return initialState();
  }
  const target = newParent.hover.time;

  // hover changed, recompute
  if (!state || !parent.hover.time || newParent.hover.time.getTime() !== parent.hover.time.getTime()) {
    const newState = initialState();
    newParent.graphDatasets.datasets.forEach((datasets: Plottable.Dataset[], graphKey: string) => {
      newState.datasets.set(graphKey, calculateHeighlights(datasets, target));
    });
    return newState;
  }

  const newState = initialState();
  let changed = false;
  newParent.graphDatasets.datasets.forEach((datasets: Plottable.Dataset[], graphKey: string) => {
    const oldData = parent.graphDatasets.datasets.get(graphKey);
    const oldHighlight = state.datasets.get(graphKey);
    if (oldData === datasets && oldHighlight) {
      newState.datasets.set(graphKey, oldHighlight);
      return;
    }
    changed = true;
    newState.datasets.set(graphKey, calculateHeighlights(datasets, target));
  });
  return changed ? newState : state;
}
