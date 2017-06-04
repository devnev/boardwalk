export const EXPAND_METRIC = 'EXPAND_METRIC';
export type EXPAND_METRIC = typeof EXPAND_METRIC;

export interface ExpandMetricAction {
  type: EXPAND_METRIC;
  panelIndex: number;
  queryIndex: number;
  metricLabels: {[label: string]: string};
}

export const COLLAPSE_METRIC = 'COLLAPSE_METRIC';
export type COLLAPSE_METRIC = typeof COLLAPSE_METRIC;

export interface CollapseMetricAction {
  type: COLLAPSE_METRIC;
}
