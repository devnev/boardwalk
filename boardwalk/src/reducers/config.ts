import * as redux from 'redux';
import axios from 'axios';
import * as config from '../types/config';
import { UnknownAction } from '../actions';
import * as config_action from '../actions/config';
import * as config_types from '../types/config';

export interface State {
  config?: config.Config;
  loading: boolean;
}

type Actions = config_action.ReceiveConfigAction|config_action.LoadConfigAction|UnknownAction;

export function reducer(state: State = {loading: false}, action: Actions = UnknownAction): State {
  switch (action.type) {
  case config_action.RECEIVE_CONFIG:
    return { config: action.config, loading: false };
  case config_action.LOAD_CONFIG:
    return { config: state.config, loading: true };
  default:
    return state;
  }
}

interface MiddlewareState {
  config: State;
}

type MiddlewareActions = config_action.LoadConfigAction|UnknownAction;

export const middleware =
    <S extends MiddlewareState>({ dispatch, getState }: redux.MiddlewareAPI<S>) =>
    (next: redux.Dispatch<S>) =>
    (action: MiddlewareActions): MiddlewareActions => {
  switch (action.type) {
  case config_action.LOAD_CONFIG:
    const req = axios.get('config.json');
    req.then((response) => dispatch<config_action.ReceiveConfigAction>(config_action.receiveConfig(
      response.data as config_types.Config
    )));
    break;
  default:
  }
  return next(action);
};
