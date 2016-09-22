// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

const initialExpandedState = { panelIndex: null, queryIndex: null, metricLabels: null };

export function expandedReducer(state = initialExpandedState, action) {
  switch (action.type) {
    case 'SELECT_CONSOLE': {
      return Object.assign({}, initialExpandedState);
    }
    case 'SET_FILTERS': {
      return Object.assign({}, initialExpandedState);
    }
    case 'EXPAND_METRIC': {
      return {
        panelIndex: action.panelIndex,
        queryIndex: action.queryIndex,
        metricLabels: action.metricLabels,
      };
    }
    case 'COLLAPSE_METRIC': {
      return Object.assign({}, initialExpandedState);
    }
  }
  return state;
}
