// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import React from 'react';
import { scale as timeScale } from '../time_scale.jsx';
import storeShape from 'react-redux/lib/utils/storeShape';
import Plottable from 'plottable';

const colorScale = new Plottable.Scales.Color();

export class ScaleProvider extends React.Component {
  getChildContext() {
    return {
      colorScale: colorScale,
      timeScale: timeScale,
    };
  }
  render() {
    return React.Children.only(this.props.children);
  }
}
ScaleProvider.contextTypes = {
  store: storeShape.isRequired,
};
ScaleProvider.childContextTypes = {
  timeScale: React.PropTypes.object.isRequired,
  colorScale: React.PropTypes.object.isRequired,
};
