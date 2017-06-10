import * as config from '../types/config';
import { UnknownAction } from '../actions';
import { Action, RECEIVE_CONFIG } from '../actions/config';

export interface State {
  config?: config.Config;
}

export function reducer(state: State = {}, action: Action|UnknownAction = UnknownAction): State {
  switch (action.type) {
    case RECEIVE_CONFIG:
      return { config: action.config };
    default:
      return state;
  }
}
