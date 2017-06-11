import { UnknownAction } from '../../actions';
import * as query_actions from '../../actions/query';
import * as prom_types from '../../types/prom';

export interface Result {
  source: string;
  query: string;
  start: Date;
  end: Date;
  data: prom_types.PromMatrix;
}
export type State = { data: Map<string, Result> };

function initialState(): State {
  return { data: new Map<string, Result>() };
}

type Actions = query_actions.QueryDataAction|UnknownAction;

const queryKey = (query: string, source: string): string => {
  return source + '?query=' + query;
};

export function reducer(state: State = initialState(), action: Actions = UnknownAction): State {
  switch (action.type) {
  case query_actions.QUERY_DATA:
    if (!prom_types.isMatrix(action.data)) {
      break;
    }
    state.data.set(queryKey(action.query, action.source), {
      source: action.source,
      query: action.query,
      start: action.start,
      end: action.end,
      data: action.data,
    });
    return { data: state.data };
  default:
    break;
  }
  return state;
}
