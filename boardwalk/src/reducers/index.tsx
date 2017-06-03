import { combineReducers } from 'redux';
import * as config from './config';

export const reducer = combineReducers({
  config: config.reducer,
});

export interface State {
  config: config.State;
}
