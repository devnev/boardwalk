import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import * as reducers from './reducers';

const store = createStore(reducers.reducer, applyMiddleware(...reducers.middleware));

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={reducers.history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
