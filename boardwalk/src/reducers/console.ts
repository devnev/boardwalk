import * as router from 'react-router-redux';
import { UnknownAction } from '../actions';
import { SelectConsoleAction, SELECT_CONSOLE } from '../actions/console';

export interface State {
  path: string;
}

function initialState(): State {
  return {
    path: '',
  };
}

type Actions = router.LocationChangeAction|SelectConsoleAction|UnknownAction;

export function reducer(state: State = initialState(), action: Actions = UnknownAction): State {
  switch (action.type) {
  case router.LOCATION_CHANGE: {
    action = action as router.LocationChangeAction;
    let {pathname} = action.payload;
    return {
      path: pathname.replace(/\/+$/, ''),
    };
  }
  case SELECT_CONSOLE: {
    action = action as SelectConsoleAction;
    return {
      path: action.console,
    };
  }
  default:
    return state;
  }
}
