// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import axios from 'axios';
import RangePicker from './range_controls.jsx';
import { FilterSelectControl } from './filter_controls.jsx';
import Section from './section.jsx';
import ConsoleNav from './nav.jsx';
import { ScaleProvider } from './scale_context.jsx';
import { GraphPanel } from './graph_panel.jsx';

class _Dashboard extends React.Component {
  componentDidMount() {
    this.props.onInitialize({duration: 60*60, end: new Date()});
  }
  render() {
    if (!this.props.range.duration || !this.props.range.end) {
      return false;
    }
    return (
      <Loader>
        <ConsoleNav />
        <ConsolePage />
      </Loader>
    );
  }
}
_Dashboard.propTypes = {
  onInitialize: React.PropTypes.func.isRequired,
};
const Dashboard = connect(
  (state) => ({
    range: state.range,
  }),
  (dispatch) => ({
    onInitialize: (range) => dispatch({
      type: 'INITIALIZE',
      range: range,
    }),
  })
)(_Dashboard);
export { Dashboard as default };

class _Loader extends React.Component {
  componentDidMount() {
    this.req = axios.get("/config.json");
    this.req.then((response) => this.props.onConfigLoaded(response.data));
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
  }
  render() {
    if (!this.props.loaded) {
      return <p>Loading config...</p>;
    }
    return <div>{this.props.children}</div>;
  }
}
_Loader.propTypes = {
  loaded: React.PropTypes.bool.isRequired,
  onConfigLoaded: React.PropTypes.func.isRequired,
};
const Loader = connect(
  (state) => ({
    loaded: !!state.config,
  }),
  (dispatch) => ({
    onConfigLoaded: (config) => dispatch({
      type: 'RECEIVE_CONFIG',
      config: config,
    }),
    onInitialize: (range) => dispatch({
      type: 'INITIALIZE',
      range: range,
    }),
  })
)(_Loader);

class _ConsolePage extends React.Component {
  render() {
    const config = this.props.config;
    const title = config ? config.title : "Console Not Found";
    const console = config ? <Console key={this.props.console} /> : false;
    return (
      <div>
        <h1>{title}</h1>
        <ScaleProvider>
          <div>
            <RangePicker />
            <FilterSelectControl />
            {console}
          </div>
        </ScaleProvider>
      </div>
    );
  }
}
_ConsolePage.propTypes = {
  console: React.PropTypes.string.isRequired,
  config: React.PropTypes.object.isRequired,
};
const ConsolePage = connect(
  (state) => ({
    console: state.console,
    config: state.config.consoles[state.console],
  })
)(_ConsolePage);

class _Console extends React.Component {
  _renderItem(index) {
    let item = this.props.contents[index];
    if (item.graph) {
      return (
        <GraphPanel
          key={index}
          index={index}
          graph={item.graph} />
      );
    } else if (item.section) {
      return (
        <Section
          key={index}
          index={index}
          title={item.section.title}
          links={item.section.links} />
      );
    }
  }
  render() {
    return (
      <div>
        {this.props.contents.map((item, index) => this._renderItem(index))}
      </div>
    );
  }
}
_Console.propTypes = {
  contents: React.PropTypes.array.isRequired,
};
const Console = connect(
  (state) => ({
    contents: state.config.consoles[state.console].contents,
  })
)(_Console);
