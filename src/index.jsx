// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import ReactDOM from 'react-dom';
import { Dispatcher } from './dispatch.jsx';
import App from './app.jsx';

Dispatcher.enable();
ReactDOM.render(<App />, document.getElementById('boardwalk-app'));
