import * as _ from 'underscore';
import { Action, FILTER_CHANGE } from '../actions/filter';
import { UnknownAction } from '../actions';

export interface State {
  filters: { [label: string]: string };
}

function initialState(): State {
  return {
    filters: {},
  };
}

export function reducer(state: State = initialState(), action: Action|UnknownAction = UnknownAction): State {
  switch (action.type) {
    case FILTER_CHANGE:
      let filters = { ...state.filters };
      _.each(action.filters, (value, label) => {
        if (value == null) {
          delete filters[label];
        } else {
          filters[label] = value;
        }
      });
      if (!_.isEqual(filters, state.filters)) {
        return {filters: filters};
      }
      return state;
    default:
      return state;
  }
}
