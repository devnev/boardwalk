// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import $ from 'jquery';
import RangePicker from './range_controls.jsx';
import FilterSelectControl from './filter_controls.jsx';
import Graph from './graph.jsx';
import Section from './section.jsx';
import { SetSubState } from './utils.jsx';
import { HashURI, TimeScale, ExpandedMetric, ExpandMetric } from './dispatch.jsx';
import { PanelWithKey } from './query_key.jsx';
import ConsoleNav from './nav.jsx';
import SelectorGraph from './selector_graph.jsx';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      console: "/",
    };
    this._navigate = this._navigate.bind(this);
  }
  componentWillMount() {
    HashURI.onUpdate(this._navigate, true);
    this.req = $.get("/config.json");
    this.req.done(function(data) { SetSubState(this, {config: data}); }.bind(this));
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    HashURI.offUpdate(this._navigate);
  }
  _navigate() {
    var console = HashURI.path().replace(/\/+$/, "");
    SetSubState(this, {console: console});
  }
  render() {
    if (!this.state.config) {
      return <p>Loading config...</p>;
    }
    var console = this.state.config.consoles[this.state.console];
    if (!console) {
      console = {
        title: "Console Not Found",
        selectors: [],
        contents: [],
      };
    }
    return (
      <div>
        <ConsoleNav consoles={this.state.config.consoles} />
        <h1>{console.title}</h1>
        <RangePicker />
        <FilterSelectControl
          selectors={console.selectors}
          time={Math.floor(TimeScale.range().end.getTime()/1000)} />
        <Console
          key={this.state.console}
          items={console.contents}
          expandMetric={ExpandMetric.bind(null, this.state.console)} />
      </div>
    );
  }
}
Dashboard.propTypes = {};

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredTime: null,
    };
    this._setHoverTime = this._setHoverTime.bind(this);
    this._forceUpdate = this._forceUpdate.bind(this);
  }
  _forceUpdate() {
    this.forceUpdate();
  }
  componentDidMount() {
    ExpandedMetric.onUpdate(this._forceUpdate);
  }
  componentWillUnmount() {
    ExpandedMetric.offUpdate(this._forceUpdate);
  }
  render() {
    var targetTime = this.state.hoveredTime;
    if (!targetTime) {
      targetTime = TimeScale.scale().domainMax();
    }
    return (
      <div>
        {this.props.items.map(function(item, index) {
          var expand = {};
          if (index === ExpandedMetric.graphIndex) {
            expand = ExpandedMetric;
          }
          if (item.graph) {
            return (
              <GraphPanel
                key={index}
                graph={item.graph}
                expand={expand}
                onHoverTime={this._setHoverTime}
                expandMetric={this.props.expandMetric.bind(null, index)}
                highlightTime={targetTime} />
            );
          } else if (item.section) {
            return (
              <Section
                key={index}
                title={item.section.title}
                links={item.section.links} />
            );
          }
        }.bind(this))}
      </div>
    );
  }
  _setHoverTime(hoveredTime) {
    SetSubState(this, {hoveredTime: hoveredTime});
  }
}
Console.propTypes = {
  items: React.PropTypes.array.isRequired,
  expandMetric: React.PropTypes.func.isRequired,
};

class GraphPanel extends React.Component {
  _expandedQuery() {
    var query = this.props.graph.queries[this.props.expand.queryIndex];
    if (!query || !query.expanded) {
      return;
    }
    var options = query.expanded;
    options.match = query.match;
    return options;
  }
  render() {
    var expanded = this._expandedQuery();
    var graph;
    if (expanded) {
      graph = (
        <SelectorGraph
          query={expanded} />
      );
    } else {
      graph = (
        <Graph
          options={this.props.graph}
          onHoverTime={this.props.onHoverTime}
          expandMetric={this.props.expandMetric}
          highlightTime={this.props.highlightTime} />
      );
    }
    return <PanelWithKey>{graph}</PanelWithKey>;
  }
}
GraphPanel.propTypes = {
  graph: React.PropTypes.object,
  expand: React.PropTypes.object,
  onHoverTime: React.PropTypes.func.isRequired,
  expandMetric: React.PropTypes.func.isRequired,
  highlightTime: React.PropTypes.object.isRequired,
};
