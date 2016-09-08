// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import $ from 'jquery';
import Plottable from 'plottable';
import RangePicker from './range_controls.jsx';
import FilterSelectControl from './filter_controls.jsx';
import GraphPanel from './graph.jsx';
import Section from './section.jsx';
import { SetSubState } from './utils.jsx';
import { HashURI, TimeScale } from './dispatch.jsx';
import ConsoleNav from './nav.jsx';

export default class App extends React.Component {
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
          items={console.contents} />
      </div>
    );
  }
}
App.propTypes = {};

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cScale: new Plottable.Scales.Color(),
      hoveredTime: null,
      selectedTime: null,
    };
    this._setHoverTime = this._setHoverTime.bind(this);
    this._setSelectedTime = this._setSelectedTime.bind(this);
  }
  _setHoverTime(hoveredTime) {
    SetSubState(this, {hoveredTime: hoveredTime});
  }
  _setSelectedTime(selectedTime) {
    SetSubState(this, {
      selectedTime: this.state.selectedTime ? null : selectedTime,
    });
  }
  render() {
    var targetTime = this.state.selectedTime;
    if (!targetTime) {
      targetTime = this.state.hoveredTime;
    }
    if (!targetTime) {
      targetTime = TimeScale.scale().domainMax();
    }
    return (
      <div>
        {this.props.items.map(function(item, index) {
          if (item.graph) {
            return (
              <GraphPanel 
                key={index}
                options={item.graph}
                cScale={this.state.cScale}
                onHoverTime={this._setHoverTime}
                onSelectTime={this._setSelectedTime}
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
}
Console.propTypes = {
  items: React.PropTypes.array.isRequired,
};
