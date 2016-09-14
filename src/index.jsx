// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';  // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { hashHistory } from 'react-router';
import Dashboard from './dashboard.jsx';
import { store } from './reducers.js';
import { syncScaleWithStore } from './time_scale.jsx';

syncHistoryWithStore(hashHistory, store);
syncScaleWithStore(store);

ReactDOM.render(<Provider store={store}><Dashboard /></Provider>, document.getElementById('boardwalk-app'));
