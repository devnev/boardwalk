import { combineReducers } from 'redux';
import * as config from './config';
import * as filter from './filter';
import * as query_data from './query_data';
import * as range from './range';

export const reducer = combineReducers({
  config: config.reducer,
  filter: filter.reducer,
  query_data: query_data.reducer,
  range: range.reducer,
});

export interface State {
  config: config.State;
  filter: filter.State;
  query_data: query_data.State;
  range: range.State;
}
