import * as _ from 'underscore';
import * as router from 'react-router-redux';
import { UnknownAction } from '../actions';
import * as actions from '../actions/time';
import * as queryString from 'query-string';

export interface State {
  duration?: number;
  end?: Date;
}

type Actions =
  router.LocationChangeAction|
  actions.ModifyTimeScaleAction|
  actions.PickDurationAction|
  actions.PickEndAction|
  UnknownAction;

export function reducer(state: State = {}, action: Actions = UnknownAction): State {
  switch (action.type) {
  case router.LOCATION_CHANGE: {
    action = action as router.LocationChangeAction;
    const params = queryString.parse(action.payload.search) as {[key: string]: string|string[]|undefined};
    const durationParam = params.duration;
    const duration = Array.isArray(durationParam) ? durationParam[durationParam.length - 1] : durationParam;
    const endParam = params.end;
    const end = Array.isArray(endParam) ? endParam[endParam.length - 1] : endParam;
    let newState = { ...state, duration: 60 * 60, end: new Date() };
    if (duration && /^\d+$/.test(duration)) {
      newState.duration = Number(duration);
    }
    if (end && /^\d+$/.test(end)) {
      newState.end = new Date(Number(end) * 1000);
    }
    if (_.isEqual(state, newState)) {
      return state;
    }
    return newState;
  }
  case actions.MODIFY_TIME_SCALE: {
    action = action as actions.ModifyTimeScaleAction;
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
    action = action as actions.PickDurationAction;
    if (state.duration === action.duration) {
      return state;
    }
    return {
      ...state,
      duration: action.duration,
    };
  }
  case actions.PICK_END: {
    action = action as actions.PickEndAction;
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
