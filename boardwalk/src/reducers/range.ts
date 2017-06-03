import { UnknownAction } from '../actions';
import * as actions from '../actions/time';

export interface State {
  duration?: number;
  end?: Date;
}

type Actions = actions.ModifyTimeScaleAction|actions.PickDurationAction|actions.PickEndAction|UnknownAction;

export function reducer(state: State = {}, action: Actions = UnknownAction): State {
  switch (action.type) {
  case actions.MODIFY_TIME_SCALE: {
    let duration = Math.round((action.end.getTime() - action.start.getTime()) / 1000);
    if (state.duration === duration && state.end !== undefined && state.end.getTime() === action.end.getTime()) {
      return state;
    }
    return {
      ...state,
      duration: duration,
      end: action.end,
    };
  }
  case actions.PICK_DURATION: {
    if (state.duration === action.duration) {
      return state;
    }
    return {
      ...state,
      duration: action.duration,
    };
  }
  case actions.PICK_END: {
    if (state.end !== undefined && state.end.getTime() === action.end.getTime()) {
      return state;
    }
    return {
      ...state,
      end: action.end,
    };
  }
  default:
    return state;
  }
}
