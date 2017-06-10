import * as _ from 'underscore';
import { UnknownAction } from '../actions';
import { Console } from '../types/config';
import { Action as ReceiveConfigAction, RECEIVE_CONFIG } from '../actions/config';

export type State = Map<string, Console>;

type Actions = ReceiveConfigAction|UnknownAction;

export function reducer(state: State = new Map<string, Console>(), action: Actions = UnknownAction): State {
  switch (action.type) {
  case RECEIVE_CONFIG:
    const consoles = new Map<string, Console>();
    _.each(action.config.consoles, (console: Console, path: string) => {
      consoles.set(path, console);
    });
    return consoles;
  default:
    return state;
  }
}
