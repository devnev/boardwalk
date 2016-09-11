// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import _ from 'underscore';
import React from 'react';
import Plottable from 'plottable';
import { ColorScale } from './dispatch.jsx';

export class QueryCaptions {
  constructor() {
    this.nearest = new Plottable.Dataset();
    this.dataset = new Plottable.Dataset();
    this.sources = [];
  }
  target(targetTime) {
    if (!targetTime) {
      this.nearest.data([]);
      this.dataset.data(this.sources.map(function(dataset) {
        return {caption: dataset.metadata().title, value: ""};
      }));
      this._target = undefined;
      return;
    }

    var points = [];
    var values = [];
    this.sources.forEach(function(dataset) {
      var data = dataset.data();
      if (data.length == 0 || data[0].t > targetTime) {
        values.push({caption: dataset.metadata().title, value: ""});
        return;
      }
      var index = _.sortedIndex(data, {t: targetTime}, 't');
      if (!(index < data.length && data[index].t === targetTime)) {
        index -= 1;
      }
      var point = data[index];
      points.push(_({caption: dataset.metadata().title}).assign(point));
      values.push({caption: dataset.metadata().title, value: point.y});
    }.bind(this));
    _.defer(function() {
      this.nearest.data(points);
      this.dataset.data(values);
    }.bind(this));
    this._target = targetTime;
  }
  setSources(datasets) {
    this.sources = datasets || [];
    this.target(this._target);
  }
}

export class QueryKey extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(function(item, index) {
          var caption = item.caption;
          var value = item.value;
          var colorStyle = {color: ColorScale.scale(caption)};
          return (<li key={caption+index}>
            <span style={colorStyle}>&#x25cf;</span>
            <span>{caption}</span>
            <span>{value}</span>
          </li>);
        }.bind(this))}
      </ul>
    );
  }
}
QueryKey.propTypes = {
  items: React.PropTypes.array.isRequired,
};
