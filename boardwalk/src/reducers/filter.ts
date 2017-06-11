import * as _ from 'underscore';
import { Action as FilterChangeAction, FILTER_CHANGE } from '../actions/filter';
import { UnknownAction } from '../actions';
import { LOCATION_CHANGE, LocationChangeAction } from 'react-router-redux';
import * as queryString from 'query-string';

const filterPrefix = 'filter.';

export interface State {
  filters: { [label: string]: string };
}

export function initialState(): State {
  return {
    filters: {},
  };
}

type Actions = LocationChangeAction|FilterChangeAction|UnknownAction;

export function reducer(state: State = initialState(), action: Actions = UnknownAction): State {
  switch (action.type) {
    case LOCATION_CHANGE: {
      action = action as LocationChangeAction;
      const params = queryString.parse(action.payload.search) as {[key: string]: string|string[]|undefined};
      const filter = {};
      _.each(params, (values, key) => {
        if (key.startsWith(filterPrefix)) {
          let v = Array.isArray(values) ? values[values.length - 1] : values;
          filter[key.substr(filterPrefix.length)] = v;
        }
      });
      if (!_.isEqual(state.filters, filter)) {
        return {
          ...state,
          filters: filter,
        };
      }
      return state;
    }
    case FILTER_CHANGE:
      action = action as FilterChangeAction;
      let filters = { ...state.filters };
      _.each(action.filters, (value, label) => {
        if (value == null) {
          delete filters[label];
        } else {
          filters[label] = value;
        }
      });
      if (!_.isEqual(filters, state.filters)) {
        return {
          ...state,
          filters: filters,
        };
      }
      return state;
    default:
      return state;
  }
}
