import { combineReducers } from 'redux';
import * as config from './config';
import * as filter from './filter';

export const reducer = combineReducers({
  config: config.reducer,
  filter: filter.reducer,
});

export interface State {
  config: config.State;
  filter: filter.State;
}
