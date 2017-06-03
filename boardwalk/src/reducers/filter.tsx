import * as _ from 'underscore';

export const FILTER_CHANGE = 'FILTER_CHANGE';
export type FILTER_CHANGE = typeof FILTER_CHANGE;

export type OtherAction = { type: '' };
export const OtherAction: OtherAction = { type: '' };

export interface Action {
  type: FILTER_CHANGE;
  filters: { [label: string]: string | null; };
}

export function setLabelFilter(label: string, value: string): Action {
  return {
    type: FILTER_CHANGE,
    filters: {label: value},
  };
}

export function clearLabelFilter(label: string): Action {
  return {
    type: FILTER_CHANGE,
    filters: {label: null},
  };
}

export interface State {
  filters: { [label: string]: string };
}

function initialState(): State {
  return {
    filters: {},
  };
}

export function reducer(state: State = initialState(), action: Action|OtherAction = OtherAction): State {
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
