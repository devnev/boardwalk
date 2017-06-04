// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import * as React from 'react';
import { ScaleContext } from './scale_context';
import { QueryResult } from './query_set';

interface QueryKeyProps {
  series: QueryResult[];
  onSelectMetric: (queryIndex: number, metricLabels: {[label: string]: string}) => void;
}

export class QueryKey extends React.Component<QueryKeyProps, {}> {
  static contextTypes: React.ValidationMap<ScaleContext> = {
    colorScale: React.PropTypes.object.isRequired,
  };
  render(): JSX.Element {
    const renderItem = (item: QueryResult, index: number) => {
      const color = this.context.colorScale.scale(item.title);
      const select = () => this.props.onSelectMetric(item.queryIndex, item.metric);
      return (
        <li key={index + '-' + item.title}>
          <a onClick={select}>
            <span style={{color: color}}>&#x25cf;</span>
            <span>{item.title}</span>
            <span>{item.value}</span>
          </a>
        </li>
      );
    };
    return (
      <ul>
        {this.props.series.map(renderItem)}
      </ul>
    );
  }
}
