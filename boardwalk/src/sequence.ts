import * as redux from 'redux';

// export const sequenceReducer =
//     <S, Sub, K extends keyof Sub>(
//       first: redux.Reducer<S>,
//       on: K,
//       then: (parent: S, state: Sub[K], action: redux.Action) => Sub[K]) =>
//     (state: S & Sub, action: redux.Action): S & Sub => {
//   const thenState = state[on];
//   const firstUpdate = first(state, action);
//   const thenUpdate = then(firstUpdate, thenState, action);
//   if (firstUpdate === state && thenUpdate === thenState) {
//     return state;
//   }
//   const result = Object.assign({}, state, firstUpdate);
//   result[on] = thenUpdate;
//   return result;
// };

export type Reducer<State> = <A extends redux.Action>(state: State|undefined, action: A) => State;

export type SubReducer<Parent, Sub> =
  (prevParent: Parent, parentState: Parent, state: Sub|undefined, action: redux.Action) => Sub;

export const sequenceReducers =
    <View, In extends View, Sub>(
      parentReducer: Reducer<In>,
      subs: {[R in keyof Sub]: SubReducer<View, Sub[R]>}) =>
    (state: In & Sub, action: redux.Action): In & Sub => {
  let changed = false;

  // copy out the sub state
  const subStates = {} as Sub;
  for (const k in subs) {
    if (!Object.prototype.hasOwnProperty.call(subs, k)) {
      continue;
    }
    subStates[k] = state[k];
  }

  // apply parent to whole state, which is restricted to only the parent state in the type system
  const parentThen = parentReducer(state, action);
  changed = changed || parentThen !== state;

  // apply individual sub-reducers, passing in old and new parent state
  const subThens = {} as Sub;
  for (const k in subs) {
    if (!Object.prototype.hasOwnProperty.call(subs, k)) {
      continue;
    }
    subThens[k] = subs[k](state, parentThen, subStates[k], action);
    changed = changed || (subThens[k] !== subStates[k]);
  }

  // if no changes occurred, ensure we return the original state object
  if (!changed) {
    return state;
  }

  // copy new parent and sub state into object to be returned
  return Object.assign({}, parentThen, subThens);
};

export const ignoringParent =
    <Sub>(reducer: Reducer<Sub>) =>
    (prevParent: {}, parentState: {}, state: Sub|undefined, action: redux.Action): Sub => {
  return reducer(state, action);
};

export const combineReducers =
    <S>(reducers: {[P in keyof S]: Reducer<S[P]>}): Reducer<S> =>
      redux.combineReducers<S>(<any> reducers); // tslint:disable-line:no-any
