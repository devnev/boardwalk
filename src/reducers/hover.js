// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

export function hoverReducer(state, action) {
  switch (action.type) {
    case 'HOVER':
      return {time: action.time};
  }
  return state ? state : {time: action.now};
}
