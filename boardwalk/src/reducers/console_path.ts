import * as router from 'react-router-redux';
import { UnknownAction } from '../actions';
import { SelectConsoleAction, SELECT_CONSOLE } from '../actions/console';

export type State = string;

type Actions = router.LocationChangeAction|SelectConsoleAction|UnknownAction;

export function reducer(state: State = '', action: Actions = UnknownAction): State {
  switch (action.type) {
  case router.LOCATION_CHANGE: {
    action = action as router.LocationChangeAction;
    const {pathname} = action.payload;
    return pathname.replace(/\/+$/, '');
  }
  case SELECT_CONSOLE: {
    action = action as SelectConsoleAction;
    return action.console;
  }
  default:
    return state;
  }
}
