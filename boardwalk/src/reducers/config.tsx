export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export type RECEIVE_CONFIG = typeof RECEIVE_CONFIG;

export type OtherAction = { type: '' };
export const OtherAction: OtherAction = { type: '' };

export interface Action {
  type: RECEIVE_CONFIG;
  config: string;
}

export function receiveConfig(config: string): Action {
  return {
    type: RECEIVE_CONFIG,
    config: config,
  };
}

export interface State {
  config: string;
}

function initialState(): State {
  return {
    config: '',
  };
}

export function reducer(state: State = initialState(), action: Action|OtherAction = OtherAction): State {
  switch (action.type) {
    case RECEIVE_CONFIG:
      return { config: action.config };
    default:
      return state;
  }
}
