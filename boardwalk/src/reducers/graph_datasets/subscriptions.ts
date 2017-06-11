import * as redux from 'redux';
import * as _ from 'underscore';
// import { UnknownAction } from '../../actions';
import * as types from '../../types/config';
import * as filter from '../filter';
import * as config from '../config';
import * as match from '../../match';
import * as sequence from '../../sequence';

type Subscriptions = Map<string, { set: Set<string> }>;

export interface State {
  filter: filter.State;
  config: config.State;
  map: Subscriptions;
}

export interface ParentState {
  filter: filter.State;
  config: config.State;
}

export interface SubState {
  map: Subscriptions;
}

export const makeReducer =
    <S extends ParentState>(parent: redux.Reducer<S>): redux.Reducer<S & {subscriptions: SubState}> => (
  sequence.sequenceReducers(parent, {subscriptions: subReducer})
);

export function subReducer(
    oldParent: ParentState,
    newParent: ParentState,
    state: SubState = initialSubState(),
    action: {}
): SubState {
  if (oldParent === newParent) {
    return state;
  }
  if (!newParent.config.config) {
    return state;
  }
  updateSubscriptions(state.map, newParent.config.config, newParent.filter);
  return { map: state.map };
}

// const initialState = (): State => ({
//   filter: filter.initialState(),
//   map: new Map<string, { set: Set<string> }>(),
// });
//
// type Actions = UnknownAction;

const initialSubState = (): SubState => ({
  map: new Map<string, { set: Set<string> }>(),
});

const queryKey = (query: string, source: string): string => source + '?query=' + query;

const graphQueryKey =
  (consolePath: string, graphIndex: number, queryIndex: number): string =>
    consolePath + '#' + graphIndex + '/' + queryIndex;

function updateSubscriptions(subs: Subscriptions, config: types.Config, filter: filter.State): void {
  _.each(config.consoles, (console: types.Console, consolePath: string) => {
    _.each(console.contents, (item: types.ConsoleContents, graphIndex: number) => {
      if (!item.graph) {
        return;
      }
      _.each(item.graph.queries, (query: types.GraphQuery, queryIndex: number) => {
        if (!match.StrictMatchFilter(query.match, filter.filters)) {
          return;
        }
        const qk = queryKey(query.query, query.source);
        const set = (subs.get(qk) || { set: new Set<string>() }).set;
        const gqk = graphQueryKey(consolePath, graphIndex, queryIndex);
        if (set.has(gqk)) {
          return;
        }
        set.add(gqk);
        subs.set(qk, { set: set });
      });
    });
  });
}

// export function reducer(state: State = initialState(), action: Actions): State {
//   let newState = state;
//
//   const filterState = filter.reducer(state.filter, action as redux.Action);
//   if (filterState !== state.filter) {
//     newState = {
//       ...newState,
//       filter: filterState,
//     }
//   }
//
//   switch (action.type) {
//   case RECEIVE_CONFIG:
//     newState = {
//       ...newState,
//       config: action.config,
//     }
//     break
//   default:
//     break;
//   }
//
//   if (state === newState) {
//     return state;
//   }
//   if (newState.config) {
//     updateSubscriptions(newState.map, newState.config, newState.filter);
//   }
//   return newState;
// }
