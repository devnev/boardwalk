import * as _ from 'underscore';
import { UnknownAction } from '../../actions';
import { ReceiveConfigAction, RECEIVE_CONFIG } from '../../actions/config';
import * as types from '../../types/config';

export interface GraphQuery {
  queryKey: string;
  titleTpl: string;
}

export interface State {
  map: Map<string, GraphQuery[]>;
}

const initialState = (): State => ({ map: new Map<string, GraphQuery[]>()});

type Actions = ReceiveConfigAction|UnknownAction;

const queryKey = (query: string, source: string): string => source + '?query=' + query;

const graphKey = (consolePath: string, graphIndex: number): string => consolePath + '#' + graphIndex;

export function reducer(state: State = initialState(), action: Actions): State {
  switch (action.type) {
  case RECEIVE_CONFIG:
    let changed = false;
    _.each(action.config.consoles, (console: types.Console, consolePath: string) => {
      _.each(console.contents, (item: types.ConsoleContents, graphIndex: number) => {
        if (!item.graph) {
          return;
        }
        const gk = graphKey(consolePath, graphIndex);
        const queries = _.map(item.graph.queries, (query: types.GraphQuery, queryIndex: number): GraphQuery => {
          return {
            queryKey: queryKey(query.query, query.source),
            titleTpl: query.title,
          };
        });
        if (_.isEqual(state.map.get(gk), queries)) {
          return;
        }
        changed = true;
        state.map.set(gk, queries);
      });
    });
    if (changed) {
      return { map: state.map };
    }
    break;
  default:
    break;
  }
  return state;
}
