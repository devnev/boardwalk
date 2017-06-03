
export const FILTER_CHANGE = 'FILTER_CHANGE';
export type FILTER_CHANGE = typeof FILTER_CHANGE;

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
