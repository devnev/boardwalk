import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { queryRequestMiddleware } from './reducers/query_data';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import * as reducers from './reducers';

const store = createStore(reducers.reducer, applyMiddleware(queryRequestMiddleware));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
