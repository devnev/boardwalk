// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';  // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import { Dispatcher } from './dispatch.jsx';
import Dashboard from './dashboard.jsx';

Dispatcher.enable();
ReactDOM.render(<Dashboard />, document.getElementById('boardwalk-app'));
