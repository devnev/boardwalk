import * as React from 'react';
import * as components from './components';
import './App.css';

const logo = require('./logo.svg');

class App extends React.Component<{}, null> {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <components.TimePicker step={10} end={new Date()} onPickEnd={() => undefined}/>
      </div>
    );
  }
}

export default App;
