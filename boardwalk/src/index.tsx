import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import * as reducers from './reducers';
import { syncScaleWithStore } from './components/time_scale';
import * as components from './components';

const store = createStore(reducers.reducer, applyMiddleware(...reducers.middleware));
syncScaleWithStore(store);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={reducers.history}>
      <components.DashboardContainer />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
