import * as config from '../types/config';

export const RECEIVE_CONFIG = 'RECEIVE_CONFIG';
export type RECEIVE_CONFIG = typeof RECEIVE_CONFIG;

export interface ReceiveConfigAction {
  type: RECEIVE_CONFIG;
  config: config.Config;
}

export function receiveConfig(config: config.Config): ReceiveConfigAction {
  return {
    type: RECEIVE_CONFIG,
    config: config,
  };
}

export const LOAD_CONFIG = 'LOAD_CONFIG';
export type LOAD_CONFIG = typeof LOAD_CONFIG;

export interface LoadConfigAction {
  type: LOAD_CONFIG;
  url: string;
}

export function loadConfig(url: string): LoadConfigAction {
  return {
    type: LOAD_CONFIG,
    url: url,
  };
}
