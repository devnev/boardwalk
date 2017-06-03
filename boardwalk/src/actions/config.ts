export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export type RECEIVE_CONFIG = typeof RECEIVE_CONFIG;

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
