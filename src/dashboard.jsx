// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import React from 'react';
import $ from 'jquery';
import RangePicker from './range_controls.jsx';
import FilterSelectControl from './filter_controls.jsx';
import Graph from './graph.jsx';
import Section from './section.jsx';
import { PanelWithKey } from './query_key.jsx';
import ConsoleNav from './nav.jsx';
import SelectorGraph from './selector_graph.jsx';
import { ScaleProvider } from './scale_context.jsx';
import { Provider as QueryStoreProvider } from './query_store.jsx';

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
    this.req = $.get("/config.json");
    this.req.done((data) => this.props.onConfigLoaded(data));
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
            <QueryStoreProvider>
              {console}
            </QueryStoreProvider>
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

class _GraphPanel extends React.Component {
  _expandedQuery() {
    if (this.props.expanded.panelIndex !== this.props.index) {
      return;
    }
    var query = this.props.graph.queries[this.props.expanded.queryIndex];
    if (!query || !query.expanded) {
      return;
    }
    var options = query.expanded;
    options.match = query.match;
    return options;
  }
  render() {
    var expanded = this._expandedQuery();
    var expand = this.props.expandMetric.bind(null, this.props.index);
    var graph;
    if (expanded) {
      graph = (
        <SelectorGraph
          query={expanded} />
      );
    } else {
      graph = (
        <Graph
          index={this.props.index}
          options={this.props.graph}
          expandMetric={expand} />
      );
    }
    return <PanelWithKey>{graph}</PanelWithKey>;
  }
}
_GraphPanel.propTypes = {
  index: React.PropTypes.number.isRequired,
  graph: React.PropTypes.object.isRequired,
  expanded: React.PropTypes.object.isRequired,
  expandMetric: React.PropTypes.func.isRequired,
};
const GraphPanel = connect(
  (state) => ({
    expanded: state.expanded,
  }),
  (dispatch) => ({
    expandMetric: (panelIndex, queryIndex, metricLabels) => dispatch({
      type: 'EXPAND_METRIC',
      panelIndex: panelIndex,
      queryIndex: queryIndex,
      metricLabels: metricLabels,
    }),
  })
)(_GraphPanel);