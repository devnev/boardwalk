// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { UnknownAction } from '../actions';
import * as hover_action from '../actions/hover';

export interface State {
  time?: Date;
}

export function reducer(state: State = {}, action: hover_action.HoverAction|UnknownAction) {
  switch (action.type) {
  case 'HOVER':
    return {time: action.time};
  default:
    return state;
  }
}
