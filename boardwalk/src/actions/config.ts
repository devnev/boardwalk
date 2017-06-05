import * as config from '../types/config';

export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export type RECEIVE_CONFIG = typeof RECEIVE_CONFIG;

export interface Action {
  type: RECEIVE_CONFIG;
  config: config.Config;
}

export function receiveConfig(config: config.Config): Action {
  return {
    type: RECEIVE_CONFIG,
    config: config,
  };
}
