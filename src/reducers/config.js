// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

export function configReducer(state = null, action) {
  switch (action.type) {
    case 'RECEIVE_CONFIG': {
      return action.config;
    }
  }
  return state;
}
