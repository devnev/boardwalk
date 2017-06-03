import * as redux from 'redux';
import * as _ from 'underscore';
import { State as QueryState } from './query_data';
import { State as RangeState } from './range';
import { UnknownAction } from '../actions';
import * as query_actions from '../actions/query';
import * as range_actions from '../actions/time';

export interface Entry {
  key: string;
  query: string;
  source: string;
  objects: {}[];
}

function get<V, D>(obj: {[key: string]: V | null | undefined}, key: string, def: D): V | D {
  if (!obj.hasOwnProperty(key)) {
    return def;
  }
  let val = obj[key];
  if (val === null || val === undefined) {
    return def;
  }
  return val;
}

const queryKey = (query: string, source: string): string => {
  return source + '?query=' + query;
};

type Actions = query_actions.SubscribeQueryAction|query_actions.UnsubscribeQueryAction|UnknownAction;

export interface State {
  entries: {[key: string]: Entry};
}

export function reducer(state: State = {entries: {}}, action: Actions): State {
  switch (action.type) {
  case query_actions.SUBSCRIBE_QUERY: {
    const key = queryKey(action.query, action.source);
    const emptyObjs: {}[] = [];
    const oldEntry = get(state.entries, key, {objects: emptyObjs});
    if (oldEntry.objects.indexOf(action.object) >= 0) {
      break;
    }
    let entry = {
      ...oldEntry,
      key: key,
      query: action.query,
      source: action.source,
      objects: emptyObjs.concat(oldEntry.objects, [action.object]),
    };
    return {
      ...state,
      entries: {
        ...state.entries,
        [key]: entry,
      }
    };
  }
  case query_actions.UNSUBSCRIBE_QUERY: {
    const key = queryKey(action.query, action.source);
    const oldEntry = get(state.entries, key, null);
    if (!oldEntry) {
      break;
    }
    const index = oldEntry.objects.indexOf(action.object);
    if (index < 0) {
      break;
    }
    return {
      ...state,
      entries: {
        ...state.entries,
        [key]: {
          ...oldEntry,
          objects: oldEntry.objects.splice(index, 1),
        },
      }
    };
  }
  default:
    return state;
  }
  return state;
}

const reload = <S>(entries: State, range: RangeState, dispatch: redux.Dispatch<S>) => {
  if (!range.end || !range.duration) {
    return;
  }
  const end = range.end;
  const start = new Date(end.getTime() - range.duration * 1000);
  _.each(entries.entries, (entry) => {
    if (entry.objects.length > 0) {
      dispatch({
        type: query_actions.LOAD_QUERY,
        query: entry.query,
        source: entry.source,
        start: start,
        end: end,
      });
    }
  });
};

interface SubscriptionState {
  data: QueryState;
  range: RangeState;
  subscriptions: State;
}

type SubscriptionActions =
  query_actions.SubscribeQueryAction|
  range_actions.ModifyTimeScaleAction|
  range_actions.PickDurationAction|
  range_actions.PickEndAction|
  UnknownAction;

export const queryDispatchMiddleware =
    <S extends SubscriptionState>({ dispatch, getState }: redux.MiddlewareAPI<S>) =>
    (next: redux.Dispatch<S>) =>
    (action: SubscriptionActions): SubscriptionActions => {
  const result = next(action);
  switch (action.type) {
  case query_actions.SUBSCRIBE_QUERY: {
    const key = queryKey(action.query, action.source);
    const {duration, end} = getState().range;
    if (!end || !duration) {
      return result;
    }
    const entry = get(getState().data.queries, key, null);
    const start = new Date(end.getTime() - duration * 1000);
    if (entry && entry.start && entry.end &&
        entry.source === action.source && entry.query === action.query &&
        entry.start.getTime() === start.getTime() && entry.end.getTime() === end.getTime()) {
      return result;
    }
    dispatch({
      type: query_actions.LOAD_QUERY,
      query: action.query,
      source: action.source,
      start: start,
      end: end,
    });
    return result;
  }
  case range_actions.MODIFY_TIME_SCALE: {
    const state = getState();
    reload(state.subscriptions, state.range, dispatch);
    return result;
  }
  case range_actions.PICK_DURATION: {
    const state = getState();
    reload(state.subscriptions, state.range, dispatch);
    return result;
  }
  case range_actions.PICK_END: {
    const state = getState();
    reload(state.subscriptions, state.range, dispatch);
    return result;
  }
  default:
    return result;
  }
};
