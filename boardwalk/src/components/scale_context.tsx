import * as React from 'react';
import { scale as timeScale } from './time_scale';
import * as Plottable from 'plottable';

const colorScale = new Plottable.Scales.Color();

export interface ScaleContext {
  timeScale: Plottable.Scales.Time;
  colorScale: Plottable.Scales.Color;
}

export class ScaleProvider extends React.Component<{}, {}> implements React.ChildContextProvider<ScaleContext> {
  static chlidContextTypes: React.ValidationMap<ScaleContext> = {
    timeScale: React.PropTypes.object.isRequired,
    colorScale: React.PropTypes.object.isRequired,
  };
  getChildContext() {
    return {
      colorScale: colorScale,
      timeScale: timeScale,
    };
  }
  render(): JSX.Element {
    return React.Children.only(this.props.children);
  }
}
