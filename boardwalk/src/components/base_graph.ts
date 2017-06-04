// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.

import * as Plottable from 'plottable';

const selectRadius = 50;

function TimeForPoint(tAxis: Plottable.Axes.Time, tScale: Plottable.Scales.Time, point: Plottable.Point): Date {
  var position = point.x / tAxis.width();
  var timeWidth = tScale.domainMax().getTime() - tScale.domainMin().getTime();
  return new Date(tScale.domainMin().getTime() + timeWidth * position);
}

function NewDataPlot(
    tScale: Plottable.Scales.Time,
    yScale: Plottable.Scales.Linear,
    cScale: Plottable.Scales.Color): Plottable.Plots.Line<Date> {
  var plot = new Plottable.Plots.Line<Date>();
  plot.x((d: {t: Date}): Date => d.t, tScale);
  plot.y((d: {y: number}): number => d.y, yScale);
  plot.attr('stroke', (d: {}, i: {}, dataset: Plottable.Dataset): string => dataset.metadata().title, cScale);
  return plot;
}

function NewHighlightPlot(
    tScale: Plottable.Scales.Time,
    yScale: Plottable.Scales.Linear,
    cScale: Plottable.Scales.Color) {
  var plot = new Plottable.Plots.Scatter<Date, number>();
  plot.x((d: {t: Date}): Date => d.t, tScale);
  plot.y((d: {y: number}): number => d.y, yScale);
  plot.attr('fill', (d: {title: string}): string => d.title, cScale);
  plot.size(10);
  plot.autorangeMode('none');
  return plot;
}

export interface GraphInfo {
    guideline: Plottable.Components.GuideLineLayer<{}>;
    highlight: Plottable.Plots.Scatter<Date, number>;
    dataplot: Plottable.Plots.Line<Date>;
    graph: Plottable.Components.Table;
}

export function SetupGraph(
    timeScale: Plottable.Scales.Time,
    colorScale: Plottable.Scales.Color,
    onHoverTime: (d?: Date, p?: Plottable.Point) => void,
    onDoubleClick: (d: Date, p: Plottable.Point, s: Plottable.Plots.IPlotEntity|undefined) => void) {
  // axes and scales
  let tAxis = new Plottable.Axes.Time(timeScale, 'bottom');
  tAxis.axisConfigurations(DEFAULT_TIME_AXIS_CONFIGURATIONS);
  let yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  let yAxis = new Plottable.Axes.Numeric(yScale, 'left');
  yAxis.formatter(Plottable.Formatters.siSuffix());
  yAxis.usesTextWidthApproximation(true);

  // the graph
  let guideline = new Plottable.Components.GuideLineLayer(
    Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
  ).scale(timeScale);
  let plot = NewDataPlot(timeScale, yScale, colorScale);
  let highlight = NewHighlightPlot(timeScale, yScale, colorScale);
  let panel = new Plottable.Components.Group([guideline, plot, highlight]);
  let graph = new Plottable.Components.Table([[yAxis, panel], [null, tAxis]]);

  // interactions
  let panZoom = new Plottable.Interactions.PanZoom(timeScale);
  panZoom.attachTo(panel);
  let pointer = new Plottable.Interactions.Pointer();
  pointer.onPointerMove((point: Plottable.Point): void => onHoverTime(TimeForPoint(tAxis, timeScale, point), point));
  pointer.onPointerExit((): void => onHoverTime());
  pointer.attachTo(panel);
  let click = new Plottable.Interactions.Click();
  click.onDoubleClick(function(point: Plottable.Point) {
    const nearest = plot.entityNearest(point);
    let selected;
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
const DEFAULT_TIME_AXIS_CONFIGURATIONS = [
  [
      { interval: Plottable.TimeInterval.second, step: 1, formatter: Plottable.Formatters.time('%H:%M:%S') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 5, formatter: Plottable.Formatters.time('%H:%M:%S') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 10, formatter: Plottable.Formatters.time('%H:%M:%S') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 15, formatter: Plottable.Formatters.time('%H:%M:%S') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.second, step: 30, formatter: Plottable.Formatters.time('%H:%M:%S') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 1, formatter: Plottable.Formatters.time('%H:%M') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 5, formatter: Plottable.Formatters.time('%H:%M') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 10, formatter: Plottable.Formatters.time('%H:%M') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 15, formatter: Plottable.Formatters.time('%H:%M') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.minute, step: 30, formatter: Plottable.Formatters.time('%H:%M') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 1, formatter: Plottable.Formatters.time('%H') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 3, formatter: Plottable.Formatters.time('%H') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 6, formatter: Plottable.Formatters.time('%H') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.hour, step: 12, formatter: Plottable.Formatters.time('%H') },
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%B %e, %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%a %e') },
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time('%B %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.day, step: 1, formatter: Plottable.Formatters.time('%e') },
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time('%B %Y') },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time('%B') },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 1, formatter: Plottable.Formatters.time('%b') },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 3, formatter: Plottable.Formatters.time('%b') },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.month, step: 6, formatter: Plottable.Formatters.time('%b') },
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1, formatter: Plottable.Formatters.time('%y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 5, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 25, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 50, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 100, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 200, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 500, formatter: Plottable.Formatters.time('%Y') },
  ],
  [
      { interval: Plottable.TimeInterval.year, step: 1000, formatter: Plottable.Formatters.time('%Y') },
  ],
];
