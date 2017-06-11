import * as _ from 'underscore';
import { UnknownAction } from '../actions';
import { ReceiveConfigAction, RECEIVE_CONFIG } from '../actions/config';
import * as types from '../types/config';

export interface State {
  map: Map<string, types.Graph>;
}

const initialState = () => ({ map: new Map<string, types.Graph>() });

type Actions = ReceiveConfigAction|UnknownAction;

export function reducer(state: State = initialState(), action: Actions = UnknownAction): State {
  switch (action.type) {
  case RECEIVE_CONFIG:
    action = action as ReceiveConfigAction;
    let graphs = new Map<string, types.Graph>();
    _.each(action.config.consoles, (console: types.Console, path: string) => {
      _.each(console.contents, (item: types.ConsoleContents, index: number) => {
        if (item.graph) {
          graphs.set(key(path, index), item.graph);
        }
      });
    });
    return { map: graphs };
  default:
    return state;
  }
}

export function key(consolePath: string, graphIndex: number): string {
  return consolePath + '#' + graphIndex;
}
