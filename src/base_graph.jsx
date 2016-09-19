// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import Plottable from 'plottable';
import { TimeForPoint } from './utils.jsx';

const selectRadius = 50;

function NewDataPlot(tScale, yScale, cScale) {
  var plot = new Plottable.Plots.Line();
  plot.x(function(d) { return d.t; }, tScale);
  plot.y(function(d) { return d.y; }, yScale);
  plot.attr("stroke", function(d, i, dataset) { return dataset.metadata().title; }, cScale);
  return plot;
}

function NewHighlightPlot(tScale, yScale, cScale) {
  var plot = new Plottable.Plots.Scatter();
  plot.x(function(d) { return d.t; }, tScale);
  plot.y(function(d) { return d.y; }, yScale);
  plot.attr("fill", function(d) { return d.caption; }, cScale);
  plot.size(10);
  plot.autorangeMode("none");
  return plot;
}

export function SetupGraph(timeScale, colorScale, onHoverTime, onDoubleClick) {
  // axes and scales
  var tAxis = new Plottable.Axes.Time(timeScale, "bottom");
  tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
  var yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  var yAxis = new Plottable.Axes.Numeric(yScale, "left");
  yAxis.formatter(Plottable.Formatters.siSuffix());
  yAxis.usesTextWidthApproximation(true);

  // the graph
  var guideline = new Plottable.Components.GuideLineLayer(
    Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
  ).scale(timeScale);
  var plot = NewDataPlot(timeScale, yScale, colorScale);
  var highlight = NewHighlightPlot(timeScale, yScale, colorScale);
  var panel = new Plottable.Components.Group([guideline, plot, highlight]);
  var graph = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

  // interactions
  var panZoom = new Plottable.Interactions.PanZoom(timeScale, null);
  panZoom.attachTo(panel);
  var pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove(function(point) {
    onHoverTime(TimeForPoint(tAxis, timeScale, point), point);
  });
  pointer.onPointerExit(function() {
    onHoverTime();
  });
  pointer.attachTo(panel);
  var click = new Plottable.Interactions.DoubleClick();
  click.onDoubleClick(function(point) {
    var nearest = plot.entityNearest(point);
    var selected;
    if (nearest && Plottable.Utils.Math.distanceSquared(nearest.position, point) <= selectRadius) {
      selected = nearest;
    }
    onDoubleClick(TimeForPoint(tAxis, timeScale, point), point, selected);
  });
  click.attachTo(panel);

  return {
    guideline: guideline,
    highlight: highlight,
    dataplot: plot,
    graph: graph,
  };
}

// Copied from Plottable.Axes.Time's default configuration, changing clocks from 12h with 24h.
var DEFAULT_TIME_AXIS_CONFIGURATIONS = [
  [
      { interval: Plottable.TimeInterval.second, step: 1, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 5, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 10, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 15, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 30, formatter: Plottable.Formatters.time("%H:%M:%S") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 1, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 5, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 10, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 15, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 30, formatter: Plottable.Formatters.time("%H:%M") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 1, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 3, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 6, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 12, formatter: Plottable.Formatters.time("%H") },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%B %e, %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%a %e") },
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%B %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time("%e") },
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%B %Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%B") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time("%b") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 3, formatter: Plottable.Formatters.time("%b") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 6, formatter: Plottable.Formatters.time("%b") },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time("%y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 5, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 25, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 50, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 100, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 200, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 500, formatter: Plottable.Formatters.time("%Y") },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1000, formatter: Plottable.Formatters.time("%Y") },
  ],
];
