import * as _ from 'underscore';
import * as redux from 'redux';
import * as history from 'history';
import * as queryString from 'query-string';
import { UnknownAction } from '../actions';
import * as console from '../actions/console';
import * as time from '../actions/time';
import * as filters from '../actions/filter';

const filterPrefix = 'filter.';

type Location = history.LocationDescriptorObject;

function setQueryParams(state: Location, params: object): Location|undefined {
  let qs = parseQueryParams(state);
  let modified = Object.assign({}, qs, params);
  Object.keys(modified).forEach((k) => {
    if (modified[k] === undefined) {
      delete modified[k];
    }
  });
  if (_.isEqual(qs, modified)) {
    return state;
  }
  return Object.assign({}, state, {
    search: '?' + queryString.stringify(modified),
  });
}

function parseQueryParams(location: Location): {[key: string]: string|string[]|undefined} {
  let qs = (location || {}).search || '';
  qs = (qs && qs[0] === '?') ? qs.substr(1) : qs;
  return queryString.parse(qs) as {[key: string]: string|string[]|undefined};
}

type Actions =
  console.SelectConsoleAction|
  time.ModifyTimeScaleAction|
  time.PickDurationAction|
  time.PickEndAction|
  filters.Action|
  UnknownAction;

export const locationMiddleware =
    (history: history.History) =>
    <S>({ dispatch, getState }: redux.MiddlewareAPI<S>) =>
    (next: redux.Dispatch<S>) =>
    (action: Actions): Actions => {
  switch (action.type) {
  case console.SELECT_CONSOLE:
    history.push({
      pathname: action.console,
      search: history.location.search,
    });
    return next(action);
  case time.MODIFY_TIME_SCALE: {
    const {start, end} = action;
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    const newLocation = setQueryParams(history.location, {
      duration: duration,
      end: Math.round(end.getTime() / 1000),
    });
    if (newLocation) {
      history.push(newLocation);
    }
    return next(action);
  }
  case time.PICK_DURATION: {
    const newLocation = setQueryParams(history.location, { duration: action.duration });
    if (newLocation) {
      history.push(newLocation);
    }
    return next(action);
  }
  case time.PICK_END: {
    const newLocation = setQueryParams(history.location, { end: Math.round(action.end.getTime() / 1000) });
    if (newLocation) {
      history.push(newLocation);
    }
    return next(action);
  }
  case filters.FILTER_CHANGE: {
    const qsFilters = {};
    _.each(action.filters, (value, name) => {
      var key = filterPrefix + name;
      if (value) {
        qsFilters[key] = value;
      } else {
        qsFilters[key] = undefined;
      }
    });
    const newLocation = setQueryParams(history.location, qsFilters);
    if (newLocation) {
      history.push(newLocation);
    }
    return next(action);
  }
  default:
    return next(action);
  }
};
