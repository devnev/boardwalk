// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { LOCATION_CHANGE } from 'react-router-redux';

export function consoleReducer(state = "", action) {
  switch (action.type) {
    case LOCATION_CHANGE: {
      if (!action.payload) {
        return '';
      }
      let {pathname} = action.payload;
      return pathname.replace(/\/+$/, "");
    }
    case 'SELECT_CONSOLE': {
      return action.console;
    }
  }
  return state;
}
