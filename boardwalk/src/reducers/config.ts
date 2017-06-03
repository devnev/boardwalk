import { UnknownAction } from '../actions';
import { Action, RECEIVE_CONFIG } from '../actions/config';

export interface State {
  config: string;
}

function initialState(): State {
  return {
    config: '',
  };
}

export function reducer(state: State = initialState(), action: Action|UnknownAction = UnknownAction): State {
  switch (action.type) {
    case RECEIVE_CONFIG:
      return { config: action.config };
    default:
      return state;
  }
}
