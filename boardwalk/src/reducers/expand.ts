import * as expand_actions from '../actions/expand';
import * as console_actions from '../actions/console';
import * as filter_actions from '../actions/filter';
import { UnknownAction } from '../actions';

export interface State {
  panelIndex?: number;
  queryIndex?: number;
  metricLabels?: {[label: string]: string};
}

type Actions =
  expand_actions.ExpandMetricAction|
  expand_actions.CollapseMetricAction|
  console_actions.SelectConsoleAction|
  filter_actions.Action|
  UnknownAction;

export function reducer(state: State = {}, action: Actions = UnknownAction): State {
  switch (action.type) {
  case console_actions.SELECT_CONSOLE:
    return {};
  case filter_actions.FILTER_CHANGE:
    return {};
  case expand_actions.COLLAPSE_METRIC:
    return {};
  case expand_actions.EXPAND_METRIC:
    return {
      panelIndex: action.panelIndex,
      queryIndex: action.queryIndex,
      metricLabels: action.metricLabels,
    };
  default:
    return state;
  }
}
