import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import $ from 'jquery';
import Plottable from 'plottable';
import RangePicker from './range_controls.jsx';
import { FilterSelectControl, FilterControl } from './filter_controls.jsx';
import GraphPanel from './graph.jsx';
import HashURIStore from './hash_uri.jsx';

function SetSubState(component, values) {
  var same = true;
  for (var key in values) {
    if (!_.has(values, key)) {
      continue;
    }
    if (!_.has(component.state, key)) {
      same = false;
      break;
    }
    if (component.state[key] !== values[key]) {
      same = false;
      break;
    }
    if (!_.isEqual(component.state[key], values[key])) {
      same = false;
      break;
    }
  }
  if (!same) {
    var state = _.clone(component.state);
    component.setState(_.assign(state, values));
  }
}

var hashURI = new HashURIStore();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      config: null,
      console: "/",
      range: {
        end: new Date(),
        duration: 1*60*60
      },
      tScale: new Plottable.Scales.Time(),
      filter: {},
    };
    this._updateRange = this._updateRange.bind(this);
    this._updateFilter = this._updateFilter.bind(this);
    this._navigate = this._navigate.bind(this);
  }
  componentWillMount() {
    hashURI.onUpdate(this._navigate, true);
    this.req = $.get("/config.json");
    this.req.done(function(data) { SetSubState(this, {config: data}); }.bind(this));
  }
  componentWillUnmount() {
    if (this.req) {
      this.req.abort();
    }
    hashURI.offUpdate(this._navigate);
  }
  componentWillUpdate(nextProps, nextState) {
    if (nextState.tScale !== this.state.tScale) {
      if (this.state.tScale) {
        this.state.tScale.offUpdate(this._setRangeFromScale);
      }
      if (nextState.tScale) {
        nextState.tScale.onUpdate(this._setRangeFromScale);
      }
    }
  }
  _setRangeFromScale() {
    var range = {
      end: this.state.tScale.domainMax(),
      duration: Math.floor((this.state.tScale.domainMax().getTime() - this.state.tScale.domainMin().getTime())/1000),
    };
    this._updateRange(range);
  }
  _setScaleFromRange() {
    var range = this.state.range;
    var start = new Date(range.end.getTime() - range.duration*1000);
    if (start.getTime() !== this.state.tScale.domainMin().getTime() ||
        range.end.getTime() !== this.state.tScale.domainMax().getTime()) {
      this.state.tScale.domain([start, range.end]);
    }
  }
  _updateRange(range) {
    SetSubState(this, {range: range});
  }
  _updateFilter(filter) {
    SetSubState(this, {filter: filter});
  }
  _navigate(hashURI) {
    SetSubState(this, {console: hashURI.path().replace(/\/+$/, "")});
  }
  render() {
    this._setScaleFromRange();
    if (!this.state.config) {
      return <p>Loading config...</p>
    }
    var console = this.state.config[this.state.console];
    if (!console) {
      console = {
        title: "Console Not Found",
        selectors: [],
        contents: [],
      };
    }
    return (
      <div>
        <ConsoleNav consoles={this.state.config} />
        <h1>{console.title}</h1>
        <RangePicker
          range={this.state.range}
          onChange={this._updateRange} />
        <FilterControl
          filter={this.state.filter}
          onChange={this._updateFilter} />
        <FilterSelectControl
          selectors={console.selectors}
          filter={this.state.filter}
          time={this.state.range.end.getTime()/1000}
          onChange={this._updateFilter} />
        <Console
          key={this.state.console}
          items={console.contents}
          filter={this.state.filter}
          tScale={this.state.tScale} />
      </div>
    );
  }
}
App.propTypes = {};

class ConsoleNav extends React.Component {
  render() {
    return (
      <nav><ul>
        {Object.keys(this.props.consoles || {}).map(function(path) {
          var console = this.props.consoles[path];
          return <li key={path}><a href={"#" + path}>{console.title}</a></li>;
        }.bind(this))}
      </ul></nav>
    );
  }
}
ConsoleNav.propTypes = {
  consoles: React.PropTypes.object.isRequired,
};

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cScale: new Plottable.Scales.Color(),
      hoveredTime: null,
      selectedTime: null,
    }
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
      targetTime = this.props.tScale.domainMax();
    }
    return (
      <div>
        {this.props.items.map(function(item, index) {
          if (item.graph) {
            return (
              <GraphPanel 
                key={index}
                options={item.graph}
                tScale={this.props.tScale}
                cScale={this.state.cScale}
                onHoverTime={this._setHoverTime}
                onSelectTime={this._setSelectedTime}
                highlightTime={targetTime}
                filter={this.props.filter} />
            );
          }
        }.bind(this))}
      </div>
    );
  }
}
Console.propTypes = {
  items: React.PropTypes.array.isRequired,
  filter: React.PropTypes.object.isRequired,
  tScale: React.PropTypes.object.isRequired,
};

ReactDOM.render(<App />, document.getElementById('content'));
