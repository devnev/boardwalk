import axios from 'axios';
import { UnknownAction } from '../actions';
import * as actions from '../actions/query';
import * as redux from 'redux';

function has(obj: {[key: string]: {}}, key: string): boolean {
  if (!obj.hasOwnProperty(key)) {
    return false;
  }
  return obj[key] !== null && obj[key] !== undefined;
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

// queryRequestMiddleware handles dispatching of ajax calls for queries.
// It watches for LOAD_QUERY actions to issue new requests. On completion of a request, a QUERY_DATA action is
// dispatched. A request canceler is added to the load action so the request can be aborted if the query is no longer
// needed, e.g. because the time ranges have changed.
export const queryRequestMiddleware =
    <S>({ dispatch }: redux.MiddlewareAPI<S>) =>
    (next: redux.Dispatch<S>) =>
    (action: actions.LoadQueryAction): actions.LoadQueryAction => {
  switch (action.type) {
    case 'LOAD_QUERY': {
      const step = Math.floor((action.end.getTime() / 1000 - action.start.getTime() / 1000) / 200);
      const cancel = axios.CancelToken.source();
      const request = axios.get(action.source, {
        params: {
          query: action.query,
          start: Math.round(action.start.getTime() / 1000),
          end: Math.round(action.end.getTime() / 1000),
          step: step.toString() + 's',
        },
        cancelToken: cancel.token,
      });
      request.then((response) => dispatch<actions.QueryDataAction>({
        ...action,
        type: actions.QUERY_DATA,
        request: cancel,
        data: response.data.data,
      }));
      return next<actions.LoadQueryAction>({...action, request: cancel});
    }
    default: {
      return next(action);
    }
  }
};

export interface QueryState {
  query: string;
  source: string;
  start?: Date;
  end?: Date;
  request?: actions.QueryRequest;
  data?: object;
}

export interface State {
  get: <D>(state: State, query: string, source: string, def: D) => QueryState|D;
  queries: {[key: string]: QueryState};
}

function initialState(): State {
  const g = <D>(st: {}, q: string, s: string, def: D) => def;
  const s: State = {get: g, queries: {}};
  s.get = <D>(state: State, query: string, source: string, def: D): QueryState|D =>
    get(state.queries, queryKey(query, source), def);
  return s;
}

type Actions = actions.SubscribeQueryAction|actions.LoadQueryAction|actions.QueryDataAction|UnknownAction;

// query data reducer tracks all state from query actions in the store
export function reducer(state: State = initialState(), action: Actions = UnknownAction): State {
  switch (action.type) {
    case actions.SUBSCRIBE_QUERY: {
      const key = queryKey(action.query, action.source);
      if (has(state.queries, key)) {
        break;
      }
      return {
        ...state,
        queries: {
          ...state.queries,
          [key]: {
            query: action.query,
            source: action.source,
          },
        },
      };
    }
    case actions.LOAD_QUERY: {
      const key = queryKey(action.query, action.source);
      const request = get(state.queries, key, {request: null}).request;
      if (request && request !== action.request) {
        request.cancel();
      }
      return {
        ...state,
        queries: {
          ...state.queries,
          [key]: {
            ...get(state.queries, key, {}),
            query: action.query,
            source: action.source,
            start: action.start,
            end: action.end,
            request: action.request,
          },
        },
      };
    }
    case actions.QUERY_DATA: {
      const key = queryKey(action.query, action.source);
      const entry = get(state.queries, key, {request: undefined});
      return {
        ...state,
        queries: {
          ...state.queries,
          [key]: {
            query: action.query,
            source: action.source,
            start: action.start,
            end: action.end,
            request: action.request === entry.request ? undefined : entry.request,
            data: action.data,
          },
        },
      };
    }
    default:
  }
  return state;
}
